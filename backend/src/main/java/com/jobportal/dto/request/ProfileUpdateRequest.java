package com.jobportal.dto.request;

import lombok.Data;

import java.time.LocalDate;

@Data
public class ProfileUpdateRequest {
    
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private LocalDate dateOfBirth;
    private String address;
    private String city;
    private String country;
    private String postalCode;
    private String profileSummary;
    private String profileHeadline;
    private Integer yearsOfExperience;
}

