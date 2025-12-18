// src/main/java/com/jobportal/controller/AuthController.java
package com.jobportal.controller;

import com.jobportal.dto.request.LoginRequest;
import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.dto.response.ApiResponse;
import com.jobportal.dto.response.AuthResponse;
import com.jobportal.service.AuthService;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDateTime;
import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/auth")
public class AuthController {
    
    private final AuthService authService;
    
    public AuthController(AuthService authService) {
        this.authService = authService;
    }
    
    @PostMapping("/register")
    public ResponseEntity<ApiResponse> register(@Valid @RequestBody RegisterRequest request) {
        AuthResponse response = authService.register(request);
        
        Map<String, Object> data = new HashMap<>();
        data.put("user", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.CREATED.value());
        apiResponse.setMessage("User registered successfully");
        apiResponse.setData(data);
        
        return ResponseEntity.status(HttpStatus.CREATED).body(apiResponse);
    }
    
    @PostMapping("/login")
    public ResponseEntity<ApiResponse> login(@Valid @RequestBody LoginRequest request) {
        AuthResponse response = authService.login(request);
        
        Map<String, Object> data = new HashMap<>();
        data.put("user", response);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage("Login successful");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/check-email/{email}")
    public ResponseEntity<ApiResponse> checkEmail(@PathVariable String email) {
        boolean exists = authService.existsByEmail(email);
        
        Map<String, Object> data = new HashMap<>();
        data.put("exists", exists);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage(exists ? "Email already registered" : "Email available");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
    
    @GetMapping("/check-username/{username}")
    public ResponseEntity<ApiResponse> checkUsername(@PathVariable String username) {
        boolean exists = authService.existsByUsername(username);
        
        Map<String, Object> data = new HashMap<>();
        data.put("exists", exists);
        
        ApiResponse apiResponse = new ApiResponse();
        apiResponse.setTimestamp(LocalDateTime.now());
        apiResponse.setStatus(HttpStatus.OK.value());
        apiResponse.setMessage(exists ? "Username already taken" : "Username available");
        apiResponse.setData(data);
        
        return ResponseEntity.ok(apiResponse);
    }
}