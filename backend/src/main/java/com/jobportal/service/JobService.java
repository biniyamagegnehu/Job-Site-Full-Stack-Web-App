package com.jobportal.service;

import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

public interface JobService {
    
    JobResponse createJob(Long employerId, JobRequest request);
    
    JobResponse updateJob(Long jobId, Long employerId, JobRequest request);
    
    void deleteJob(Long jobId, Long employerId);
    
    JobResponse getJobById(Long id);
    
    Page<JobResponse> getAllActiveJobs(Pageable pageable);
    
    Page<JobResponse> getJobsByEmployer(Long employerId, Pageable pageable);
    
    Page<JobResponse> searchJobs(
        String title,
        String location,
        Job.JobType jobType,
        Job.ExperienceLevel experienceLevel,
        java.math.BigDecimal minSalary,
        java.math.BigDecimal maxSalary,
        Boolean isRemote,
        Pageable pageable
    );
    
    JobResponse toggleJobStatus(Long jobId, Long employerId, boolean isActive);
}

