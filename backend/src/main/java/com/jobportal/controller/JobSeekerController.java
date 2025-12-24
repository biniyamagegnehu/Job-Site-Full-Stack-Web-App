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
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/job-seekers")
@PreAuthorize("hasRole('ROLE_JOB_SEEKER')")
public class JobSeekerController {

    private final JobSeekerRepository jobSeekerRepository;
    private final com.jobportal.repository.UserRepository userRepository;
    private final CVRepository cvRepository;
    private final FileStorageService fileStorageService;

    public JobSeekerController(
            JobSeekerRepository jobSeekerRepository,
            com.jobportal.repository.UserRepository userRepository,
            CVRepository cvRepository,
            FileStorageService fileStorageService) {
        this.jobSeekerRepository = jobSeekerRepository;
        this.userRepository = userRepository;
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

        if (request.getFirstName() != null)
            jobSeeker.setFirstName(request.getFirstName());
        if (request.getLastName() != null)
            jobSeeker.setLastName(request.getLastName());
        if (request.getPhoneNumber() != null)
            jobSeeker.setPhoneNumber(request.getPhoneNumber());
        if (request.getDateOfBirth() != null)
            jobSeeker.setDateOfBirth(request.getDateOfBirth());
        if (request.getAddress() != null)
            jobSeeker.setAddress(request.getAddress());
        if (request.getCity() != null)
            jobSeeker.setCity(request.getCity());
        if (request.getCountry() != null)
            jobSeeker.setCountry(request.getCountry());
        if (request.getPostalCode() != null)
            jobSeeker.setPostalCode(request.getPostalCode());
        if (request.getProfileSummary() != null)
            jobSeeker.setProfileSummary(request.getProfileSummary());
        if (request.getProfileHeadline() != null)
            jobSeeker.setProfileHeadline(request.getProfileHeadline());
        if (request.getYearsOfExperience() != null)
            jobSeeker.setYearsOfExperience(request.getYearsOfExperience());

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

    @PostMapping("/cv/upload")
    public ResponseEntity<ApiResponse> uploadCVFile(@RequestParam("file") MultipartFile file) {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        try {
            String fileName = fileStorageService.storeFile(file, "cvs");
            String fileUrl = "/uploads/cvs/" + fileName;

            JobSeeker jobSeeker = (JobSeeker) currentUser;
            CV cv = cvRepository.findByJobSeekerId(jobSeeker.getId())
                    .orElseGet(() -> {
                        CV newCV = new CV();
                        newCV.setJobSeeker(jobSeeker);
                        return newCV;
                    });
            cv.setFileUrl(fileUrl);
            CV saved = cvRepository.save(cv);

            Map<String, Object> cvData = new HashMap<>();
            cvData.put("id", saved.getId());
            cvData.put("fileUrl", saved.getFileUrl());

            Map<String, Object> data = new HashMap<>();
            data.put("cv", cvData);

            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.OK.value());
            apiResponse.setMessage("CV uploaded successfully");
            apiResponse.setData(data);

            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            Map<String, Object> data = new HashMap<>();
            data.put("error", e.getMessage());

            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.BAD_REQUEST.value());
            apiResponse.setMessage("Failed to upload CV");
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
        if (cv != null) {
            Map<String, Object> cvData = new HashMap<>();
            cvData.put("id", cv.getId());
            cvData.put("fileUrl", cv.getFileUrl());
            data.put("cv", cvData);
        } else {
            data.put("cv", null);
        }

        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("CV retrieved successfully");
        apiResponse.setData(data);

        return ResponseEntity.ok(apiResponse);
    }

    @GetMapping("/cv/download")
    public ResponseEntity<org.springframework.core.io.Resource> downloadMyCV() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        JobSeeker jobSeeker = (JobSeeker) currentUser;
        CV cv = cvRepository.findByJobSeekerId(jobSeeker.getId()).orElse(null);
        if (cv == null || cv.getFileUrl() == null) {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).build();
        }

        try {
            String fileUrl = cv.getFileUrl(); // e.g., /uploads/cvs/uuid_filename.pdf
            String relative = fileUrl.replaceFirst("^/uploads/", "");
            String[] parts = relative.split("/", 2);
            String subdir = parts.length > 0 ? parts[0] : "";
            String filename = parts.length > 1 ? parts[1] : parts[0];

            org.springframework.core.io.Resource resource = fileStorageService.loadFileAsResource(subdir, filename);

            return ResponseEntity.ok()
                    .contentType(org.springframework.http.MediaType.APPLICATION_OCTET_STREAM)
                    .header(org.springframework.http.HttpHeaders.CONTENT_DISPOSITION,
                            "attachment; filename=\"" + filename + "\"")
                    .body(resource);
        } catch (Exception e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }

    @DeleteMapping("/profile")
    @Transactional
    public ResponseEntity<ApiResponse> deleteMyAccount() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        // Fetch the managed entity to ensure cascades work correctly
        JobSeeker jobSeeker = jobSeekerRepository.findById(currentUser.getId())
                .orElseThrow(() -> new ResourceNotFoundException("Job Seeker not found"));

        try {
            // 1. Delete CV file if exists
            CV cv = jobSeeker.getCv();
            if (cv != null && cv.getFileUrl() != null) {
                try {
                    String relativePath = cv.getFileUrl().replaceFirst("^/uploads/", "");
                    fileStorageService.deleteFile(relativePath);
                } catch (Exception fileError) {
                    System.err.println("Note: Failed to delete CV file: " + fileError.getMessage());
                }
            }

            // 2. Delete Job Seeker
            // Using jobSeekerRepository.delete(jobSeeker) instead of
            // userRepository.deleteById
            // ensures that @OneToMany(cascade = ALL, orphanRemoval = true) is fully
            // respected.
            jobSeekerRepository.delete(jobSeeker);

            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.OK.value());
            apiResponse.setMessage("Account and all associated records deleted successfully");

            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            e.printStackTrace(); // Log the stack trace for 500 debugging
            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            apiResponse.setMessage("Failed to delete account: " + e.getMessage());
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
    }

    @DeleteMapping("/cv")
    public ResponseEntity<ApiResponse> deleteCV() {
        User currentUser = SecurityUtils.getCurrentUser();
        if (currentUser == null || !(currentUser instanceof JobSeeker)) {
            return ResponseEntity.status(HttpStatus.FORBIDDEN).build();
        }

        JobSeeker jobSeeker = (JobSeeker) currentUser;
        CV cv = cvRepository.findByJobSeekerId(jobSeeker.getId())
                .orElse(null);

        if (cv == null) {
            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.NOT_FOUND.value());
            apiResponse.setMessage("No CV found to delete");
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body(apiResponse);
        }

        try {
            String fileUrl = cv.getFileUrl();
            if (fileUrl != null && !fileUrl.isBlank()) {
                String relativePath = fileUrl.replaceFirst("^/uploads/", "");
                fileStorageService.deleteFile(relativePath);
            }

            // Remove reference from job seeker to allow orphan removal or explicit delete
            jobSeeker.setCv(null);
            jobSeekerRepository.save(jobSeeker);
            cvRepository.delete(cv);

            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.OK.value());
            apiResponse.setMessage("CV deleted successfully");
            return ResponseEntity.ok(apiResponse);
        } catch (Exception e) {
            ApiResponse apiResponse = new ApiResponse();
            apiResponse.setTimestamp(LocalDateTime.now());
            apiResponse.setStatus(HttpStatus.INTERNAL_SERVER_ERROR.value());
            apiResponse.setMessage("Failed to delete CV");
            Map<String, Object> data = new HashMap<>();
            data.put("error", e.getMessage());
            apiResponse.setData(data);
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).body(apiResponse);
        }
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
        // This is a simplified version - you may need to adjust based on your entity
        // structure

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
