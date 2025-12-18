package com.jobportal.service.impl;

import com.jobportal.dto.request.JobRequest;
import com.jobportal.dto.response.JobResponse;
import com.jobportal.entity.Employer;
import com.jobportal.entity.Job;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.EmployerRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.service.JobService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
@Transactional
public class JobServiceImpl implements JobService {
    
    private final JobRepository jobRepository;
    private final EmployerRepository employerRepository;
    
    @Override
    public JobResponse createJob(Long employerId, JobRequest request) {
        Employer employer = employerRepository.findById(employerId)
            .orElseThrow(() -> new ResourceNotFoundException("Employer not found with id: " + employerId));
        
        if (!employer.isApproved()) {
            throw new IllegalStateException("Employer account must be approved to post jobs");
        }
        
        Job job = new Job();
        mapRequestToEntity(request, job);
        job.setEmployer(employer);
        
        Job savedJob = jobRepository.save(job);
        return mapEntityToResponse(savedJob);
    }
    
    @Override
    public JobResponse updateJob(Long jobId, Long employerId, JobRequest request) {
        Job job = jobRepository.findByIdAndEmployerId(jobId, employerId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Job not found with id: " + jobId + " for employer: " + employerId));
        
        mapRequestToEntity(request, job);
        Job updatedJob = jobRepository.save(job);
        return mapEntityToResponse(updatedJob);
    }
    
    @Override
    public void deleteJob(Long jobId, Long employerId) {
        Job job = jobRepository.findByIdAndEmployerId(jobId, employerId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Job not found with id: " + jobId + " for employer: " + employerId));
        
        jobRepository.delete(job);
    }
    
    @Override
    @Transactional(readOnly = true)
    public JobResponse getJobById(Long id) {
        Job job = jobRepository.findById(id)
            .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + id));
        
        return mapEntityToResponse(job);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getAllActiveJobs(Pageable pageable) {
        return jobRepository.findByIsActiveTrue(pageable)
            .map(this::mapEntityToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> getJobsByEmployer(Long employerId, Pageable pageable) {
        return jobRepository.findByEmployerId(employerId, pageable)
            .map(this::mapEntityToResponse);
    }
    
    @Override
    @Transactional(readOnly = true)
    public Page<JobResponse> searchJobs(
        String title,
        String location,
        Job.JobType jobType,
        Job.ExperienceLevel experienceLevel,
        java.math.BigDecimal minSalary,
        java.math.BigDecimal maxSalary,
        Boolean isRemote,
        Pageable pageable
    ) {
        return jobRepository.searchJobs(
            title, location, jobType, experienceLevel,
            minSalary, maxSalary, isRemote, pageable
        ).map(this::mapEntityToResponse);
    }
    
    @Override
    public JobResponse toggleJobStatus(Long jobId, Long employerId, boolean isActive) {
        Job job = jobRepository.findByIdAndEmployerId(jobId, employerId)
            .orElseThrow(() -> new ResourceNotFoundException(
                "Job not found with id: " + jobId + " for employer: " + employerId));
        
        job.setActive(isActive);
        Job updatedJob = jobRepository.save(job);
        return mapEntityToResponse(updatedJob);
    }
    
    private void mapRequestToEntity(JobRequest request, Job job) {
        job.setTitle(request.getTitle());
        job.setDescription(request.getDescription());
        job.setRequirements(request.getRequirements());
        job.setResponsibilities(request.getResponsibilities());
        job.setJobType(request.getJobType());
        job.setExperienceLevel(request.getExperienceLevel());
        job.setLocation(request.getLocation());
        job.setSalaryMin(request.getSalaryMin());
        job.setSalaryMax(request.getSalaryMax());
        job.setSalaryCurrency(request.getSalaryCurrency());
        job.setRemote(request.isRemote());
        job.setApplicationDeadline(request.getApplicationDeadline());
        job.setVacancies(request.getVacancies());
        
        if (request.getRequiredSkills() != null) {
            job.setRequiredSkills(request.getRequiredSkills());
        }
        if (request.getBenefits() != null) {
            job.setBenefits(request.getBenefits());
        }
    }
    
    private JobResponse mapEntityToResponse(Job job) {
        JobResponse response = new JobResponse();
        response.setId(job.getId());
        response.setTitle(job.getTitle());
        response.setDescription(job.getDescription());
        response.setRequirements(job.getRequirements());
        response.setResponsibilities(job.getResponsibilities());
        response.setJobType(job.getJobType());
        response.setExperienceLevel(job.getExperienceLevel());
        response.setLocation(job.getLocation());
        response.setSalaryMin(job.getSalaryMin());
        response.setSalaryMax(job.getSalaryMax());
        response.setSalaryCurrency(job.getSalaryCurrency());
        response.setRemote(job.isRemote());
        response.setActive(job.isActive());
        response.setApplicationDeadline(job.getApplicationDeadline());
        response.setVacancies(job.getVacancies());
        response.setRequiredSkills(job.getRequiredSkills());
        response.setBenefits(job.getBenefits());
        response.setEmployerId(job.getEmployer().getId());
        response.setEmployerName(job.getEmployer().getFirstName() + " " + job.getEmployer().getLastName());
        response.setEmployerCompanyName(job.getEmployer().getCompanyName());
        response.setCreatedAt(job.getCreatedAt());
        response.setUpdatedAt(job.getUpdatedAt());
        response.setApplicationCount((long) job.getApplications().size());
        return response;
    }
}

