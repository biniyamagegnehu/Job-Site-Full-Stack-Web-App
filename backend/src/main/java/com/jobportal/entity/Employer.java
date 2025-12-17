package com.jobportal.entity;

import com.jobportal.util.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("EMPLOYER")
@Getter
@Setter
public class Employer extends User {
    
    @Column(name = "company_name", nullable = false)
    private String companyName;
    
    @Column(name = "company_description", columnDefinition = "TEXT")
    private String companyDescription;
    
    @Column(name = "company_website")
    private String companyWebsite;
    
    @Column(name = "company_logo_url")
    private String companyLogoUrl;
    
    @Column(name = "company_size")
    private String companySize;
    
    @Column(name = "industry")
    private String industry;
    
    @Column(name = "is_approved", nullable = false)
    private boolean isApproved = false;
    
    @Column(name = "approval_status")
    @Enumerated(EnumType.STRING)
    private ApprovalStatus approvalStatus = ApprovalStatus.PENDING;
    
    @OneToMany(mappedBy = "employer", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Job> jobs = new ArrayList<>();
    
    public enum ApprovalStatus {
        PENDING,
        APPROVED,
        REJECTED
    }
    
    public Employer() {
        this.setRole(UserRole.ROLE_EMPLOYER);  // This line was causing the error
    }
}