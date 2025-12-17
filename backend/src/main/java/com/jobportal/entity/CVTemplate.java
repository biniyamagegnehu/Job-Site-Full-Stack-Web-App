package com.jobportal.entity;

import jakarta.persistence.*;
import lombok.Getter;
import lombok.Setter;

@Entity
@Table(name = "cv_templates")
@Getter
@Setter
public class CVTemplate extends BaseEntity {
    
    @Column(nullable = false, unique = true)
    private String name;
    
    @Column(columnDefinition = "TEXT", nullable = false)
    private String htmlContent;
    
    @Column(columnDefinition = "TEXT")
    private String cssContent;
    
    @Column(columnDefinition = "TEXT")
    private String description;
    
    @Column(name = "is_active")
    private boolean isActive = true;
    
    @Column(name = "is_default")
    private boolean isDefault = false;
    
    @Column(name = "thumbnail_url")
    private String thumbnailUrl;
    
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "created_by_admin_id")
    private Admin createdBy;
}