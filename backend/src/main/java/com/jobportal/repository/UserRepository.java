// src/main/java/com/jobportal/repository/UserRepository.java
package com.jobportal.repository;

import com.jobportal.entity.User;
import com.jobportal.util.UserRole;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface UserRepository extends JpaRepository<User, Long> {

    Optional<User> findByEmail(String email);

    Optional<User> findByUsername(String username);

    boolean existsByEmail(String email);

    boolean existsByUsername(String username);

    List<User> findByRole(UserRole role);

    List<User> findByIsEnabled(boolean isEnabled);

    // For employer approval workflow
    List<User> findByRoleAndIsEnabled(UserRole role, boolean isEnabled);

    // Search users by email or username
    @Query("SELECT u FROM User u WHERE u.email LIKE %:query% OR u.username LIKE %:query%")
    List<User> searchByEmailOrUsername(@Param("query") String query);
}