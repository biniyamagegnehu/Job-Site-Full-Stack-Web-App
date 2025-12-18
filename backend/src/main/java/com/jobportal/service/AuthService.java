// src/main/java/com/jobportal/service/AuthService.java
package com.jobportal.service;

import com.jobportal.dto.request.LoginRequest;
import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.dto.response.AuthResponse;
import com.jobportal.entity.User;
import com.jobportal.entity.JobSeeker;
import com.jobportal.entity.Employer;
import com.jobportal.exception.DuplicateResourceException;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtTokenProvider;
import com.jobportal.util.UserRole;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final AuthenticationManager authenticationManager;
    private final JwtTokenProvider jwtTokenProvider;
    
    @Value("${app.jwt.expiration-ms}")
    private int jwtExpirationMs;
    
    public AuthService(UserRepository userRepository, PasswordEncoder passwordEncoder,
                      AuthenticationManager authenticationManager, JwtTokenProvider jwtTokenProvider) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.authenticationManager = authenticationManager;
        this.jwtTokenProvider = jwtTokenProvider;
    }
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if email already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new DuplicateResourceException("Email already registered: " + request.getEmail());
        }
        
        // Validate username uniqueness
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new DuplicateResourceException("Username already taken: " + request.getUsername());
        }
        
        // Create user based on role
        User user = createUserFromRequest(request);
        
        // Save user
        User savedUser = userRepository.save(user);
        
        // Generate JWT token using email
        String token = jwtTokenProvider.generateToken(savedUser.getEmail());
        
        // Create AuthResponse
        AuthResponse response = new AuthResponse();
        response.setAccessToken(token);
        response.setTokenType("Bearer");
        response.setUserId(savedUser.getId());
        response.setEmail(savedUser.getEmail());
        response.setRole(savedUser.getRole());
        response.setUsername(savedUser.getUsername());
        response.setIssuedAt(LocalDateTime.now());
        response.setExpiresIn((long) jwtExpirationMs);
        
        return response;
    }
    
    private User createUserFromRequest(RegisterRequest request) {
        String encodedPassword = passwordEncoder.encode(request.getPassword());
        
        if (request.getRole() == UserRole.ROLE_JOB_SEEKER) {
            JobSeeker jobSeeker = new JobSeeker();
            jobSeeker.setEmail(request.getEmail());
            jobSeeker.setUsername(request.getUsername());
            jobSeeker.setPassword(encodedPassword);
            jobSeeker.setFirstName(request.getFirstName());
            jobSeeker.setLastName(request.getLastName());
            jobSeeker.setPhoneNumber(request.getPhone());
            jobSeeker.setRole(UserRole.ROLE_JOB_SEEKER);
            jobSeeker.setEnabled(true);
            jobSeeker.setLocked(false);
            jobSeeker.setProfileHeadline(request.getProfileHeadline());
            jobSeeker.setYearsOfExperience(request.getYearsOfExperience());
            return jobSeeker;
            
        } else if (request.getRole() == UserRole.ROLE_EMPLOYER) {
            Employer employer = new Employer();
            employer.setEmail(request.getEmail());
            employer.setUsername(request.getUsername());
            employer.setPassword(encodedPassword);
            employer.setCompanyName(request.getCompanyName());
            employer.setCompanyWebsite(request.getCompanyWebsite());
            employer.setPhoneNumber(request.getPhone());
            employer.setRole(UserRole.ROLE_EMPLOYER);
            employer.setEnabled(false);
            employer.setLocked(false);
            employer.setApproved(false);
            return employer;
            
        } else if (request.getRole() == UserRole.ROLE_ADMIN) {
            throw new IllegalArgumentException("Admin registration not allowed through public endpoint");
            
        } else {
            throw new IllegalArgumentException("Invalid role: " + request.getRole());
        }
    }
    
    public AuthResponse login(LoginRequest request) {
        try {
            // Authenticate user
            Authentication authentication = authenticationManager.authenticate(
                new UsernamePasswordAuthenticationToken(
                    request.getEmail(),
                    request.getPassword()
                )
            );
            
            SecurityContextHolder.getContext().setAuthentication(authentication);
            
            // Get user details
            User user = userRepository.findByEmail(request.getEmail())
                .orElseThrow(() -> new RuntimeException("User not found with email: " + request.getEmail()));
            
            // Check if user is enabled
            if (!user.isEnabled()) {
                throw new IllegalStateException("Account is disabled. Please contact administrator.");
            }
            
            // Check if user is locked
            if (user.isLocked()) {
                throw new IllegalStateException("Account is locked. Please contact administrator.");
            }
            
            // For employers, check if approved
            if (user.getRole() == UserRole.ROLE_EMPLOYER) {
                Employer employer = (Employer) user;
                if (!employer.isApproved()) {
                    throw new IllegalStateException("Employer account pending approval from administrator.");
                }
            }
            
            // Generate JWT token
            String token = jwtTokenProvider.generateToken(authentication);
            
            // Create AuthResponse
            AuthResponse response = new AuthResponse();
            response.setAccessToken(token);
            response.setTokenType("Bearer");
            response.setUserId(user.getId());
            response.setEmail(user.getEmail());
            response.setRole(user.getRole());
            response.setUsername(user.getUsername());
            response.setFirstName(user.getFirstName());
            response.setLastName(user.getLastName());
            response.setIssuedAt(LocalDateTime.now());
            response.setExpiresIn((long) jwtExpirationMs);
            
            return response;
                    
        } catch (org.springframework.security.authentication.BadCredentialsException e) {
            throw new RuntimeException("Invalid email or password");
        }
    }
    
    public boolean existsByEmail(String email) {
        return userRepository.existsByEmail(email);
    }
    
    public boolean existsByUsername(String username) {
        return userRepository.existsByUsername(username);
    }
}