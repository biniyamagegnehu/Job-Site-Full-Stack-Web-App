package com.jobportal.controller;

import com.jobportal.dto.request.ApplicationRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.JobSeeker;
import com.jobportal.entity.User;
import com.jobportal.service.ApplicationService;
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

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/applications")
public class ApplicationController {
    
    private final ApplicationService applicationService;
    
    public ApplicationController(ApplicationService applicationService) {
        this.applicationService = applicationService;
    }
    
    @PostMapping
    @PreAuthorize("hasRole('ROLE_JOB_SEEKER')")
    public ResponseEntity<ApiResponse> applyToJob(@Valid @RequestBody ApplicationRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        // Check if already applied
        if (applicationService.hasApplied(request.getJobId(), currentUser.getId())) {
            Map<String, Object> data = new HashMap<>();
            data.put("message", "You have already applied to this job");
            
            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.BAD_REQUEST.value());
            apiResponse.setMessage("Duplicate application");
            apiResponse.setData(data);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        }
        
        ApplicationResponse response = applicationService.applyToJob(currentUser.getId(), request);
        
        Map<String, Object> data = new HashMap<>();
        data.put("application", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.CREATED.value());
        apiResponse.setMessage("Application submitted successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
    
    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse> getApplicationById(@PathVariable Long id) {
        ApplicationResponse response = applicationService.getApplicationById(id);
        
        Map<String, Object> data = new HashMap<>();
        data.put("application", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Application retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/my-applications")
    @PreAuthorize("hasRole('ROLE_JOB_SEEKER')")
    public ResponseEntity<ApiResponse> getMyApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size,
            @RequestParam(defaultValue = "applicationDate") String sortBy,
            @RequestParam(defaultValue = "DESC") String sortDir) {
        
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Sort sort = sortDir.equalsIgnoreCase("ASC") ? 
            Sort.by(sortBy).ascending() : Sort.by(sortBy).descending();
        Pageable pageable = PageRequest.of(page, size, sort);
        
        Page<ApplicationResponse> applications = applicationService.getApplicationsByJobSeeker(
            currentUser.getId(), pageable
        );
        
        Map<String, Object> data = new HashMap<>();
        data.put("applications", applications.getContent());
        data.put("currentPage", applications.getNumber());
        data.put("totalItems", applications.getTotalElements());
        data.put("totalPages", applications.getTotalPages());
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Applications retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/status/{status}")
    @PreAuthorize("hasRole('ROLE_JOB_SEEKER')")
    public ResponseEntity<ApiResponse> getApplicationsByStatus(
            @PathVariable JobApplication.ApplicationStatus status,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("applicationDate").descending());
        
        Page<ApplicationResponse> applications = applicationService.getApplicationsByStatus(
            currentUser.getId(), status, pageable
        );
        
        Map<String, Object> data = new HashMap<>();
        data.put("applications", applications.getContent());
        data.put("currentPage", applications.getNumber());
        data.put("totalItems", applications.getTotalElements());
        data.put("totalPages", applications.getTotalPages());
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Applications retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @DeleteMapping("/{id}")
    @PreAuthorize("hasRole('ROLE_JOB_SEEKER')")
    public ResponseEntity<ApiResponse> withdrawApplication(@PathVariable Long id) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        applicationService.withdrawApplication(id, currentUser.getId());
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Application withdrawn successfully");
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/job/{jobId}")
    @PreAuthorize("hasRole('ROLE_EMPLOYER')")
    public ResponseEntity<ApiResponse> getApplicationsByJob(
            @PathVariable Long jobId,
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("applicationDate").descending());
        
        Page<ApplicationResponse> applications = applicationService.getApplicationsByJob(
            jobId, currentUser.getId(), pageable
        );
        
        Map<String, Object> data = new HashMap<>();
        data.put("applications", applications.getContent());
        data.put("currentPage", applications.getNumber());
        data.put("totalItems", applications.getTotalElements());
        data.put("totalPages", applications.getTotalPages());
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Applications retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/employer/my-applications")
    @PreAuthorize("hasRole('ROLE_EMPLOYER')")
    public ResponseEntity<ApiResponse> getEmployerApplications(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size) {
        
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        Pageable pageable = PageRequest.of(page, size, Sort.by("applicationDate").descending());
        
        Page<ApplicationResponse> applications = applicationService.getApplicationsByEmployer(
            currentUser.getId(), pageable
        );
        
        Map<String, Object> data = new HashMap<>();
        data.put("applications", applications.getContent());
        data.put("currentPage", applications.getNumber());
        data.put("totalItems", applications.getTotalElements());
        data.put("totalPages", applications.getTotalPages());
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Applications retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @PatchMapping("/{id}/status")
    @PreAuthorize("hasRole('ROLE_EMPLOYER')")
    public ResponseEntity<ApiResponse> updateApplicationStatus(
            @PathVariable Long id,
            @RequestParam JobApplication.ApplicationStatus status,
            @RequestParam(required = false) String notes) {
        
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        ApplicationResponse response = applicationService.updateApplicationStatus(
            id, currentUser.getId(), status, notes
        );
        
        Map<String, Object> data = new HashMap<>();
        data.put("application", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Application status updated successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/check/{jobId}")
    @PreAuthorize("hasRole('ROLE_JOB_SEEKER')")
    public ResponseEntity<ApiResponse> checkApplication(@PathVariable Long jobId) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        boolean hasApplied = applicationService.hasApplied(jobId, currentUser.getId());
        
        Map<String, Object> data = new HashMap<>();
        data.put("hasApplied", hasApplied);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage(hasApplied ? "Already applied" : "Not applied");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
}

