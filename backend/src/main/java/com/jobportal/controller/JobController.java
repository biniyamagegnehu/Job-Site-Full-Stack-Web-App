package com.jobportal.controller;

import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.entity.Employer;
import com.jobportal.entity.Job;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.EmployerRepository;
import com.jobportal.service.JobService;
import com.jobportal.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/jobs")
public class JobController {
    
    private final JobService jobService;
    private final EmployerRepository employerRepository;
    
    public JobController(JobService jobService, EmployerRepository employerRepository) {
        this.jobService = jobService;
        this.employerRepository = employerRepository;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_EMPLOYER')")
    public ResponseEntity<ApiResponse> createJob(@Valid @RequestBody JobRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof Employer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobResponse response = jobService.createJob(currentUser.getId(), request);
        
        Map<String, Object> data = new HashMap<>();
        data.put("job", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.CREATED.value());
        apiResponse.setMessage("Job created successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
    
    @PutMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_EMPLOYER')")
    public ResponseEntity<ApiResponse> updateJob(
            @PathVariable Long id,
            @Valid @RequestBody JobRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof Employer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobResponse response = jobService.updateJob(id, currentUser.getId(), request);
        
        Map<String, Object> data = new HashMap<>();
        data.put("job", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Job updated successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_EMPLOYER')")
    public ResponseEntity<ApiResponse> deleteJob(@PathVariable Long id) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof Employer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        jobService.deleteJob(id, currentUser.getId());
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Job deleted successfully");
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getJobById(@PathVariable Long id) {
        JobResponse response = jobService.getJobById(id);
        
        Map<String, Object> data = new HashMap<>();
        data.put("job", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Job retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping
    public ResponseEntity<ApiResponse> getAllJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? 
            Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<JobResponse> jobs = jobService.getAllActiveJobs(pageable);
        
        Map<String, Object> data = new HashMap<>();
        data.put("jobs", jobs.getContent());
        data.put("currentPage", jobs.getNumber());
        data.put("totalItems", jobs.getTotalElements());
        data.put("totalPages", jobs.getTotalPages());
        data.put("hasNext", jobs.hasNext());
        data.put("hasPrevious", jobs.hasPrevious());
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Jobs retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/search")
    public ResponseEntity<ApiResponse> searchJobs(
            @RequestParam(required = false) String title,
            @RequestParam(required = false) String location,
            @RequestParam(required = false) Job.JobType jobType,
            @RequestParam(required = false) Job.ExperienceLevel experienceLevel,
            @RequestParam(required = false) BigDecimal minSalary,
            @RequestParam(required = false) BigDecimal maxSalary,
            @RequestParam(required = false) Boolean isRemote,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? 
            Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<JobResponse> jobs = jobService.searchJobs(
            title, location, jobType, experienceLevel,
            minSalary, maxSalary, isRemote, pageable
        );
        
        Map<String, Object> data = new HashMap<>();
        data.put("jobs", jobs.getContent());
        data.put("currentPage", jobs.getNumber());
        data.put("totalItems", jobs.getTotalElements());
        data.put("totalPages", jobs.getTotalPages());
        data.put("hasNext", jobs.hasNext());
        data.put("hasPrevious", jobs.hasPrevious());
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Jobs retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/employer/my-jobs")
    @PreAuthorize("hasRole('ROLE_EMPLOYER')")
    public ResponseEntity<ApiResponse> getMyJobs(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "createdAt") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof Employer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? 
            Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<JobResponse> jobs = jobService.getJobsByEmployer(currentUser.getId(), pageable);
        
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
    
    @PatchMapping("/{id}/toggle-status")
    @PreAuthorize("hasRole('ROLE_EMPLOYER')")
    public ResponseEntity<ApiResponse> toggleJobStatus(
            @PathVariable Long id,
            @RequestParam boolean isActive) {
        
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof Employer)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobResponse response = jobService.toggleJobStatus(id, currentUser.getId(), isActive);
        
        Map<String, Object> data = new HashMap<>();
        data.put("job", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Job status updated successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
}

