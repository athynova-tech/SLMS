package com.smartlibrary.repository;

import com.smartlibrary.model.Seat;
import com.smartlibrary.model.StudyRoom;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface SeatRepository extends JpaRepository<Seat, Long> {
    List<Seat> findByRoomId(Long roomId);
    List<Seat> findByAvailableTrue();
    List<Seat> findByRoomIdAndAvailableTrue(Long roomId);
}
