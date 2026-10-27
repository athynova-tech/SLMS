package com.smartlibrary.controller;

import com.smartlibrary.model.Reservation;
import com.smartlibrary.service.ReservationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reservations")
public class ReservationController {

    private final ReservationService reservationService;

    public ReservationController(ReservationService reservationService) {
        this.reservationService = reservationService;
    }

    @GetMapping
    public ResponseEntity<List<Reservation>> getAll() {
        return ResponseEntity.ok(reservationService.getAll());
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Reservation>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(reservationService.getByUser(userId));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Reservation>> getByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(reservationService.getByBook(bookId));
    }

    @PostMapping
    public ResponseEntity<Reservation> create(@RequestParam Long userId, @RequestParam Long bookId) {
        return ResponseEntity.ok(reservationService.create(userId, bookId));
    }

    @PutMapping("/{id}/cancel")
    public ResponseEntity<Reservation> cancel(@PathVariable Long id, @RequestParam Long userId) {
        return ResponseEntity.ok(reservationService.cancel(id, userId));
    }

    @GetMapping("/position")
    public ResponseEntity<Integer> getPosition(@RequestParam Long userId, @RequestParam Long bookId) {
        return ResponseEntity.ok(reservationService.getPosition(userId, bookId));
    }
}
