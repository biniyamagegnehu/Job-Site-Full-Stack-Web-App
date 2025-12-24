package com.jobportal.service.impl;

import com.jobportal.dto.request.ApplicationRequest;
import com.jobportal.dto.response.ApplicationResponse;
import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.entity.JobSeeker;
import com.jobportal.exception.DuplicateResourceException;
import com.jobportal.exception.ResourceNotFoundException;
import com.jobportal.repository.ApplicationRepository;
import com.jobportal.repository.JobRepository;
import com.jobportal.repository.JobSeekerRepository;
import com.jobportal.service.ApplicationService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@RequiredArgsConstructor
@Transactional
public class ApplicationServiceImpl implements ApplicationService {

    private final ApplicationRepository applicationRepository;
    private final JobRepository jobRepository;
    private final JobSeekerRepository jobSeekerRepository;

    @Override
    public ApplicationResponse applyToJob(Long jobSeekerId, ApplicationRequest request) {
        // Check if already applied
        if (applicationRepository.existsByJobIdAndJobSeekerId(request.getJobId(), jobSeekerId)) {
            throw new DuplicateResourceException("You have already applied to this job");
        }

        Job job = jobRepository.findById(request.getJobId())
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + request.getJobId()));

        if (!job.isActive()) {
            throw new IllegalStateException("Cannot apply to an inactive job");
        }

        JobSeeker jobSeeker = jobSeekerRepository.findById(jobSeekerId)
                .orElseThrow(() -> new ResourceNotFoundException("Job seeker not found with id: " + jobSeekerId));

        JobApplication application = new JobApplication();
        application.setJob(job);
        application.setJobSeeker(jobSeeker);
        application.setCoverLetter(request.getCoverLetter());
        application.setCvFileUrl(request.getCvFileUrl());
        application.setStatus(JobApplication.ApplicationStatus.PENDING);

        JobApplication savedApplication = applicationRepository.save(application);
        return mapEntityToResponse(savedApplication);
    }

    @Override
    public ApplicationResponse updateApplicationStatus(
            Long applicationId,
            Long employerId,
            JobApplication.ApplicationStatus status,
            String notes) {

        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        // Verify employer owns the job
        if (!application.getJob().getEmployer().getId().equals(employerId)) {
            throw new IllegalStateException("You don't have permission to update this application");
        }

        application.setStatus(status);
        application.setNotes(notes);

        JobApplication updatedApplication = applicationRepository.save(application);
        return mapEntityToResponse(updatedApplication);
    }

    @Override
    @Transactional(readOnly = true)
    public ApplicationResponse getApplicationById(Long id) {
        JobApplication application = applicationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + id));

        return mapEntityToResponse(application);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByJobSeeker(Long jobSeekerId, Pageable pageable) {
        return applicationRepository.findByJobSeekerId(jobSeekerId, pageable)
                .map(this::mapEntityToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByJob(Long jobId, Long employerId, Pageable pageable) {
        Job job = jobRepository.findById(jobId)
                .orElseThrow(() -> new ResourceNotFoundException("Job not found with id: " + jobId));

        if (!job.getEmployer().getId().equals(employerId)) {
            throw new IllegalStateException("You don't have permission to view applications for this job");
        }

        return applicationRepository.findByJobId(jobId, pageable)
                .map(this::mapEntityToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByEmployer(Long employerId, Pageable pageable) {
        return applicationRepository.findByEmployerId(employerId, pageable)
                .map(this::mapEntityToResponse);
    }

    @Override
    @Transactional(readOnly = true)
    public Page<ApplicationResponse> getApplicationsByStatus(
            Long jobSeekerId,
            JobApplication.ApplicationStatus status,
            Pageable pageable) {
        return applicationRepository.findByJobSeekerIdAndStatus(jobSeekerId, status, pageable)
                .map(this::mapEntityToResponse);
    }

    @Override
    public void withdrawApplication(Long applicationId, Long jobSeekerId) {
        JobApplication application = applicationRepository.findById(applicationId)
                .orElseThrow(() -> new ResourceNotFoundException("Application not found with id: " + applicationId));

        if (!application.getJobSeeker().getId().equals(jobSeekerId)) {
            throw new IllegalStateException("You don't have permission to withdraw this application");
        }

        if (application.getStatus() == JobApplication.ApplicationStatus.ACCEPTED) {
            throw new IllegalStateException("Cannot withdraw an accepted application");
        }

        applicationRepository.delete(application);
    }

    @Override
    @Transactional(readOnly = true)
    public boolean hasApplied(Long jobId, Long jobSeekerId) {
        return applicationRepository.existsByJobIdAndJobSeekerId(jobId, jobSeekerId);
    }

    private ApplicationResponse mapEntityToResponse(JobApplication application) {
        ApplicationResponse response = new ApplicationResponse();
        response.setId(application.getId());
        response.setJobId(application.getJob().getId());
        response.setJobTitle(application.getJob().getTitle());
        response.setEmployerId(application.getJob().getEmployer().getId());
        response.setEmployerName(
                application.getJob().getEmployer().getFirstName() + " " +
                        application.getJob().getEmployer().getLastName());
        response.setEmployerCompanyName(application.getJob().getEmployer().getCompanyName());
        response.setJobSeekerId(application.getJobSeeker().getId());
        response.setJobSeekerName(
                application.getJobSeeker().getFirstName() + " " +
                        application.getJobSeeker().getLastName());
        response.setCoverLetter(application.getCoverLetter());
        response.setCvFileUrl(application.getCvFileUrl());
        response.setApplicationDate(application.getApplicationDate());
        response.setStatus(application.getStatus());
        response.setNotes(application.getNotes());
        response.setApplicantEmail(application.getJobSeeker().getEmail());
        response.setYearsOfExperience(application.getJobSeeker().getYearsOfExperience());
        response.setCreatedAt(application.getCreatedAt());
        response.setUpdatedAt(application.getUpdatedAt());
        return response;
    }
}
