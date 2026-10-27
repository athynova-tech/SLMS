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

    @Transactional
    public Review create(ReviewRequest request) {
        Book book = bookRepository.findById(request.bookId())
                .orElseThrow(() -> new ResourceNotFoundException("Book not found"));

        Review review = new Review();
        review.setBook(book);
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
        review.setRating(request.rating());
        review.setComment(request.comment());
        review = reviewRepository.save(review);
        updateBookRating(request.bookId());
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
