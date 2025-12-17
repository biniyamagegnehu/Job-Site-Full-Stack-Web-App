package com.jobportal.repository;

import com.jobportal.entity.CV;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

@Repository
public interface CVRepository extends JpaRepository<CV, Long> {
}