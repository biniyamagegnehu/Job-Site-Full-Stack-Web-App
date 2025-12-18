// src/main/java/com/jobportal/entity/JobSeeker.java
package com.jobportal.entity;

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

    @Column(name = "profile_headline")
    private String profileHeadline;

    @Column(name = "years_of_experience")
    private Integer yearsOfExperience;

    @OneToOne(mappedBy = "jobSeeker", cascade = CascadeType.ALL, orphanRemoval = true)
    private CV cv;

    @OneToMany(mappedBy = "jobSeeker", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<JobApplication> applications = new ArrayList<>();

    public JobSeeker() {
        // No constructor needed - role will be set when creating the object
    }
}