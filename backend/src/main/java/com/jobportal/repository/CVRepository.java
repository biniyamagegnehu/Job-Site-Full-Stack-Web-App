package com.jobportal.repository;

import com.jobportal.entity.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

@Repository
public interface CVRepository extends JpaRepository<CV, Long> {
    Optional<CV> findByJobSeekerId(Long jobSeekerId);
}