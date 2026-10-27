package com.smartlibrary.controller;

import com.smartlibrary.model.BorrowRecord;
import com.smartlibrary.dto.BorrowRequest;
import com.smartlibrary.service.BorrowService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/borrow")
public class BorrowController {

    private final BorrowService borrowService;

    public BorrowController(BorrowService borrowService) {
        this.borrowService = borrowService;
    }

    @GetMapping
    public ResponseEntity<List<BorrowRecord>> getAll() {
        return ResponseEntity.ok(borrowService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<BorrowRecord> getById(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.getById(id));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<BorrowRecord>> getByUser(@PathVariable Long userId) {
        return ResponseEntity.ok(borrowService.getByUser(userId));
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<BorrowRecord>> getByBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(borrowService.getByBook(bookId));
    }

    @GetMapping("/status/{status}")
    public ResponseEntity<List<BorrowRecord>> getByStatus(@PathVariable String status) {
        return ResponseEntity.ok(borrowService.getByStatus(status));
    }

    @PostMapping
    public ResponseEntity<BorrowRecord> borrow(@RequestBody BorrowRequest request) {
        return ResponseEntity.ok(borrowService.borrow(request.userId(), request.bookId()));
    }

    @PutMapping("/return/{id}")
    public ResponseEntity<BorrowRecord> returnBook(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.returnBook(id));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        borrowService.getById(id);
        return ResponseEntity.noContent().build();
    }

    @PostMapping("/scan")
    public ResponseEntity<BorrowRecord> scan(@RequestParam Long userId, @RequestParam String qrContent) {
        return ResponseEntity.ok(borrowService.borrow(userId, Long.parseLong(qrContent)));
    }

    @PostMapping("/fine/pay/{id}")
    public ResponseEntity<BorrowRecord> payFine(@PathVariable Long id) {
        return ResponseEntity.ok(borrowService.payFine(id));
    }
}
