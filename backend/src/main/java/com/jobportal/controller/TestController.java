package com.jobportal.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping("/health")
    public String healthCheck() {
        return "Job Portal Backend is running successfully!";
    }
    
    @GetMapping("/test")
    public String testEndpoint() {
        return "Test endpoint working!";
    }
}