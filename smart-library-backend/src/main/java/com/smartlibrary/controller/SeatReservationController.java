package com.smartlibrary.controller;

import com.smartlibrary.model.Seat;
import com.smartlibrary.model.SeatReservation;
import com.smartlibrary.model.StudyRoom;
import com.smartlibrary.repository.UserRepository;
import com.smartlibrary.service.SeatReservationService;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.List;
import java.util.Map;
import java.util.HashMap;

@RestController
@RequestMapping("/api/seats")
public class SeatReservationController {

    private final SeatReservationService seatReservationService;
    private final UserRepository userRepository;

    public SeatReservationController(SeatReservationService seatReservationService,
                                     UserRepository userRepository) {
        this.seatReservationService = seatReservationService;
        this.userRepository = userRepository;
    }

    @GetMapping("/rooms")
    public ResponseEntity<List<StudyRoom>> getRooms() {
        return ResponseEntity.ok(seatReservationService.getAllRooms());
    }

    @GetMapping("/rooms/{roomId}/seats")
    public ResponseEntity<List<Seat>> getSeats(@PathVariable Long roomId) {
        return ResponseEntity.ok(seatReservationService.getSeatsByRoom(roomId));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Map<String, Object>>> getAvailableSeats(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(seatReservationService.getAvailableSeats(date));
    }

    @PostMapping("/reserve")
    public ResponseEntity<?> reserveSeat(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));

        Long seatId = Long.parseLong(body.get("seatId"));
        LocalDate date = LocalDate.parse(body.get("date"));
        LocalTime startTime = LocalTime.parse(body.get("startTime"));
        LocalTime endTime = LocalTime.parse(body.get("endTime"));

        try {
            SeatReservation reservation = seatReservationService.createReservation(
                    userId, seatId, date, startTime, endTime);
            return ResponseEntity.ok(Map.of(
                "id", reservation.getId(),
                "seatId", reservation.getSeat().getId(),
                "seatNumber", reservation.getSeat().getSeatNumber(),
                "date", reservation.getReservationDate().toString(),
                "startTime", reservation.getStartTime().toString(),
                "endTime", reservation.getEndTime().toString(),
                "status", reservation.getStatus().name()
            ));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-reservations")
    public ResponseEntity<?> getMyReservations(Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));

        List<SeatReservation> reservations = seatReservationService.getUserReservations(userId);
        List<Map<String, Object>> result = reservations.stream().map(r -> {
            Map<String, Object> m = new HashMap<>();
            m.put("id", r.getId());
            m.put("seatId", r.getSeat().getId());
            m.put("seatNumber", r.getSeat().getSeatNumber());
            m.put("room", r.getSeat().getRoom() != null ? r.getSeat().getRoom().getName() : "Main Hall");
            m.put("date", r.getReservationDate().toString());
            m.put("startTime", r.getStartTime().toString());
            m.put("endTime", r.getEndTime().toString());
            m.put("status", r.getStatus().name());
            return m;
        }).toList();
        return ResponseEntity.ok(result);
    }

    @PostMapping("/cancel/{reservationId}")
    public ResponseEntity<?> cancelReservation(@PathVariable Long reservationId,
                                                Authentication authentication) {
        Long userId = extractUserId(authentication);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));

        try {
            seatReservationService.cancelReservation(reservationId, userId);
            return ResponseEntity.ok(Map.of("message", "Reservation cancelled"));
        } catch (IllegalStateException e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/all-reservations")
    public ResponseEntity<List<Map<String, Object>>> getAllReservations(
            @RequestParam(required = false) @DateTimeFormat(iso = DateTimeFormat.ISO.DATE) LocalDate date) {
        if (date == null) date = LocalDate.now();
        return ResponseEntity.ok(seatReservationService.getReservationsByDate(date));
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
