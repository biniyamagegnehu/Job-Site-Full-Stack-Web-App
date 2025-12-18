package com.jobportal.dto.response;

import lombok.Data;

import java.util.Map;

@Data
public class AdminDashboardResponse {
    
    private Long totalUsers;
    private Long totalJobSeekers;
    private Long totalEmployers;
    private Long totalJobs;
    private Long totalApplications;
    private Long pendingEmployerApprovals;
    private Long activeJobs;
    private Long inactiveJobs;
    private Map<String, Long> applicationsByStatus;
    private Map<String, Long> jobsByType;
}

