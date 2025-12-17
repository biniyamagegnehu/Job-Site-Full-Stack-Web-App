package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "cvs")
@Getter
@Setter
public class CV extends BaseEntity {
    
    @OneToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_seeker_id", nullable = false, unique = true)
    private JobSeeker jobSeeker;
    
    @Column(name = "professional_title")
    private String professionalTitle;
    
    @Column(name = "bio", columnDefinition = "TEXT")
    private String bio;
    
    @ElementCollection
    @CollectionTable(name = "cv_skills", joinColumns = @JoinColumn(name = "cv_id"))
    @Column(name = "skill")
    private List<String> skills = new ArrayList<>();
    
    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Education> educationHistory = new ArrayList<>();
    
    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<WorkExperience> workExperience = new ArrayList<>();
    
    @OneToMany(mappedBy = "cv", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Certification> certifications = new ArrayList<>();
    
    @Column(name = "languages")
    @ElementCollection
    @CollectionTable(name = "cv_languages", joinColumns = @JoinColumn(name = "cv_id"))
    private List<String> languages = new ArrayList<>();
    
    @Column(name = "linkedin_url")
    private String linkedinUrl;
    
    @Column(name = "github_url")
    private String githubUrl;
    
    @Column(name = "portfolio_url")
    private String portfolioUrl;
    
    @Column(name = "template_name")
    private String templateName = "default";
    
    @Column(name = "last_updated")
    private LocalDate lastUpdated;
    
    @PreUpdate
    protected void onUpdate() {
        lastUpdated = LocalDate.now();
    }
}

@Entity
@Table(name = "education")
@Getter
@Setter
class Education extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CV cv;
    
    @Column(nullable = false)
    private String institution;
    
    @Column(nullable = false)
    private String degree;
    
    @Column(name = "field_of_study")
    private String fieldOfStudy;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "is_current")
    private boolean isCurrent = false;
    
    @Column(columnDefinition = "TEXT")
    private String description;
}

@Entity
@Table(name = "work_experience")
@Getter
@Setter
class WorkExperience extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CV cv;
    
    @Column(nullable = false)
    private String company;
    
    @Column(nullable = false)
    private String position;
    
    @Column(name = "start_date")
    private LocalDate startDate;
    
    @Column(name = "end_date")
    private LocalDate endDate;
    
    @Column(name = "is_current")
    private boolean isCurrent = false;
    
    @Column(columnDefinition = "TEXT")
    private String description;
}

@Entity
@Table(name = "certifications")
@Getter
@Setter
class Certification extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "cv_id", nullable = false)
    private CV cv;
    
    @Column(nullable = false)
    private String name;
    
    @Column(name = "issuing_organization")
    private String issuingOrganization;
    
    @Column(name = "issue_date")
    private LocalDate issueDate;
    
    @Column(name = "expiration_date")
    private LocalDate expirationDate;
    
    @Column(name = "credential_id")
    private String credentialId;
    
    @Column(name = "credential_url")
    private String credentialUrl;
}