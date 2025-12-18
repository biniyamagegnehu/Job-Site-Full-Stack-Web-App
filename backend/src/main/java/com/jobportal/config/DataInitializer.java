// src/main/java/com/jobportal/config/DataInitializer.java
package com.jobportal.config;

import com.jobportal.entity.*;
import com.jobportal.repository.UserRepository;
import com.jobportal.util.UserRole;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.crypto.password.PasswordEncoder;

@Configuration
public class DataInitializer {
    
    @Bean
    public CommandLineRunner initData(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            // Check if admin already exists
            if (userRepository.findByEmail("admin@jobportal.com").isEmpty()) {
                // Create admin user
                Admin admin = new Admin();
                admin.setEmail("admin@jobportal.com");
                admin.setUsername("admin");
                admin.setPassword(passwordEncoder.encode("admin123"));
                admin.setFirstName("System");
                admin.setLastName("Admin");
                admin.setPhoneNumber("+1234567890");
                admin.setRole(UserRole.ROLE_ADMIN);
                admin.setEnabled(true);
                admin.setLocked(false);
                
                userRepository.save(admin);
                System.out.println("Admin user created: admin@jobportal.com / admin123");
            }
            
            // Check if test job seeker exists
            if (userRepository.findByEmail("john.doe@email.com").isEmpty()) {
                JobSeeker jobSeeker = new JobSeeker();
                jobSeeker.setEmail("john.doe@email.com");
                jobSeeker.setUsername("johndoe");
                jobSeeker.setPassword(passwordEncoder.encode("password123"));
                jobSeeker.setFirstName("John");
                jobSeeker.setLastName("Doe");
                jobSeeker.setPhoneNumber("+1234567891");
                jobSeeker.setRole(UserRole.ROLE_JOB_SEEKER);
                jobSeeker.setEnabled(true);
                jobSeeker.setLocked(false);
                jobSeeker.setProfileHeadline("Senior Software Developer");
                jobSeeker.setYearsOfExperience(5);
                
                userRepository.save(jobSeeker);
                System.out.println("Job Seeker created: john.doe@email.com / password123");
            }
            
            // Check if test employer exists
            if (userRepository.findByEmail("techcorp@company.com").isEmpty()) {
                Employer employer = new Employer();
                employer.setEmail("techcorp@company.com");
                employer.setUsername("techcorp");
                employer.setPassword(passwordEncoder.encode("password123"));
                employer.setCompanyName("Tech Corporation");
                employer.setCompanyWebsite("https://techcorp.com");
                employer.setPhoneNumber("+1234567892");
                employer.setRole(UserRole.ROLE_EMPLOYER);
                employer.setEnabled(true);
                employer.setLocked(false);
                employer.setApproved(true);
                
                userRepository.save(employer);
                System.out.println("Employer created: techcorp@company.com / password123");
            }
            
            System.out.println("Test data initialization completed");
        };
    }
}