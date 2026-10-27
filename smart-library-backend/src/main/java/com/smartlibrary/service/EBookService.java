package com.smartlibrary.service;

import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.model.*;
import com.smartlibrary.repository.*;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class EBookService {

    private final EBookRepository ebookRepository;
    private final BookmarkRepository bookmarkRepository;
    private final UserRepository userRepository;
    private final BookRepository bookRepository;

    public EBookService(EBookRepository ebookRepository, BookmarkRepository bookmarkRepository, UserRepository userRepository, BookRepository bookRepository) {
        this.ebookRepository = ebookRepository;
        this.bookmarkRepository = bookmarkRepository;
        this.userRepository = userRepository;
        this.bookRepository = bookRepository;
    }

    public List<EBook> getAll() {
        return ebookRepository.findAll();
    }

    public EBook getById(Long id) {
        return ebookRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("EBook not found: " + id));
    }

    public List<EBook> search(String q) {
        return ebookRepository.findByTitleContainingIgnoreCase(q);
    }

    public EBook upload(Long bookId, String filePath, Long userId, String title) {
        Book book = bookRepository.findById(bookId)
                .orElseThrow(() -> new ResourceNotFoundException("Book not found: " + bookId));
        User uploader = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        EBook ebook = new EBook();
        ebook.setTitle(title != null && !title.isBlank() ? title : book.getTitle());
        ebook.setBook(book);
        ebook.setUploadedBy(uploader);
        ebook.setFilePath(filePath);
        ebook.setTotalPages(book.getPageCount() != null ? book.getPageCount() : 0);
        ebook.setDownloadCount(0);
        return ebookRepository.save(ebook);
    }

    public List<Bookmark> getBookmarks(Long ebookId, Long userId) {
        return bookmarkRepository.findByEbookIdAndUserId(ebookId, userId);
    }

    public Bookmark addBookmark(Long ebookId, Long userId, Integer page, String note, String highlightedText) {
        Bookmark bookmark = new Bookmark();
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        EBook ebook = getById(ebookId);
        bookmark.setEbook(ebook);
        bookmark.setUser(user);
        bookmark.setPage(page);
        bookmark.setNote(note);
        bookmark.setHighlightedText(highlightedText);
        return bookmarkRepository.save(bookmark);
    }

    public void delete(Long id) {
        ebookRepository.deleteById(id);
    }
}
