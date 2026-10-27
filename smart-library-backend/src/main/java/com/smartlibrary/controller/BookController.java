package com.smartlibrary.controller;

import com.smartlibrary.dto.BookRequest;
import com.smartlibrary.model.Book;
import com.smartlibrary.service.BookService;
import com.smartlibrary.service.QRCodeService;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/books")
public class BookController {

    private final BookService bookService;
    private final QRCodeService qrCodeService;

    public BookController(BookService bookService, QRCodeService qrCodeService) {
        this.bookService = bookService;
        this.qrCodeService = qrCodeService;
    }

    @GetMapping
    public ResponseEntity<List<Book>> getAll() {
        return ResponseEntity.ok(bookService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Book> getById(@PathVariable Long id) {
        return ResponseEntity.ok(bookService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<Book>> search(@RequestParam String query) {
        return ResponseEntity.ok(bookService.search(query));
    }

    @GetMapping("/available")
    public ResponseEntity<List<Book>> getAvailable() {
        return ResponseEntity.ok(bookService.getAvailable());
    }

    @GetMapping("/classification/{classification}")
    public ResponseEntity<List<Book>> getByClassification(@PathVariable String classification) {
        return ResponseEntity.ok(bookService.search(classification));
    }

    @GetMapping("/genre/{genre}")
    public ResponseEntity<List<Book>> getByGenre(@PathVariable String genre) {
        return ResponseEntity.ok(bookService.search(genre));
    }

    @GetMapping("/tag/{tag}")
    public ResponseEntity<List<Book>> getByTag(@PathVariable String tag) {
        return ResponseEntity.ok(bookService.search(tag));
    }

    @PostMapping
    public ResponseEntity<Book> create(@RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.create(request));
    }

    @PutMapping("/{id}")
    public ResponseEntity<Book> update(@PathVariable Long id, @RequestBody BookRequest request) {
        return ResponseEntity.ok(bookService.update(id, request));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        bookService.delete(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/{id}/qrcode")
    public ResponseEntity<Map<String, String>> getQRCode(@PathVariable Long id) {
        Book book = bookService.getById(id);
        String content = qrCodeService.generateBookQRContent(book);
        String qrBase64 = qrCodeService.generateQRCodeBase64(content, 300, 300);
        return ResponseEntity.ok(Map.of(
            "qrCode", qrBase64,
            "content", content,
            "bookId", String.valueOf(book.getId()),
            "title", book.getTitle()
        ));
    }

    @GetMapping("/qrcodes/batch/{categoryId}")
    public ResponseEntity<List<Map<String, Object>>> getBatchQR(@PathVariable Long categoryId) {
        List<Book> books = bookService.getByCategory(categoryId);
        List<Map<String, Object>> result = books.stream().map(book -> {
            String content = qrCodeService.generateBookQRContent(book);
            String qr = qrCodeService.generateQRCodeBase64(content, 200, 200);
            Map<String, Object> item = new java.util.HashMap<>();
            item.put("id", book.getId());
            item.put("title", book.getTitle());
            item.put("author", book.getAuthor());
            item.put("isbn", book.getIsbn());
            item.put("qrCode", qr != null ? qr : "");
            item.put("qrContent", content);
            return item;
        }).toList();
        return ResponseEntity.ok(result);
    }
}
