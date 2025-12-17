package com.jobportal.dto.response;

import com.jobportal.util.UserRole;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class AuthResponse {
    
    private String accessToken;
    private String tokenType;
    private Long expiresIn;
    private UserRole role;
    private String email;
    private String firstName;
    private String lastName;
    private Long userId;
}