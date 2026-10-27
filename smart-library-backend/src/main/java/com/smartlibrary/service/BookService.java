package com.smartlibrary.service;

import com.smartlibrary.dto.BookRequest;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.model.Book;
import com.smartlibrary.model.Category;
import com.smartlibrary.repository.BookRepository;
import com.smartlibrary.repository.CategoryRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class BookService {

    private final BookRepository bookRepository;
    private final CategoryRepository categoryRepository;

    public BookService(BookRepository bookRepository, CategoryRepository categoryRepository) {
        this.bookRepository = bookRepository;
        this.categoryRepository = categoryRepository;
    }

    public List<Book> getAll() {
        return bookRepository.findAll();
    }

    public Book getById(Long id) {
        return bookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + id));
    }

    public List<Book> search(String query) {
        return bookRepository.findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(query, query);
    }

    public List<Book> getByCategory(Long categoryId) {
        return bookRepository.findByCategoryId(categoryId);
    }

    public List<Book> getAvailable() {
        return bookRepository.findAvailable();
    }

    public Book create(BookRequest request) {
        Book book = new Book();
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setIsbn(request.isbn());
        book.setDescription(request.description());
        book.setPublisher(request.publisher());
        book.setTotalCopies(request.totalCopies() != null ? request.totalCopies() : 1);
        book.setAvailableCopies(request.totalCopies() != null ? request.totalCopies() : 1);
        book.setShelfLocation(request.shelfLocation());
        if (request.categoryId() != null) {
            book.setCategory(categoryRepository.findById(request.categoryId())
                .orElseThrow(() -> new IllegalArgumentException("Category not found: " + request.categoryId())));
        }
        return bookRepository.save(book);
    }

    public Book update(Long id, BookRequest request) {
        Book book = getById(id);
        book.setTitle(request.title());
        book.setAuthor(request.author());
        book.setIsbn(request.isbn());
        book.setDescription(request.description());
        book.setPublisher(request.publisher());
        if (request.totalCopies() != null) {
            book.setTotalCopies(request.totalCopies());
            book.setAvailableCopies(request.totalCopies());
        }
        book.setShelfLocation(request.shelfLocation());
        return bookRepository.save(book);
    }

    public void delete(Long id) {
        bookRepository.deleteById(id);
    }
}
