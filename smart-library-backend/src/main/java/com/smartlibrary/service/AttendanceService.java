package com.smartlibrary.service;

import com.smartlibrary.model.AttendanceRecord;
import com.smartlibrary.repository.AttendanceRepository;
import com.smartlibrary.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;

@Service
public class AttendanceService {

    private final AttendanceRepository attendanceRepository;
    private final UserRepository userRepository;

    public AttendanceService(AttendanceRepository attendanceRepository,
                             UserRepository userRepository) {
        this.attendanceRepository = attendanceRepository;
        this.userRepository = userRepository;
    }

    public AttendanceRecord checkIn(Long userId, String method, String qrCode) {
        LocalDate today = LocalDate.now();
        List<AttendanceRecord> todayRecords = attendanceRepository.findByUserIdAndVisitDate(userId, today);
        if (todayRecords.stream().anyMatch(r -> r.getCheckOutTime() == null)) {
            throw new IllegalStateException("Already checked in. Please check out first.");
        }

        AttendanceRecord record = new AttendanceRecord();
        userRepository.findById(userId).ifPresent(record::setUser);
        record.setVisitDate(today);
        record.setCheckInTime(LocalTime.now());
        if (method != null) record.setMethod(method);
        if (qrCode != null) record.setQrCode(qrCode);
        return attendanceRepository.save(record);
    }

    public AttendanceRecord checkOut(Long userId) {
        LocalDate today = LocalDate.now();
        List<AttendanceRecord> records = attendanceRepository.findByUserIdAndVisitDate(userId, today);
        AttendanceRecord record = records.stream()
                .filter(r -> r.getCheckOutTime() == null)
                .findFirst()
                .orElseThrow(() -> new IllegalStateException("No active check-in found"));
        record.setCheckOutTime(LocalTime.now());
        return attendanceRepository.save(record);
    }

    public List<AttendanceRecord> getUserAttendance(Long userId) {
        return attendanceRepository.findByUserId(userId);
    }

    public List<AttendanceRecord> getAttendanceByDate(LocalDate date) {
        return attendanceRepository.findByVisitDate(date);
    }

    public Map<String, Object> getAttendanceStats() {
        LocalDate today = LocalDate.now();
        long todayCount = attendanceRepository.countByVisitDate(today);
        long weekCount = 0;
        for (int i = 0; i < 7; i++) {
            weekCount += attendanceRepository.countByVisitDate(today.minusDays(i));
        }

        Map<String, Object> stats = new LinkedHashMap<>();
        stats.put("todayVisits", (int) todayCount);
        stats.put("weeklyVisits", (int) weekCount);
        return stats;
    }
}
