package com.smartlibrary.repository;

import com.smartlibrary.model.Reservation;
import com.smartlibrary.model.ReservationStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface ReservationRepository extends JpaRepository<Reservation, Long> {
    List<Reservation> findByUserIdOrderByCreatedAtAsc(Long userId);
    List<Reservation> findByBookIdAndStatusOrderByCreatedAtAsc(Long bookId, ReservationStatus status);

    @Query("SELECT CASE WHEN COUNT(r) > 0 THEN true ELSE false END FROM Reservation r WHERE r.user.id = :userId AND r.book.id = :bookId AND r.status = 'active'")
    boolean hasActiveReservation(Long userId, Long bookId);
}
