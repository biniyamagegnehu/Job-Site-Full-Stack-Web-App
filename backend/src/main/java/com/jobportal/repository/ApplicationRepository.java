package com.jobportal.repository;

import com.jobportal.entity.JobApplication;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface ApplicationRepository extends JpaRepository<JobApplication, Long> {
    
    Optional<JobApplication> findByJobIdAndJobSeekerId(Long jobId, Long jobSeekerId);
    
    boolean existsByJobIdAndJobSeekerId(Long jobId, Long jobSeekerId);
    
    Page<JobApplication> findByJobSeekerId(Long jobSeekerId, Pageable pageable);
    
    Page<JobApplication> findByJobId(Long jobId, Pageable pageable);
    
    @Query("SELECT a FROM JobApplication a WHERE a.job.employer.id = :employerId")
    Page<JobApplication> findByEmployerId(@Param("employerId") Long employerId, Pageable pageable);
    
    Page<JobApplication> findByJobSeekerIdAndStatus(Long jobSeekerId, JobApplication.ApplicationStatus status, Pageable pageable);
    
    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.job.id = :jobId")
    Long countByJobId(@Param("jobId") Long jobId);
    
    @Query("SELECT COUNT(a) FROM JobApplication a WHERE a.jobSeeker.id = :jobSeekerId")
    Long countByJobSeekerId(@Param("jobSeekerId") Long jobSeekerId);
}