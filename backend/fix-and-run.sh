#!/bin/bash
echo "=== Fixing and Running Job Portal ==="
echo ""

# Clean everything
echo "1. Cleaning project..."
mvn clean > /dev/null 2>&1
rm -rf target

# Create necessary directories
mkdir -p src/main/java/com/jobportal/util
mkdir -p src/main/java/com/jobportal/entity
mkdir -p src/main/java/com/jobportal/controller

# Create UserRole.java if it doesn't exist
if [ ! -f "src/main/java/com/jobportal/util/UserRole.java" ]; then
    echo "2. Creating UserRole.java..."
    cat > src/main/java/com/jobportal/util/UserRole.java << 'EOF'
package com.jobportal.util;

public enum UserRole {
    ROLE_JOB_SEEKER,
    ROLE_EMPLOYER,
    ROLE_ADMIN
}
EOF
fi

# Create TestController if it doesn't exist
if [ ! -f "src/main/java/com/jobportal/controller/TestController.java" ]; then
    echo "3. Creating TestController.java..."
    cat > src/main/java/com/jobportal/controller/TestController.java << 'EOF'
package com.jobportal.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

@RestController
@RequestMapping("/api/test")
public class TestController {
    
    @GetMapping("/health")
    public String healthCheck() {
        return "Job Portal Backend is running successfully!";
    }
}
EOF
fi

# Compile
echo "4. Compiling project..."
if mvn compile; then
    echo ""
    echo "✅ COMPILATION SUCCESSFUL!"
    echo ""
    echo "5. Starting application..."
    echo "   Test endpoints:"
    echo "   - http://localhost:8080/api/test/health"
    echo "   - http://localhost:8080/api/h2-console"
    echo ""
    mvn spring-boot:run
else
    echo ""
    echo "❌ COMPILATION FAILED"
    echo "Please check the error messages above."
fi