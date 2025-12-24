package com.jobportal.dto.response;

import lombok.Data;

import java.time.LocalDate;
import java.time.LocalDateTime;

@Data
public class ProfileResponse {
    
    private Long id;
    private String username;
    private String email;
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
    private String profilePictureUrl;
    private Integer yearsOfExperience;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
}





