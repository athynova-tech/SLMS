package com.smartlibrary.service;

import com.smartlibrary.model.*;
import com.smartlibrary.repository.*;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
public class ReportsService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public ReportsService(BorrowRecordRepository borrowRecordRepository,
                          UserRepository userRepository,
                          BookRepository bookRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    public Map<String, Object> getDaily() {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("date", java.time.LocalDate.now().toString());
        report.put("totalBooks", bookRepository.count());
        report.put("activeLoans", borrowRecordRepository.findByStatus(BorrowStatus.active).size());
        return report;
    }

    public Map<String, Object> getFines() {
        Map<String, Object> report = new LinkedHashMap<>();
        double totalFines = borrowRecordRepository.findAll().stream()
                .mapToDouble(r -> r.getFineAmount() != null ? r.getFineAmount().doubleValue() : 0.0)
                .sum();
        long unpaidFines = borrowRecordRepository.findAll().stream()
                .filter(r -> r.getFineAmount() != null && r.getFineAmount().compareTo(java.math.BigDecimal.ZERO) > 0)
                .count();
        report.put("totalFines", totalFines);
        report.put("unpaidFines", unpaidFines);
        return report;
    }

    public Map<String, Object> getUserActivity() {
        Map<String, Object> report = new LinkedHashMap<>();
        long totalUsers = userRepository.count();
        long activeUsers = borrowRecordRepository.findAll().stream()
                .map(r -> r.getUser().getId())
                .distinct()
                .count();
        report.put("totalUsers", totalUsers);
        report.put("activeUsers", activeUsers);
        return report;
    }

    public Map<String, Object> getInventory() {
        Map<String, Object> report = new LinkedHashMap<>();
        report.put("totalBooks", bookRepository.count());
        report.put("availableBooks", bookRepository.findAvailable().size());
        long borrowedBooks = borrowRecordRepository.findByStatus(BorrowStatus.active).size();
        report.put("borrowedBooks", borrowedBooks);
        return report;
    }
}
