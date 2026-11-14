package com.smartlibrary.service;

import com.smartlibrary.dto.ReviewRequest;
import com.smartlibrary.exception.BadRequestException;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.model.Book;
import com.smartlibrary.model.Review;
import com.smartlibrary.model.User;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.ReviewRepository;
import com.smartlibrary.repository.UserRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;

@Service
public class ReviewService {

    private final ReviewRepository reviewRepository;
    private final BookRepository bookRepository;
    private final UserRepository userRepository;

    public ReviewService(ReviewRepository reviewRepository, BookRepository bookRepository, UserRepository userRepository) {
        this.reviewRepository = reviewRepository;
        this.bookRepository = bookRepository;
        this.userRepository = userRepository;
    }

    public List<Review> getForBook(Long bookId) {
        return reviewRepository.findByBookIdOrderByCreatedAtDesc(bookId);
    }

    public Double getRating(Long bookId) {
        return reviewRepository.getAverageRating(bookId);
    }

    public Review getById(Long reviewId) {
        return reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
    }

    private void validateRating(Integer rating) {
        if (rating == null || rating < 1 || rating > 5) {
            throw new BadRequestException("Rating must be between 1 and 5");
        }
    }

    @Transactional
    public Review create(ReviewRequest request, User author) {
        validateRating(request.rating());
        Book book = bookRepository.findById(request.bookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        Review review = new Review();
        review.setBook(book);
        review.setUser(author);
        review.setRating(request.rating());
        review.setComment(request.comment());
        review = reviewRepository.save(review);

        updateBookRating(book.getId());
        return review;
    }

    @Transactional
    public Review update(Long reviewId, ReviewRequest request) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
        validateRating(request.rating());
        review.setRating(request.rating());
        review.setComment(request.comment());
        review = reviewRepository.save(review);
        updateBookRating(review.getBook().getId());
        return review;
    }

    public void delete(Long reviewId) {
        Review review = reviewRepository.findById(reviewId)
                .orElseThrow(() -> new ResourceNotFoundException("Review not found: " + reviewId));
        Long bookId = review.getBook().getId();
        reviewRepository.deleteById(reviewId);
        updateBookRating(bookId);
    }

    private void updateBookRating(Long bookId) {
        Double avg = reviewRepository.getAverageRating(bookId);
        long count = reviewRepository.countByBookId(bookId);
        bookRepository.findById(bookId).ifPresent(book -> {
            book.setAverageRating(avg != null ? avg : 0.0);
            book.setRatingCount((int) count);
            bookRepository.save(book);
        });
    }
}
