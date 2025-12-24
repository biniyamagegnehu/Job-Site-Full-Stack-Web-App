package com.jobportal.controller;

import com.jobportal.dto.response.AdminDashboardResponse;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.dto.response.UserResponse;
import com.jobportal.entity.Employer;
import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.*;
import com.jobportal.service.JobService;
import com.jobportal.util.SecurityUtils;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/admin")
@PreAuthorize("hasRole('ROLE_ADMIN')")
public class AdminController {

    private final UserRepository userRepository;
    private final JobSeekerRepository jobSeekerRepository;
    private final EmployerRepository employerRepository;
    private final JobRepository jobRepository;
    private final ApplicationRepository applicationRepository;
    private final JobService jobService;

    public AdminController(
            UserRepository userRepository,
            JobSeekerRepository jobSeekerRepository,
            EmployerRepository employerRepository,
            JobRepository jobRepository,
            ApplicationRepository applicationRepository,
            JobService jobService) {
        this.userRepository = userRepository;
        this.jobSeekerRepository = jobSeekerRepository;
        this.employerRepository = employerRepository;
        this.jobRepository = jobRepository;
        this.applicationRepository = applicationRepository;
        this.jobService = jobService;
    }

    @GetMapping("/dashboard")
    public ResponseEntity<ApiResponse> getDashboard() {
        AdminDashboardResponse dashboard = new AdminDashboardResponse();

        long totalUsers = userRepository.count();
        long totalJobSeekers = jobSeekerRepository.count();
        long totalEmployers = employerRepository.count();
        long totalJobs = jobRepository.count();
        long totalApplications = applicationRepository.count();
        long pendingEmployerApprovals = (long) employerRepository.findByApprovalStatus(Employer.ApprovalStatus.PENDING)
                .size();
        long activeJobs = jobRepository.countByIsActiveTrue();
        long inactiveJobs = totalJobs - activeJobs;

        dashboard.setTotalUsers(totalUsers);
        dashboard.setTotalJobSeekers(totalJobSeekers);
        dashboard.setTotalEmployers(totalEmployers);
        dashboard.setTotalJobs(totalJobs);
        dashboard.setTotalApplications(totalApplications);
        dashboard.setPendingEmployerApprovals(pendingEmployerApprovals);
        dashboard.setActiveJobs(activeJobs);
        dashboard.setInactiveJobs(inactiveJobs);

        // Applications by status
        Map<String, Long> applicationsByStatus = new HashMap<>();
        for (JobApplication.ApplicationStatus status : JobApplication.ApplicationStatus.values()) {
            applicationsByStatus.put(status.name(),
                    applicationRepository.countByStatus(status));
        }
        dashboard.setApplicationsByStatus(applicationsByStatus);

        // Jobs by type
        Map<String, Long> jobsByType = new HashMap<>();
        for (Job.JobType type : Job.JobType.values()) {
            jobsByType.put(type.name(), jobRepository.countByJobType(type));
        }
        dashboard.setJobsByType(jobsByType);

        Map<String, Object> data = new HashMap<>();
        data.put("dashboard", dashboard);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Dashboard data retrieved successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/users")
    public ResponseEntity<ApiResponse> getAllUsers(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) String role) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<User> users;

        if (role != null) {
            // Filter by role if provided
            users = userRepository.findAll(pageable);
        } else {
            users = userRepository.findAll(pageable);
        }

        List<UserResponse> userResponses = users.getContent().stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("users", userResponses);
        data.put("currentPage", users.getNumber());
        data.put("totalItems", users.getTotalElements());
        data.put("totalPages", users.getTotalPages());

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Users retrieved successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/employers/pending")
    public ResponseEntity<ApiResponse> getPendingEmployers() {
        List<Employer> pendingEmployers = employerRepository.findByApprovalStatus(
                Employer.ApprovalStatus.PENDING);

        List<UserResponse> employerResponses = pendingEmployers.stream()
                .map(this::mapToUserResponse)
                .collect(Collectors.toList());

        Map<String, Object> data = new HashMap<>();
        data.put("employers", employerResponses);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Pending employers retrieved successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/jobs/pending")
    public ResponseEntity<ApiResponse> getPendingJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<JobResponse> jobs = jobService.getAllPendingJobs(pageable);

        Map<String, Object> data = new HashMap<>();
        data.put("jobs", jobs.getContent());
        data.put("currentPage", jobs.getNumber());
        data.put("totalItems", jobs.getTotalElements());
        data.put("totalPages", jobs.getTotalPages());

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Pending jobs retrieved successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/jobs/{id}/approve")
    @SuppressWarnings("null")
    public ResponseEntity<ApiResponse> approveJob(@PathVariable long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        job.setActive(true);
        job.setApprovalStatus(Job.ApprovalStatus.APPROVED);
        jobRepository.save(job);

        JobResponse response = jobService.getJobById(id);

        Map<String, Object> data = new HashMap<>();
        data.put("job", response);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Job approved successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/employers/{id}/approve")
    @SuppressWarnings("null")
    public ResponseEntity<ApiResponse> approveEmployer(@PathVariable long id) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with id: " + id));

        employer.setApproved(true);
        employer.setApprovalStatus(Employer.ApprovalStatus.APPROVED);
        employerRepository.save(employer);

        Map<String, Object> data = new HashMap<>();
        data.put("employer", mapToUserResponse(employer));

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Employer approved successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/employers/{id}/reject")
    public ResponseEntity<ApiResponse> rejectEmployer(@PathVariable Long id) {
        Employer employer = employerRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Employer not found with id: " + id));

        employer.setApproved(false);
        employer.setApprovalStatus(Employer.ApprovalStatus.REJECTED);
        employerRepository.save(employer);

        Map<String, Object> data = new HashMap<>();
        data.put("employer", mapToUserResponse(employer));

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Employer rejected successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/jobs")
    public ResponseEntity<ApiResponse> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(required = false) Boolean isActive) {

        Pageable pageable = PageRequest.of(page, size, Sort.by("createdAt").descending());
        Page<JobResponse> jobs;

        if (isActive != null) {
            // Filter by active status
            jobs = jobService.getAllActiveJobs(pageable);
        } else {
            jobs = jobService.getAllActiveJobs(pageable);
        }

        Map<String, Object> data = new HashMap<>();
        data.put("jobs", jobs.getContent());
        data.put("currentPage", jobs.getNumber());
        data.put("totalItems", jobs.getTotalElements());
        data.put("totalPages", jobs.getTotalPages());

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Jobs retrieved successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/jobs/{id}/deactivate")
    public ResponseEntity<ApiResponse> deactivateJob(@PathVariable Long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        job.setActive(false);
        jobRepository.save(job);

        JobResponse response = jobService.getJobById(id);

        Map<String, Object> data = new HashMap<>();
        data.put("job", response);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Job deactivated successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/jobs/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<ApiResponse> deleteJob(@PathVariable long id) {
        Job job = jobRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));

        jobRepository.delete(job);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Job deleted successfully");

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/users/{id}/enable")
    @SuppressWarnings("null")
    public ResponseEntity<ApiResponse> enableUser(@PathVariable long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setEnabled(true);
        userRepository.save(user);

        Map<String, Object> data = new HashMap<>();
        data.put("user", mapToUserResponse(user));

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("User enabled successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/users/{id}/disable")
    @SuppressWarnings("null")
    public ResponseEntity<ApiResponse> disableUser(@PathVariable long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setEnabled(false);
        userRepository.save(user);

        Map<String, Object> data = new HashMap<>();
        data.put("user", mapToUserResponse(user));

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("User disabled successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/users/{id}/lock")
    @SuppressWarnings("null")
    public ResponseEntity<ApiResponse> lockUser(@PathVariable long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setLocked(true);
        userRepository.save(user);

        Map<String, Object> data = new HashMap<>();
        data.put("user", mapToUserResponse(user));

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("User locked successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @PatchMapping("/users/{id}/unlock")
    @SuppressWarnings("null")
    public ResponseEntity<ApiResponse> unlockUser(@PathVariable long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        user.setLocked(false);
        userRepository.save(user);

        Map<String, Object> data = new HashMap<>();
        data.put("user", mapToUserResponse(user));

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("User unlocked successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @DeleteMapping("/users/{id}")
    @SuppressWarnings("null")
    public ResponseEntity<ApiResponse> deleteUser(@PathVariable long id) {
        User user = userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found with id: " + id));

        userRepository.deleteById(id);

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("User deleted successfully");

        return ResponseEntity.ok(apiResponse);
    }

    private UserResponse mapToUserResponse(User user) {
        UserResponse response = new UserResponse();
        response.setId(user.getId());
        response.setUsername(user.getUsername());
        response.setEmail(user.getEmail());
        response.setFirstName(user.getFirstName());
        response.setLastName(user.getLastName());
        response.setPhoneNumber(user.getPhoneNumber());
        response.setRole(user.getRole());
        response.setEnabled(user.isEnabled());
        response.setLocked(user.isLocked());
        response.setCreatedAt(user.getCreatedAt());
        response.setUpdatedAt(user.getUpdatedAt());

        if (user instanceof Employer) {
            Employer employer = (Employer) user;
            response.setCompanyName(employer.getCompanyName());
            response.setApprovalStatus(employer.getApprovalStatus().name());
            response.setIsApproved(employer.isApproved());
        }

        return response;
    }
}
