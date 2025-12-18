package com.jobportal.controller;

import com.jobportal.dto.request.LoginRequest;
import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.AuthResponse;
import com.jobportal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    @Autowired
    private AuthService authService;
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        try {
            AuthResponse authResponse = authService.register(request);
            
            ApiResponse response = ApiResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(200)
                    .message("User registered successfully")
                    .data(authResponse)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (RuntimeException e) {
            ApiResponse response = ApiResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(400)
                    .message(e.getMessage())
                    .build();
            
            return ResponseEntity.badRequest().body(response);
        }
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        try {
            AuthResponse authResponse = authService.login(request);
            
            ApiResponse response = ApiResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(200)
                    .message("Login successful")
                    .data(authResponse)
                    .build();
            
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            ApiResponse response = ApiResponse.builder()
                    .timestamp(LocalDateTime.now())
                    .status(401)
                    .message("Invalid email or password")
                    .build();
            
            return ResponseEntity.status(401).body(response);
        }
    }
    
    @GetMapping("/me")
    public ResponseEntity<ApiResponse> getCurrentUser() {
        ApiResponse response = ApiResponse.builder()
                .timestamp(LocalDateTime.now())
                .status(200)
                .message("Current user endpoint - requires authentication")
                .data("You are authenticated!")
                .build();
        
        return ResponseEntity.ok(response);
    }
}