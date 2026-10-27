package com.smartlibrary.repository;

import com.smartlibrary.model.AttendanceRecord;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface AttendanceRepository extends JpaRepository<AttendanceRecord, Long> {
    List<AttendanceRecord> findByUserId(Long userId);
    List<AttendanceRecord> findByVisitDate(LocalDate date);
    List<AttendanceRecord> findByUserIdAndVisitDate(Long userId, LocalDate date);
    long countByVisitDate(LocalDate date);
}
