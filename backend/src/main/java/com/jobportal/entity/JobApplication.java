package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDateTime;

@Entity
@Table(name = "job_applications",
       uniqueConstraints = {
           @UniqueConstraint(columnNames = {"job_id", "job_seeker_id"})
       })
@Getter
@Setter
public class JobApplication extends BaseEntity {
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_id", nullable = false)
    private Job job;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "job_seeker_id", nullable = false)
    private JobSeeker jobSeeker;
    
    @Column(name = "cover_letter", columnDefinition = "TEXT")
    private String coverLetter;
    
    @Column(name = "cv_file_url")
    private String cvFileUrl;
    
    @Column(name = "application_date", nullable = false)
    private LocalDateTime applicationDate;
    
    @Column(name = "status", nullable = false)
    @Enumerated(EnumType.STRING)
    private ApplicationStatus status = ApplicationStatus.PENDING;
    
    @Column(name = "notes", columnDefinition = "TEXT")
    private String notes;
    
    public enum ApplicationStatus {
        PENDING,
        REVIEWED,
        SHORTLISTED,
        REJECTED,
        ACCEPTED
    }
    
    @PrePersist
    protected void onCreate() {
        applicationDate = LocalDateTime.now();
    }
}