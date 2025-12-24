package com.jobportal.dto.request;

import com.jobportal.entity.Job;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.util.List;

@Data
public class JobRequest {
    
    @NotBlank(message = "Title is required")
    private String title;
    
    @NotBlank(message = "Description is required")
    private String description;
    
    private String requirements;
    
    private String responsibilities;
    
    private Job.JobType jobType;
    
    private Job.ExperienceLevel experienceLevel;
    
    private String location;
    
    private BigDecimal salaryMin;
    
    private BigDecimal salaryMax;
    
    private String salaryCurrency = "USD";
    
    private boolean isRemote = false;
    
    private LocalDate applicationDeadline;
    
    private Integer vacancies;
    
    private List<String> requiredSkills;
    
    private List<String> benefits;
}





