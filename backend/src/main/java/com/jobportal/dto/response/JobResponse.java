package com.jobportal.dto.response;

import com.jobportal.entity.Job;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Data
public class JobResponse {

    private Long id;
    private String title;
    private String description;
    private String requirements;
    private String responsibilities;
    private Job.JobType jobType;
    private Job.ExperienceLevel experienceLevel;
    private String location;
    private BigDecimal salaryMin;
    private BigDecimal salaryMax;
    private String salaryCurrency;
    private boolean isRemote;
    private boolean isActive;
    private Job.ApprovalStatus approvalStatus;
    private LocalDate applicationDeadline;
    private Integer vacancies;
    private List<String> requiredSkills;
    private List<String> benefits;
    private Long employerId;
    private String employerName;
    private String employerCompanyName;
    private String employerContactEmail;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    private Long applicationCount;
}
