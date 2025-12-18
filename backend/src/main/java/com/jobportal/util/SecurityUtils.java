package com.jobportal.util;

import com.jobportal.entity.User;
import com.jobportal.repository.UserRepository;
import com.jobportal.security.UserPrincipal;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

@Component
public class SecurityUtils {
    
    private static UserRepository userRepository;
    
    @Autowired
    public void setUserRepository(UserRepository userRepository) {
        SecurityUtils.userRepository = userRepository;
    }
    
    public static Long getCurrentUserId() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        if (authentication != null && authentication.getPrincipal() instanceof UserPrincipal) {
            UserPrincipal userPrincipal = (UserPrincipal) authentication.getPrincipal();
            return userPrincipal.getId();
        }
        return null;
    }
    
    public static User getCurrentUser() {
        Long userId = getCurrentUserId();
        if (userId != null && userRepository != null) {
            return userRepository.findById(userId).orElse(null);
        }
        return null;
    }
    
    public static boolean isAuthenticated() {
        Authentication authentication = SecurityContextHolder.getContext().getAuthentication();
        return authentication != null && 
               authentication.isAuthenticated() && 
               !authentication.getName().equals("anonymousUser");
    }
}

