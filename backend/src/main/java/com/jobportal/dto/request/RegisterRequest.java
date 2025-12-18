package com.jobportal.dto.request;

import com.jobportal.util.UserRole;
import jakarta.validation.constraints.Email;
import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.Data;

@Data
public class RegisterRequest {
    
    @NotBlank(message = "Username is required")
    private String username;
    
    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;
    
    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;
    
    @NotBlank(message = "First name is required")
    private String firstName;
    
    @NotBlank(message = "Last name is required")
    private String lastName;
    
    private String phoneNumber;
    
    @NotBlank(message = "User type is required")
    private UserRole userType; // ROLE_JOB_SEEKER or ROLE_EMPLOYER
    
    // For Job Seeker (optional fields)
    private String address;
    private String city;
    private String country;
    
    // For Employer (optional fields)
    private String companyName;
    private String companyDescription;
    private String companyWebsite;
}