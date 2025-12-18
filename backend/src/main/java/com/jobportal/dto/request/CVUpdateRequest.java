package com.jobportal.dto.request;

import lombok.Data;

import java.util.List;

@Data
public class CVUpdateRequest {
    
    private String professionalTitle;
    private String bio;
    private List<String> skills;
    private List<String> languages;
    private String linkedinUrl;
    private String githubUrl;
    private String portfolioUrl;
    private String templateName;
}

