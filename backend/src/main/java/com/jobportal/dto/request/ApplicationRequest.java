package com.jobportal.dto.request;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

@Data
public class ApplicationRequest {
    
    @NotNull(message = "Job ID is required")
    private Long jobId;
    
    private String coverLetter;
    
    private String cvFileUrl;
}





