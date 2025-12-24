package com.jobportal.util;

import com.fasterxml.jackson.annotation.JsonCreator;
import com.fasterxml.jackson.annotation.JsonValue;

public enum UserRole {
    ROLE_JOB_SEEKER,
    ROLE_EMPLOYER,
    ROLE_ADMIN;

    @JsonValue
    public String toValue() {
        return this.name();
    }

    @JsonCreator
    public static UserRole fromValue(String value) {
        if (value == null) return null;
        String v = value.trim();
        // Accept values like "EMPLOYER", "ROLE_EMPLOYER", "employer" (case-insensitive)
        v = v.toUpperCase();
        if (!v.startsWith("ROLE_")) {
            v = "ROLE_" + v;
        }
        for (UserRole r : values()) {
            if (r.name().equals(v)) return r;
        }
        throw new IllegalArgumentException("Unknown role: " + value);
    }
}