package com.smartlibrary.service;

import com.smartlibrary.model.*;
import com.smartlibrary.repository.*;
import org.springframework.stereotype.Service;

import java.math.BigDecimal;
import java.util.LinkedHashMap;
import java.util.List;
import java.util.Map;
import java.util.Random;

@Service
public class PaymentService {

    private final PaymentRepository paymentRepository;
    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;

    private final Random random = new Random();

    public PaymentService(PaymentRepository paymentRepository,
                          BorrowRecordRepository borrowRecordRepository,
                          UserRepository userRepository) {
        this.paymentRepository = paymentRepository;
        this.borrowRecordRepository = borrowRecordRepository;
        this.userRepository = userRepository;
    }

    public Payment initiatePayment(Long userId, Long borrowRecordId, PaymentMethod method, String phoneNumber) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new com.smartlibrary.exception.ResourceNotFoundException("User not found"));
        BorrowRecord borrow = borrowRecordRepository.findById(borrowRecordId)
                .orElseThrow(() -> new com.smartlibrary.exception.ResourceNotFoundException("Borrow record not found"));
        if (borrow.getFineAmount() == null || borrow.getFineAmount().compareTo(BigDecimal.ZERO) <= 0 || borrow.getFinePaid()) {
            throw new IllegalStateException("No outstanding fine for this record");
        }
        List<Payment> existing = paymentRepository.findByUserId(userId);
        boolean pendingPayment = existing.stream().anyMatch(p ->
            p.getBorrowRecord() != null && p.getBorrowRecord().getId().equals(borrowRecordId) && p.getStatus() == PaymentStatus.pending
        );
        if (pendingPayment) throw new IllegalStateException("Payment already in progress");

        Payment payment = new Payment();
        payment.setUser(user);
        payment.setBorrowRecord(borrow);
        payment.setAmount(borrow.getFineAmount());
        payment.setPaymentMethod(method);
        payment.setStatus(PaymentStatus.pending);
        payment.setPhoneNumber(phoneNumber);
        return paymentRepository.save(payment);
    }

    public Payment confirmPayment(Long paymentId) {
        Payment payment = paymentRepository.findById(paymentId)
                .orElseThrow(() -> new com.smartlibrary.exception.ResourceNotFoundException("Payment not found"));
        if (payment.getStatus() != PaymentStatus.pending) throw new IllegalStateException("Payment is not pending");

        String ref = generateTransactionReference();
        boolean success = random.nextDouble() > 0.1;

        if (success) {
            payment.setStatus(PaymentStatus.completed);
            payment.setTransactionReference(ref);
            BorrowRecord borrow = payment.getBorrowRecord();
            if (borrow != null && !borrow.getFinePaid()) {
                borrow.setFinePaid(true);
                borrowRecordRepository.save(borrow);
            }
        } else {
            payment.setStatus(PaymentStatus.failed);
        }
        return paymentRepository.save(payment);
    }

    public Payment getPayment(Long paymentId) {
        return paymentRepository.findById(paymentId)
                .orElseThrow(() -> new com.smartlibrary.exception.ResourceNotFoundException("Payment not found"));
    }

    public List<Payment> getUserPayments(Long userId) {
        return paymentRepository.findByUserId(userId);
    }

    public Map<String, Object> getPaymentStats() {
        Map<String, Object> stats = new LinkedHashMap<>();
        long totalPayments = paymentRepository.count();
        long completedPayments = paymentRepository.findByStatus(PaymentStatus.completed).size();
        long totalFines = 0;
        List<BorrowRecord> records = borrowRecordRepository.findAll();
        for (BorrowRecord r : records) {
            if (r.getFineAmount() != null) totalFines += r.getFineAmount().longValue();
        }
        stats.put("totalPayments", totalPayments);
        stats.put("completedPayments", completedPayments);
        stats.put("totalFines", totalFines);
        return stats;
    }

    public Payment retryPayment(Long paymentId) {
        Payment payment = getPayment(paymentId);
        if (payment.getStatus() != PaymentStatus.failed) throw new IllegalStateException("Only failed payments can be retried");
        return confirmPayment(paymentId);
    }

    private String generateTransactionReference() {
        String chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
        StringBuilder sb = new StringBuilder();
        Random r = new Random();
        for (int i = 0; i < 10; i++) sb.append(chars.charAt(r.nextInt(chars.length())));
        return sb.toString();
    }
}
