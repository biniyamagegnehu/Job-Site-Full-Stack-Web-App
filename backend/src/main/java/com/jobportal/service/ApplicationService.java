package com.jobportal.service;

import com.jobportal.dto.request.ApplicationRequest;
import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface ApplicationService {
    
    ApplicationResponse applyToJob(Long jobSeekerId, ApplicationRequest request);
    
    ApplicationResponse updateApplicationStatus(Long applicationId, Long employerId, JobApplication.ApplicationStatus status, String notes);
    
    ApplicationResponse getApplicationById(Long id);
    
    Page<ApplicationResponse> getApplicationsByJobSeeker(Long jobSeekerId, Pageable pageable);
    
    Page<ApplicationResponse> getApplicationsByJob(Long jobId, Long employerId, Pageable pageable);
    
    Page<ApplicationResponse> getApplicationsByEmployer(Long employerId, Pageable pageable);
    
    Page<ApplicationResponse> getApplicationsByStatus(Long jobSeekerId, JobApplication.ApplicationStatus status, Pageable pageable);
    
    void withdrawApplication(Long applicationId, Long jobSeekerId);
    
    boolean hasApplied(Long jobId, Long jobSeekerId);
}




