package com.smartlibrary.controller;

import com.smartlibrary.dto.ReviewRequest;
import com.smartlibrary.model.Review;
import com.smartlibrary.security.CurrentUser;
import com.smartlibrary.service.ReviewService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/reviews")
public class ReviewController {

    private final ReviewService reviewService;
    private final CurrentUser currentUser;

    public ReviewController(ReviewService reviewService, CurrentUser currentUser) {
        this.reviewService = reviewService;
        this.currentUser = currentUser;
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
        return ResponseEntity.ok(reviewService.create(request, currentUser.get()));
    }

    @PutMapping("/{reviewId}")
    public ResponseEntity<Review> update(@PathVariable Long reviewId, @RequestBody ReviewRequest request) {
        Review existing = reviewService.getById(reviewId);
        if (!existing.getUser().getId().equals(currentUser.id())) {
            throw new AccessDeniedException("You can only edit your own reviews");
        }
        return ResponseEntity.ok(reviewService.update(reviewId, request));
    }

    @DeleteMapping("/{reviewId}")
    public ResponseEntity<Void> delete(@PathVariable Long reviewId) {
        // The author or staff (moderation) may delete a review.
        currentUser.requireSelfOrStaff(reviewService.getById(reviewId).getUser().getId());
        reviewService.delete(reviewId);
        return ResponseEntity.noContent().build();
    }
}
