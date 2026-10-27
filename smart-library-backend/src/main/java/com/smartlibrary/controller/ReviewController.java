package com.smartlibrary.controller;

import com.smartlibrary.dto.ReviewRequest;
import com.smartlibrary.model.Review;
import com.smartlibrary.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;

    public ReviewController(ReviewService reviewService) {
        this.reviewService = reviewService;
    }

    @GetMapping("/book/{bookId}")
    public ResponseEntity<List<Review>> getForBook(@PathVariable Long bookId) {
        return ResponseEntity.ok(reviewService.getForBook(bookId));
    }

    @GetMapping("/book/{bookId}/rating")
    public ResponseEntity<Double> getRating(@PathVariable Long bookId) {
        return ResponseEntity.ok(reviewService.getRating(bookId));
    }

    @PostMapping
    public ResponseEntity<Review> create(@RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.create(request));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> update(@PathVariable Long reviewId, @RequestBody ReviewRequest request) {
        return ResponseEntity.ok(reviewService.update(reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> delete(@PathVariable Long reviewId) {
        reviewService.delete(reviewId);
        return ResponseEntity.noContent().build();
    }
}
