package com.smartlibrary.repository;

import com.smartlibrary.model.Payment;
import com.smartlibrary.model.PaymentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.time.LocalDate;
import java.util.List;

@Repository
public interface PaymentRepository extends JpaRepository<Payment, Long> {
    List<Payment> findByUserId(Long userId);
    List<Payment> findByStatus(PaymentStatus status);
    long countByCreatedAtBetween(LocalDate start, LocalDate end);
}
