package com.jobportal.dto.response;

import com.jobportal.util.UserRole;
import lombok.Data;

import java.time.LocalDateTime;

@Data
public class UserResponse {
    
    private Long id;
    private String username;
    private String email;
    private String firstName;
    private String lastName;
    private String phoneNumber;
    private UserRole role;
    private boolean enabled;
    private boolean locked;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;
    
    // Employer specific fields
    private String companyName;
    private String approvalStatus;
    private Boolean isApproved;
}




