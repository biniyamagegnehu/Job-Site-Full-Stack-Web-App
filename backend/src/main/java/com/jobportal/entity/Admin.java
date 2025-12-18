// src/main/java/com/jobportal/entity/Admin.java
package com.jobportal.entity;

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
        // No constructor needed
    }
}