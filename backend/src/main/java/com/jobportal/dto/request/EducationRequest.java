package com.jobportal.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

import java.time.LocalDate;

@Data
public class EducationRequest {
    
    @NotBlank(message = "Institution is required")
    private String institution;
    
    @NotBlank(message = "Degree is required")
    private String degree;
    
    private String fieldOfStudy;
    private LocalDate startDate;
    private LocalDate endDate;
    private boolean isCurrent = false;
    private String description;
}





