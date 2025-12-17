package com.jobportal.util;

public class AppConstants {
    
    // Security Constants
    public static final String[] PUBLIC_URLS = {
        "/api/v1/auth/**",
        "/api/v1/public/**",
        "/v3/api-docs/**",
        "/v3/api-docs.yaml",
        "/swagger-ui/**",
        "/swagger-ui.html",
        "/webjars/**",
        "/swagger-resources/**",
        "/h2-console/**"
    };
    
    // File Upload Constants
    public static final String CV_UPLOAD_DIR = "uploads/cvs/";
    public static final long MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
    public static final String[] ALLOWED_FILE_TYPES = {
        "application/pdf",
        "application/msword",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    };
    
    // Pagination
    public static final String DEFAULT_PAGE_NUMBER = "0";
    public static final String DEFAULT_PAGE_SIZE = "10";
    public static final String DEFAULT_SORT_BY = "id";
    public static final String DEFAULT_SORT_DIRECTION = "asc";
}