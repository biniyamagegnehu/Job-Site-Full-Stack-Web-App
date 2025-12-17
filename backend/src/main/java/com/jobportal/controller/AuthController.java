package com.jobportal.controller;

import com.jobportal.dto.request.LoginRequest;
import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.AuthResponse;
import jakarta.validation.Valid;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        // Temporary implementation - will be completed later
        AuthResponse authResponse = AuthResponse.builder()
                .email(request.getEmail())
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .role(request.getUserType())
                .tokenType("Bearer")
                .accessToken("dummy-token-until-implemented")
                .expiresIn(86400000L)
                .build();
        
        ApiResponse response = ApiResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(200)
                .message("Registration endpoint working (not fully implemented)")
                .data(authResponse)
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        // Temporary implementation
        ApiResponse response = ApiResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(200)
                .message("Login endpoint working (not fully implemented)")
                .data("Authentication will be implemented in next step")
                .build();
        
        return ResponseEntity.ok(response);
    }
    
    @GetMapping("/public-test")
    public ResponseEntity<String> publicTest() {
        return ResponseEntity.ok("Public auth endpoint - should be accessible without authentication");
    }
}