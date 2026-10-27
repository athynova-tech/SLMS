package com.smartlibrary.controller;

import com.smartlibrary.model.AttendanceRecord;
import com.smartlibrary.repository.UserRepository;
import com.smartlibrary.service.AttendanceService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/attendance")
public class AttendanceController {

    private final AttendanceService attendanceService;
    private final UserRepository userRepository;

    public AttendanceController(AttendanceService attendanceService,
                                UserRepository userRepository) {
        this.attendanceService = attendanceService;
        this.userRepository = userRepository;
    }

    @PostMapping("/check-in")
    public ResponseEntity<?> checkIn(
            @RequestBody(required = false) Map<String, String> body,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));

        String method = body != null ? body.getOrDefault("method", "QR_SCAN") : "QR_SCAN";
        String qrCode = body != null ? body.get("qrCode") : null;

        try {
            AttendanceRecord record = attendanceService.checkIn(userId, method, qrCode);
            return ResponseEntity.ok(Map.of(
                "id", record.getId(),
                "visitDate", record.getVisitDate().toString(),
                "checkInTime", record.getCheckInTime().toString(),
                "message", "Check-in successful"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/check-out")
    public ResponseEntity<?> checkOut(Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));

        try {
            AttendanceRecord record = attendanceService.checkOut(userId);
            return ResponseEntity.ok(Map.of(
                "id", record.getId(),
                "checkInTime", record.getCheckInTime().toString(),
                "checkOutTime", record.getCheckOutTime().toString(),
                "message", "Check-out successful"
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-history")
    public ResponseEntity<List<AttendanceRecord>> getMyHistory(Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) return ResponseEntity.ok(List.of());
        return ResponseEntity.ok(attendanceService.getUserAttendance(userId));
    }

    @GetMapping("/daily")
    public ResponseEntity<List<AttendanceRecord>> getDaily(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(attendanceService.getAttendanceByDate(date));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(attendanceService.getAttendanceStats());
    }

    private Long extractUserId(Authentication authentication) {
        if (authentication == null || !authentication.isAuthenticated()) return null;
        Object principal = authentication.getPrincipal();
        if (principal instanceof UserDetails userDetails) {
            return userRepository.findByEmail(userDetails.getUsername())
                    .map(u -> u.getId()).orElse(null);
        }
        return null;
    }
}
