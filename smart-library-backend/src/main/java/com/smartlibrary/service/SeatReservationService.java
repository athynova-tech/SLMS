package com.smartlibrary.service;

import com.smartlibrary.model.*;
import com.smartlibrary.repository.*;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalTime;
import java.util.*;
import java.util.stream.Collectors;
import java.util.stream.StreamSupport;

@Service
public class SeatReservationService {

    private final StudyRoomRepository studyRoomRepository;
    private final SeatRepository seatRepository;
    private final SeatReservationRepository seatReservationRepository;
    private final UserRepository userRepository;

    public SeatReservationService(StudyRoomRepository studyRoomRepository,
                                  SeatRepository seatRepository,
                                  SeatReservationRepository seatReservationRepository,
                                  UserRepository userRepository) {
        this.studyRoomRepository = studyRoomRepository;
        this.seatRepository = seatRepository;
        this.seatReservationRepository = seatReservationRepository;
        this.userRepository = userRepository;
    }

    public List<StudyRoom> getAllRooms() {
        return studyRoomRepository.findByActiveTrue();
    }

    public List<Seat> getSeatsByRoom(Long roomId) {
        return seatRepository.findByRoomIdAndAvailableTrue(roomId);
    }

    public List<Map<String, Object>> getAvailableSeats(LocalDate date) {
        List<Seat> allSeats = seatRepository.findByAvailableTrue();
        List<SeatReservation> reservations = seatReservationRepository
                .findByReservationDateAndStatus(date, SeatReservationStatus.confirmed);

        Set<Long> reservedSeatIds = new HashSet<>();
        for (SeatReservation res : reservations) {
            if (LocalTime.now().isAfter(res.getStartTime()) && LocalTime.now().isBefore(res.getEndTime())) {
                reservedSeatIds.add(res.getSeat().getId());
            }
        }
        return allSeats.stream()
                .filter(s -> !reservedSeatIds.contains(s.getId()))
                .map(s -> {
                    Map<String, Object> m = new LinkedHashMap<>();
                    m.put("id", s.getId());
                    m.put("seatNumber", s.getSeatNumber());
                    m.put("seatType", s.getSeatType());
                    m.put("room", s.getRoom() != null ? s.getRoom().getName() : "Main Hall");
                    m.put("available", true);
                    return m;
                }).toList();
    }

    public SeatReservation createReservation(Long userId, Long seatId, LocalDate date,
                                              LocalTime startTime, LocalTime endTime) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.smartlibrary.exception.ResourceNotFoundException("User not found"));
        Seat seat = seatRepository.findById(seatId)
                .orElseThrow(() -> new com.smartlibrary.exception.ResourceNotFoundException("Seat not found"));

        // Check for overlapping reservations
        List<SeatReservation> existing = seatReservationRepository
                .findBySeatIdAndReservationDateAndStatus(seatId, date, SeatReservationStatus.confirmed);
        for (SeatReservation res : existing) {
            if (startTime.isBefore(res.getEndTime()) && endTime.isAfter(res.getStartTime())) {
                throw new IllegalStateException("Seat is already reserved for this time period");
            }
        }

        SeatReservation reservation = new SeatReservation();
        reservation.setUser(user);
        reservation.setSeat(seat);
        reservation.setReservationDate(date);
        reservation.setStartTime(startTime);
        reservation.setEndTime(endTime);
        reservation.setStatus(SeatReservationStatus.confirmed);
        return seatReservationRepository.save(reservation);
    }

    public List<SeatReservation> getUserReservations(Long userId) {
        return seatReservationRepository.findByUserId(userId);
    }

    public void cancelReservation(Long reservationId, Long userId) {
        SeatReservation res = seatReservationRepository.findById(reservationId)
                .orElseThrow(() -> new com.smartlibrary.exception.ResourceNotFoundException("Reservation not found"));
        if (res.getUser().getId() != userId) {
            throw new IllegalStateException("Not authorized to cancel this reservation");
        }
        res.setStatus(SeatReservationStatus.cancelled);
        seatReservationRepository.save(res);
    }

    public List<Map<String, Object>> getReservationsByDate(LocalDate date) {
        List<SeatReservation> reservations = seatReservationRepository
                .findByReservationDateAndStatus(date, SeatReservationStatus.confirmed);
        return reservations.stream().map(r -> {
            Map<String, Object> m = new LinkedHashMap<>();
            m.put("id", r.getId());
            m.put("userName", r.getUser().getFullName());
            m.put("userEmail", r.getUser().getEmail());
            m.put("seatId", r.getSeat().getId());
            m.put("seatNumber", r.getSeat().getSeatNumber());
            m.put("room", r.getSeat().getRoom() != null ? r.getSeat().getRoom().getName() : "Main Hall");
            m.put("date", r.getReservationDate());
            m.put("startTime", r.getStartTime());
            m.put("endTime", r.getEndTime());
            return m;
        }).toList();
    }
}
