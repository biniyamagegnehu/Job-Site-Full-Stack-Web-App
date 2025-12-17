package com.jobportal.entity;

import com.jobportal.util.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

import java.time.LocalDate;
import java.util.ArrayList;
import java.util.List;

@Entity
@DiscriminatorValue("JOB_SEEKER")
@Getter
@Setter
public class JobSeeker extends User {
    
    @Column(name = "date_of_birth")
    private LocalDate dateOfBirth;
    
    @Column(name = "address")
    private String address;
    
    @Column(name = "city")
    private String city;
    
    @Column(name = "country")
    private String country;
    
    @Column(name = "postal_code")
    private String postalCode;
    
    @Column(name = "profile_summary", columnDefinition = "TEXT")
    private String profileSummary;
    
    @Column(name = "profile_picture_url")
    private String profilePictureUrl;
    
    @OneToOne(mappedBy = "jobSeeker", cascade = CascadeType.ALL, orphanRemoval = true)
    private CV cv;
    
    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobApplication> applications = new ArrayList<>();
    
    public JobSeeker() {
        this.setRole(UserRole.ROLE_JOB_SEEKER);  // This line was causing the error
    }
}