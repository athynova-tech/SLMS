package com.smartlibrary.repository;

import com.smartlibrary.model.Book;
import com.smartlibrary.model.Category;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;

@Repository
public interface BookRepository extends JpaRepository<Book, Long> {
    List<Book> findByTitleContainingIgnoreCaseOrAuthorContainingIgnoreCase(String title, String author);
    List<Book> findByCategoryId(Long categoryId);

    @Query("SELECT b FROM Book b WHERE b.availableCopies > 0")
    List<Book> findAvailable();
}
