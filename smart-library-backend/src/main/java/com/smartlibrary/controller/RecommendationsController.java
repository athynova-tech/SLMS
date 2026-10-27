package com.smartlibrary.controller;

import com.smartlibrary.model.Book;
import com.smartlibrary.repository.BookRepository;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/recommendations")
public class RecommendationsController {

    private final BookRepository bookRepository;

    public RecommendationsController(BookRepository bookRepository) {
        this.bookRepository = bookRepository;
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Book>> getForBook(@PathVariable Long bookId) {
        Book book = bookRepository.findById(bookId).orElse(null);
        if (book == null) return ResponseEntity.ok(List.of());

        return ResponseEntity.ok(bookRepository.findAvailable().stream()
                .filter(b -> !b.getId().equals(bookId))
                .limit(5)
                .collect(Collectors.toList()));
    }

    @GetMapping("/user/{userId}")
    public ResponseEntity<List<Book>> getForUser(@PathVariable Long userId) {
        return ResponseEntity.ok(bookRepository.findAvailable().stream()
                .limit(6)
                .collect(Collectors.toList()));
    }
}
