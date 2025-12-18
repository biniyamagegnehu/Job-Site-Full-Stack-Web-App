// src/main/java/com/jobportal/exception/ResourceNotFoundException.java
package com.jobportal.exception;

public class ResourceNotFoundException extends RuntimeException {
    
    public ResourceNotFoundException(String message) {
        super(message);
    }
}