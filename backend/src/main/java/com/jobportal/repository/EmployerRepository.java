package com.jobportal.repository;

import com.jobportal.entity.Employer;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface EmployerRepository extends JpaRepository<Employer, Long> {
    List<Employer> findByApprovalStatus(Employer.ApprovalStatus status);
}