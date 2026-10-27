package com.smartlibrary.service;

import com.smartlibrary.exception.BadRequestException;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.model.*;
import com.smartlibrary.repository.*;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;

@Service
public class ReservationService {

    private final ReservationRepository reservationRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public ReservationService(ReservationRepository reservationRepository,
                              BookRepository bookRepository,
                              UserRepository userRepository) {
        this.reservationRepository = reservationRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public List<Reservation> getAll() {
        return reservationRepository.findAll();
    }

    public List<Reservation> getByUser(Long userId) {
        return reservationRepository.findByUserIdOrderByCreatedAtAsc(userId);
    }

    public List<Reservation> getByBook(Long bookId) {
        return reservationRepository.findByBookIdAndStatusOrderByCreatedAtAsc(bookId, ReservationStatus.active);
    }

    @Transactional
    public Reservation create(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (reservationRepository.hasActiveReservation(userId, bookId)) {
            throw new BadRequestException("User already has an active reservation for this book");
        }

        Reservation reservation = new Reservation();
        reservation.setUser(user);
        reservation.setBook(book);
        reservation.setStatus(ReservationStatus.active);
        reservation.setQueuePosition(reservationRepository
                .findByBookIdAndStatusOrderByCreatedAtAsc(bookId, ReservationStatus.active).size() + 1);
        return reservationRepository.save(reservation);
    }

    @Transactional
    public Reservation cancel(Long id, Long userId) {
        Reservation reservation = reservationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Reservation not found: " + id));
        if (!reservation.getUser().getId().equals(userId)) {
            throw new BadRequestException("Cannot cancel another user's reservation");
        }
        reservation.setStatus(ReservationStatus.cancelled);
        return reservationRepository.save(reservation);
    }

    public int getPosition(Long userId, Long bookId) {
        List<Reservation> reservations = reservationRepository
                .findByBookIdAndStatusOrderByCreatedAtAsc(bookId, ReservationStatus.active);
        for (int i = 0; i < reservations.size(); i++) {
            if (reservations.get(i).getUser().getId().equals(userId)) {
                return i + 1;
            }
        }
        return 0;
    }
}
