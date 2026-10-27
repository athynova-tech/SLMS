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
public class BorrowService {

    private final BorrowRecordRepository borrowRecordRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public BorrowService(BorrowRecordRepository borrowRecordRepository,
                         BookRepository bookRepository,
                         UserRepository userRepository) {
        this.borrowRecordRepository = borrowRecordRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public List<BorrowRecord> getAll() {
        return borrowRecordRepository.findAll();
    }

    public BorrowRecord getById(Long id) {
        return borrowRecordRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Borrow record not found: " + id));
    }

    public List<BorrowRecord> getByUser(Long userId) {
        return borrowRecordRepository.findByUserId(userId);
    }

    public List<BorrowRecord> getByBook(Long bookId) {
        return borrowRecordRepository.findByBookId(bookId);
    }

    public List<BorrowRecord> getByStatus(String status) {
        return borrowRecordRepository.findByStatus(BorrowStatus.valueOf(status));
    }

    @Transactional
    public BorrowRecord borrow(Long userId, Long bookId) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found"));
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        if (book.getAvailableCopies() <= 0) {
            throw new BadRequestException("No copies available");
        }

        book.setAvailableCopies(book.getAvailableCopies() - 1);
        bookRepository.save(book);

        BorrowRecord record = new BorrowRecord();
        record.setUser(user);
        record.setBook(book);
        record.setBorrowDate(LocalDate.now());
        record.setDueDate(LocalDate.now().plusDays(14));
        record.setStatus(BorrowStatus.active);
        record.setFineAmount(java.math.BigDecimal.ZERO);
        record.setFinePaid(false);
        return borrowRecordRepository.save(record);
    }

    @Transactional
    public BorrowRecord returnBook(Long id) {
        BorrowRecord record = getById(id);
        record.setReturnDate(LocalDate.now());
        record.setStatus(BorrowStatus.returned);

        Book book = record.getBook();
        book.setAvailableCopies(book.getAvailableCopies() + 1);
        bookRepository.save(book);

        if (record.getDueDate().isBefore(LocalDate.now())) {
            long daysOverdue = java.time.temporal.ChronoUnit.DAYS.between(record.getDueDate(), LocalDate.now());
            record.setFineAmount(java.math.BigDecimal.valueOf(daysOverdue * 1.0));
        }

        return borrowRecordRepository.save(record);
    }

    public BorrowRecord payFine(Long id) {
        BorrowRecord record = getById(id);
        record.setFineAmount(java.math.BigDecimal.ZERO);
        record.setFinePaid(true);
        return borrowRecordRepository.save(record);
    }
}
