package com.smartlibrary.controller;

import com.smartlibrary.model.Payment;
import com.smartlibrary.model.PaymentMethod;
import com.smartlibrary.model.PaymentStatus;
import com.smartlibrary.repository.UserRepository;
import com.smartlibrary.service.PaymentService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/payments")
public class PaymentController {

    private final PaymentService paymentService;
    private final UserRepository userRepository;

    public PaymentController(PaymentService paymentService, UserRepository userRepository) {
        this.paymentService = paymentService;
        this.userRepository = userRepository;
    }

    @PostMapping("/initiate")
    public ResponseEntity<?> initiatePayment(@RequestBody Map<String, String> body, Authentication auth) {
        Long userId = extractUserId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));

        try {
            Long borrowRecordId = Long.parseLong(body.get("borrowRecordId"));
            String methodStr = body.getOrDefault("paymentMethod", "MPESA");
            String phone = body.get("phoneNumber");
            PaymentMethod method = PaymentMethod.valueOf(methodStr);

            Payment payment = paymentService.initiatePayment(userId, borrowRecordId, method, phone);
            return ResponseEntity.ok(Map.of(
                "id", payment.getId(),
                "amount", payment.getAmount(),
                "method", payment.getPaymentMethod(),
                "status", payment.getStatus(),
                "message", "Payment initiated. Processing..."
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/confirm")
    public ResponseEntity<?> confirmPayment(@PathVariable Long id) {
        try {
            Payment payment = paymentService.confirmPayment(id);
            return ResponseEntity.ok(Map.of(
                "id", payment.getId(),
                "amount", payment.getAmount(),
                "status", payment.getStatus(),
                "transactionReference", payment.getTransactionReference(),
                "message", payment.getStatus() == PaymentStatus.completed ? "Payment successful" : "Payment failed"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @PostMapping("/{id}/retry")
    public ResponseEntity<?> retryPayment(@PathVariable Long id) {
        try {
            Payment payment = paymentService.retryPayment(id);
            return ResponseEntity.ok(Map.of(
                "id", payment.getId(),
                "status", payment.getStatus(),
                "transactionReference", payment.getTransactionReference(),
                "message", payment.getStatus() == PaymentStatus.completed ? "Payment successful" : "Payment failed"
            ));
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", e.getMessage()));
        }
    }

    @GetMapping("/my-payments")
    public ResponseEntity<?> getMyPayments(Authentication auth) {
        Long userId = extractUserId(auth);
        if (userId == null) return ResponseEntity.status(401).body(Map.of("error", "Authentication required"));
        return ResponseEntity.ok(paymentService.getUserPayments(userId));
    }

    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getPaymentStats() {
        return ResponseEntity.ok(paymentService.getPaymentStats());
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
