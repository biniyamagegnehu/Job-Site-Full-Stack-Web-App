package com.jobportal.service;

import com.jobportal.dto.request.LoginRequest;
import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.dto.response.AuthResponse;
import com.jobportal.entity.*;
import com.jobportal.repository.UserRepository;
import com.jobportal.util.UserRole;
import org.springframework.beans.factory.annotation.Autowired;
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
    
    @Autowired
    private AuthenticationManager authenticationManager;
    
    @Autowired
    private UserRepository userRepository;
    
    @Autowired
    private PasswordEncoder passwordEncoder;
    
    @Autowired
    private com.jobportal.security.JwtTokenProvider jwtTokenProvider;
    
    @Transactional
    public AuthResponse register(RegisterRequest request) {
        // Check if user already exists
        if (userRepository.existsByEmail(request.getEmail())) {
            throw new RuntimeException("Email is already registered");
        }
        
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new RuntimeException("Username is already taken");
        }
        
        // Create user based on type
        User user;
        
        if (request.getUserType() == UserRole.ROLE_JOB_SEEKER) {
            JobSeeker jobSeeker = new JobSeeker();
            jobSeeker.setUsername(request.getUsername());
            jobSeeker.setEmail(request.getEmail());
            jobSeeker.setPassword(passwordEncoder.encode(request.getPassword()));
            jobSeeker.setFirstName(request.getFirstName());
            jobSeeker.setLastName(request.getLastName());
            jobSeeker.setPhoneNumber(request.getPhoneNumber());
            jobSeeker.setRole(UserRole.ROLE_JOB_SEEKER);
            user = jobSeeker;
        } else if (request.getUserType() == UserRole.ROLE_EMPLOYER) {
            Employer employer = new Employer();
            employer.setUsername(request.getUsername());
            employer.setEmail(request.getEmail());
            employer.setPassword(passwordEncoder.encode(request.getPassword()));
            employer.setFirstName(request.getFirstName());
            employer.setLastName(request.getLastName());
            employer.setPhoneNumber(request.getPhoneNumber());
            employer.setRole(UserRole.ROLE_EMPLOYER);
            employer.setCompanyName(request.getCompanyName());
            employer.setCompanyDescription(request.getCompanyDescription());
            employer.setCompanyWebsite(request.getCompanyWebsite());
            employer.setApprovalStatus(Employer.ApprovalStatus.PENDING);
            employer.setApproved(false);
            user = employer;
        } else {
            throw new RuntimeException("Invalid user type");
        }
        
        user = userRepository.save(user);
        
        // Authenticate the user
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);
        
        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .issuedAt(LocalDateTime.now())
                .role(user.getRole())
                .email(user.getEmail())
                .firstName(user.getFirstName())
                .lastName(user.getLastName())
                .userId(user.getId())
                .username(user.getUsername())
                .build();
    }
    
    public AuthResponse login(LoginRequest request) {
        Authentication authentication = authenticationManager.authenticate(
            new UsernamePasswordAuthenticationToken(request.getEmail(), request.getPassword())
        );
        
        SecurityContextHolder.getContext().setAuthentication(authentication);
        String jwt = jwtTokenProvider.generateToken(authentication);
        
        com.jobportal.security.UserPrincipal userPrincipal = (com.jobportal.security.UserPrincipal) authentication.getPrincipal();
        
        return AuthResponse.builder()
                .accessToken(jwt)
                .tokenType("Bearer")
                .expiresIn(86400000L)
                .issuedAt(LocalDateTime.now())
                .role(userPrincipal.getUser().getRole())
                .email(userPrincipal.getUsername())
                .firstName(userPrincipal.getUser().getFirstName())
                .lastName(userPrincipal.getUser().getLastName())
                .userId(userPrincipal.getId())
                .username(userPrincipal.getUser().getUsername())
                .build();
    }
}