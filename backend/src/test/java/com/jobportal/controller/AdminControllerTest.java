package com.jobportal.controller;

import com.jobportal.dto.response.AdminDashboardResponse;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.entity.Employer;
import com.jobportal.entity.Job;
import com.jobportal.entity.JobApplication;
import com.jobportal.repository.*;
import com.jobportal.service.JobService;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.Collections;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AdminControllerTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private JobSeekerRepository jobSeekerRepository;

    @Mock
    private EmployerRepository employerRepository;

    @Mock
    private JobRepository jobRepository;

    @Mock
    private ApplicationRepository applicationRepository;

    @Mock
    private JobService jobService;



    private AdminController adminController;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        adminController = new AdminController(userRepository, jobSeekerRepository, employerRepository, jobRepository,
                applicationRepository, jobService);
    }

    @Test
    void dashboardShouldReturnCorrectCounts() {
        when(userRepository.count()).thenReturn(10L);
        when(jobSeekerRepository.count()).thenReturn(6L);
        when(employerRepository.count()).thenReturn(3L);
        when(jobRepository.count()).thenReturn(20L);
        when(jobRepository.countByIsActiveTrue()).thenReturn(15L);
        when(applicationRepository.count()).thenReturn(50L);
        when(employerRepository.findByApprovalStatus(Employer.ApprovalStatus.PENDING))
                .thenReturn(Collections.emptyList());
        when(applicationRepository.countByStatus(JobApplication.ApplicationStatus.PENDING)).thenReturn(30L);
        when(jobRepository.countByJobType(Job.JobType.FULL_TIME)).thenReturn(12L);

        ResponseEntity<ApiResponse> resp = adminController.getDashboard();
        assertEquals(200, resp.getStatusCodeValue());
        ApiResponse body = resp.getBody();
        assertNotNull(body);
        AdminDashboardResponse dash = (AdminDashboardResponse) ((java.util.Map) body.getData()).get("dashboard");
        assertEquals(10L, dash.getTotalUsers());
        assertEquals(15L, dash.getActiveJobs());
        assertEquals(5L, dash.getInactiveJobs());
        assertEquals(30L,
                dash.getApplicationsByStatus().get(JobApplication.ApplicationStatus.PENDING.name()).longValue());
        assertEquals(12L, dash.getJobsByType().get(Job.JobType.FULL_TIME.name()).longValue());
    }
}
