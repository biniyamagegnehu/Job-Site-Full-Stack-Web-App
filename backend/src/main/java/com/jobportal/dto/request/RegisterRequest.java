// src/main/java/com/jobportal/dto/request/RegisterRequest.java
package com.jobportal.dto.request;

import com.jobportal.util.UserRole;
import jakarta.validation.constraints.*;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RegisterRequest {

    @NotBlank(message = "Email is required")
    @Email(message = "Email should be valid")
    private String email;

    @NotBlank(message = "Username is required")
    @Size(min = 3, max = 20, message = "Username must be between 3 and 20 characters")
    @Pattern(regexp = "^[a-zA-Z0-9_]+$", message = "Username can only contain letters, numbers and underscores")
    private String username;

    @NotBlank(message = "Password is required")
    @Size(min = 6, message = "Password must be at least 6 characters")
    private String password;

    @NotNull(message = "Role is required")
    private UserRole role;

    // Common fields
    private String firstName;
    private String lastName;

    @Pattern(regexp = "^\\+?[1-9]\\d{1,14}$", message = "Phone number should be valid")
    private String phone;

    // Job Seeker specific
    private String profileHeadline;
    private Integer yearsOfExperience;

    // Employer specific
    private String companyName;
    private String companyWebsite;

    public boolean isJobSeeker() {
        return role == UserRole.ROLE_JOB_SEEKER; // Fix enum reference
    }

    public boolean isEmployer() {
        return role == UserRole.ROLE_EMPLOYER; // Fix enum reference
    }

    public boolean isAdmin() {
        return role == UserRole.ROLE_ADMIN; // Fix enum reference
    }
}