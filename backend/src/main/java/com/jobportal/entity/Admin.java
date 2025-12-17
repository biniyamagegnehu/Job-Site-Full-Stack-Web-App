package com.jobportal.entity;

import com.jobportal.util.UserRole;
import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@DiscriminatorValue("ADMIN")
@Getter
@Setter
public class Admin extends User {
    
    @Column(name = "admin_level")
    private String adminLevel = "STANDARD";
    
    public Admin() {
        this.setRole(UserRole.ROLE_ADMIN);  // This line was causing the error
    }
}