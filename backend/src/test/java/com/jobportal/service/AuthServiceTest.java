package com.jobportal.service;

import com.jobportal.dto.request.RegisterRequest;
import com.jobportal.entity.Employer;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.JwtTokenProvider;
import com.jobportal.util.UserRole;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.mockito.ArgumentCaptor;
import org.mockito.Mock;
import org.mockito.MockitoAnnotations;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.crypto.password.PasswordEncoder;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.Mockito.*;

class AuthServiceTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private PasswordEncoder passwordEncoder;

    @Mock
    private AuthenticationManager authenticationManager;

    @Mock
    private JwtTokenProvider jwtTokenProvider;

    private AuthService authService;

    @BeforeEach
    void setup() {
        MockitoAnnotations.openMocks(this);
        authService = new AuthService(userRepository, passwordEncoder, authenticationManager, jwtTokenProvider);
    }

    @Test
    void register_employerShouldBePendingApproval() {
        RegisterRequest req = new RegisterRequest();
        req.setRole(UserRole.ROLE_EMPLOYER);
        req.setEmail("test@company.com");
        req.setUsername("testco");
        req.setPassword("pass");
        req.setCompanyName("TestCo");

        when(userRepository.existsByEmail(anyString())).thenReturn(false);
        when(userRepository.existsByUsername(anyString())).thenReturn(false);
        when(passwordEncoder.encode(anyString())).thenReturn("encoded");

        // Capture the saved user
        when(userRepository.save(any())).thenAnswer(invocation -> invocation.getArgument(0));

        var resp = authService.register(req);

        // Verify the saved user was an employer and is not approved
        ArgumentCaptor<com.jobportal.entity.User> captor = ArgumentCaptor.forClass(com.jobportal.entity.User.class);
        verify(userRepository).save(captor.capture());
        com.jobportal.entity.User saved = captor.getValue();
        assertTrue(saved instanceof Employer);
        Employer employer = (Employer) saved;
        assertFalse(employer.isApproved(), "Employer should not be approved by default");
        assertEquals(com.jobportal.entity.Employer.ApprovalStatus.PENDING, employer.getApprovalStatus());
    }
}
