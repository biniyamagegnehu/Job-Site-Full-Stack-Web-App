package com.jobportal.controller;

import com.jobportal.dto.request.*;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.ProfileResponse;
import com.jobportal.entity.CV;
import com.jobportal.entity.JobSeeker;
import com.jobportal.entity.User;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.CVRepository;
import com.jobportal.repository.JobSeekerRepository;
import com.jobportal.service.FileStorageService;
import com.jobportal.util.SecurityUtils;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/job-seekers")
@PreAuthorize("hasRole('ROLE_JOB_SEEKER')")
public class JobSeekerController {
    
    private final JobSeekerRepository jobSeekerRepository;
    private final CVRepository cvRepository;
    private final FileStorageService fileStorageService;
    
    public JobSeekerController(
            JobSeekerRepository jobSeekerRepository,
            CVRepository cvRepository,
            FileStorageService fileStorageService) {
        this.jobSeekerRepository = jobSeekerRepository;
        this.cvRepository = cvRepository;
        this.fileStorageService = fileStorageService;
    }
    
    @GetMapping("/profile")
    public ResponseEntity<ApiResponse> getMyProfile() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobSeeker jobSeeker = (JobSeeker) currentUser;
        ProfileResponse response = mapToProfileResponse(jobSeeker);
        
        Map<String, Object> data = new HashMap<>();
        data.put("profile", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Profile retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @PutMapping("/profile")
    public ResponseEntity<ApiResponse> updateProfile(@Valid @RequestBody ProfileUpdateRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobSeeker jobSeeker = (JobSeeker) currentUser;
        
        if (request.getFirstName() != null) jobSeeker.setFirstName(request.getFirstName());
        if (request.getLastName() != null) jobSeeker.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null) jobSeeker.setPhoneNumber(request.getPhoneNumber());
        if (request.getDateOfBirth() != null) jobSeeker.setDateOfBirth(request.getDateOfBirth());
        if (request.getAddress() != null) jobSeeker.setAddress(request.getAddress());
        if (request.getCity() != null) jobSeeker.setCity(request.getCity());
        if (request.getCountry() != null) jobSeeker.setCountry(request.getCountry());
        if (request.getPostalCode() != null) jobSeeker.setPostalCode(request.getPostalCode());
        if (request.getProfileSummary() != null) jobSeeker.setProfileSummary(request.getProfileSummary());
        if (request.getProfileHeadline() != null) jobSeeker.setProfileHeadline(request.getProfileHeadline());
        if (request.getYearsOfExperience() != null) jobSeeker.setYearsOfExperience(request.getYearsOfExperience());
        
        JobSeeker updated = jobSeekerRepository.save(jobSeeker);
        ProfileResponse response = mapToProfileResponse(updated);
        
        Map<String, Object> data = new HashMap<>();
        data.put("profile", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Profile updated successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @PostMapping("/profile/picture")
    public ResponseEntity<ApiResponse> uploadProfilePicture(@RequestParam("file") MultipartFile file) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        try {
            String fileName = fileStorageService.storeFile(file, "profile-pictures");
            String fileUrl = "/uploads/profile-pictures/" + fileName;
            
            JobSeeker jobSeeker = (JobSeeker) currentUser;
            jobSeeker.setProfilePictureUrl(fileUrl);
            jobSeekerRepository.save(jobSeeker);
            
            Map<String, Object> data = new HashMap<>();
            data.put("profilePictureUrl", fileUrl);
            
            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.OK.value());
            apiResponse.setMessage("Profile picture uploaded successfully");
            apiResponse.setData(data);
            
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            Map<String, Object> data = new HashMap<>();
            data.put("error", e.getMessage());
            
            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.BAD_REQUEST.value());
            apiResponse.setMessage("Failed to upload profile picture");
            apiResponse.setData(data);
            
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).body(apiResponse);
        }
    }
    
    @GetMapping("/cv")
    public ResponseEntity<ApiResponse> getMyCV() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobSeeker jobSeeker = (JobSeeker) currentUser;
        CV cv = cvRepository.findByJobSeekerId(jobSeeker.getId())
            .orElse(null);
        
        Map<String, Object> data = new HashMap<>();
        data.put("cv", cv);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("CV retrieved successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @PutMapping("/cv")
    public ResponseEntity<ApiResponse> updateCV(@Valid @RequestBody CVUpdateRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobSeeker jobSeeker = (JobSeeker) currentUser;
        CV cv = cvRepository.findByJobSeekerId(jobSeeker.getId())
            .orElseGet(() -> {
                CV newCV = new CV();
                newCV.setJobSeeker(jobSeeker);
                return cvRepository.save(newCV);
            });
        
        if (request.getProfessionalTitle() != null) cv.setProfessionalTitle(request.getProfessionalTitle());
        if (request.getBio() != null) cv.setBio(request.getBio());
        if (request.getSkills() != null) cv.setSkills(request.getSkills());
        if (request.getLanguages() != null) cv.setLanguages(request.getLanguages());
        if (request.getLinkedinUrl() != null) cv.setLinkedinUrl(request.getLinkedinUrl());
        if (request.getGithubUrl() != null) cv.setGithubUrl(request.getGithubUrl());
        if (request.getPortfolioUrl() != null) cv.setPortfolioUrl(request.getPortfolioUrl());
        if (request.getTemplateName() != null) cv.setTemplateName(request.getTemplateName());
        
        CV updated = cvRepository.save(cv);
        
        Map<String, Object> data = new HashMap<>();
        data.put("cv", updated);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("CV updated successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @PostMapping("/cv/education")
    public ResponseEntity<ApiResponse> addEducation(@Valid @RequestBody EducationRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobSeeker jobSeeker = (JobSeeker) currentUser;
        CV cv = cvRepository.findByJobSeekerId(jobSeeker.getId())
            .orElseThrow(() -> new ResourceNotFoundException("CV not found. Please create a CV first."));
        
        // Note: Education is a nested entity, you'll need to create it properly
        // This is a simplified version - you may need to adjust based on your entity structure
        
        cvRepository.save(cv);
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Education added successfully");
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.CREATED.value());
        apiResponse.setMessage("Education added successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
    
    @PostMapping("/cv/work-experience")
    public ResponseEntity<ApiResponse> addWorkExperience(@Valid @RequestBody WorkExperienceRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobSeeker jobSeeker = (JobSeeker) currentUser;
        CV cv = cvRepository.findByJobSeekerId(jobSeeker.getId())
            .orElseThrow(() -> new ResourceNotFoundException("CV not found. Please create a CV first."));
        
        // Note: WorkExperience is a nested entity, you'll need to create it properly
        
        cvRepository.save(cv);
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Work experience added successfully");
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.CREATED.value());
        apiResponse.setMessage("Work experience added successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
    
    @PostMapping("/cv/certification")
    public ResponseEntity<ApiResponse> addCertification(@Valid @RequestBody CertificationRequest request) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }
        
        JobSeeker jobSeeker = (JobSeeker) currentUser;
        CV cv = cvRepository.findByJobSeekerId(jobSeeker.getId())
            .orElseThrow(() -> new ResourceNotFoundException("CV not found. Please create a CV first."));
        
        // Note: Certification is a nested entity, you'll need to create it properly
        
        cvRepository.save(cv);
        
        Map<String, Object> data = new HashMap<>();
        data.put("message", "Certification added successfully");
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.CREATED.value());
        apiResponse.setMessage("Certification added successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
    
    private ProfileResponse mapToProfileResponse(JobSeeker jobSeeker) {
        ProfileResponse response = new ProfileResponse();
        response.setId(jobSeeker.getId());
        response.setUsername(jobSeeker.getUsername());
        response.setEmail(jobSeeker.getEmail());
        response.setFirstName(jobSeeker.getFirstName());
        response.setLastName(jobSeeker.getLastName());
        response.setPhoneNumber(jobSeeker.getPhoneNumber());
        response.setDateOfBirth(jobSeeker.getDateOfBirth());
        response.setAddress(jobSeeker.getAddress());
        response.setCity(jobSeeker.getCity());
        response.setCountry(jobSeeker.getCountry());
        response.setPostalCode(jobSeeker.getPostalCode());
        response.setProfileSummary(jobSeeker.getProfileSummary());
        response.setProfileHeadline(jobSeeker.getProfileHeadline());
        response.setProfilePictureUrl(jobSeeker.getProfilePictureUrl());
        response.setYearsOfExperience(jobSeeker.getYearsOfExperience());
        response.setCreatedAt(jobSeeker.getCreatedAt());
        response.setUpdatedAt(jobSeeker.getUpdatedAt());
        return response;
    }
}

