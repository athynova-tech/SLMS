package com.smartlibrary.repository;

import com.smartlibrary.model.SeatReservation;
import com.smartlibrary.model.SeatReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface SeatReservationRepository extends JpaRepository<SeatReservation, Long> {
    List<SeatReservation> findByUserId(Long userId);
    List<SeatReservation> findBySeatId(Long seatId);
    List<SeatReservation> findBySeatIdAndReservationDateAndStatus(
            Long seatId, LocalDate date, SeatReservationStatus status);
    List<SeatReservation> findByReservationDateAndStatus(LocalDate date, SeatReservationStatus status);
}
