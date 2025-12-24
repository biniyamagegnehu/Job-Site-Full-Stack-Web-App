package com.jobportal.dto.response;

import com.jobportal.entity.JobApplication;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class ApplicationResponse {

    private Long id;
    private Long jobId;
    private String jobTitle;
    private Long employerId;
    private String employerName;
    private String employerCompanyName;
    private Long jobSeekerId;
    private String jobSeekerName;
    private String coverLetter;
    private String cvFileUrl;
    private LocalDateTime applicationDate;
    private JobApplication.ApplicationStatus status;
    private String notes;
    private String applicantEmail;
    private Integer yearsOfExperience;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}
