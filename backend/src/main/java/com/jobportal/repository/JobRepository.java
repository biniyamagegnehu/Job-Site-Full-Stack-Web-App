package com.jobportal.repository;

import com.jobportal.entity.Job;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;
import java.util.Optional;

@Repository
public interface JobRepository extends JpaRepository<Job, Long> {

        Page<Job> findByIsActiveTrue(Pageable pageable);

        Page<Job> findByIsActiveTrueAndApprovalStatus(Job.ApprovalStatus approvalStatus, Pageable pageable);

        Page<Job> findByIsActiveFalse(Pageable pageable);

        Page<Job> findByEmployerId(Long employerId, Pageable pageable);

        long countByIsActiveTrue();

        long countByJobType(Job.JobType jobType);

        Page<Job> findByApprovalStatus(Job.ApprovalStatus approvalStatus, Pageable pageable);

        @Query("SELECT j FROM Job j WHERE j.isActive = true AND j.approvalStatus = :status "
                        +
                        "AND (:title IS NULL OR LOWER(j.title) LIKE LOWER(CONCAT('%', :title, '%'))) " +
                        "AND (:location IS NULL OR LOWER(j.location) LIKE LOWER(CONCAT('%', :location, '%'))) " +
                        "AND (:jobType IS NULL OR j.jobType = :jobType) " +
                        "AND (:experienceLevel IS NULL OR j.experienceLevel = :experienceLevel) " +
                        "AND (:minSalary IS NULL OR j.salaryMax >= :minSalary) " +
                        "AND (:maxSalary IS NULL OR j.salaryMin <= :maxSalary) " +
                        "AND (:isRemote IS NULL OR j.isRemote = :isRemote)")
        Page<Job> searchJobs(
                        @Param("title") String title,
                        @Param("location") String location,
                        @Param("jobType") Job.JobType jobType,
                        @Param("experienceLevel") Job.ExperienceLevel experienceLevel,
                        @Param("minSalary") BigDecimal minSalary,
                        @Param("maxSalary") BigDecimal maxSalary,
                        @Param("isRemote") Boolean isRemote,
                        @Param("status") Job.ApprovalStatus status,
                        Pageable pageable);

        @Query("SELECT COUNT(j) FROM Job j WHERE j.employer.id = :employerId")
        Long countByEmployerId(@Param("employerId") Long employerId);

        Optional<Job> findByIdAndEmployerId(Long id, Long employerId);

        List<Job> findByEmployerIdAndIsActive(Long employerId, boolean isActive);
}
