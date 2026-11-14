package com.smartlibrary.controller;

import com.smartlibrary.model.*;
import com.smartlibrary.security.CurrentUser;
import com.smartlibrary.service.*;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/ebooks")
public class EBookController {

    private final EBookService ebookService;
    private final CurrentUser currentUser;

    public EBookController(EBookService ebookService, CurrentUser currentUser) {
        this.ebookService = ebookService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<EBook>> getAll() {
        return ResponseEntity.ok(ebookService.getAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<EBook> getById(@PathVariable Long id) {
        return ResponseEntity.ok(ebookService.getById(id));
    }

    @GetMapping("/search")
    public ResponseEntity<List<EBook>> search(@RequestParam String q) {
        return ResponseEntity.ok(ebookService.search(q));
    }

    @PostMapping("/upload")
    public ResponseEntity<EBook> upload(
            @RequestParam Long bookId,
            @RequestParam String file,
            @RequestParam Long userId,
            @RequestParam(required = false) String title) {
        return ResponseEntity.ok(ebookService.upload(bookId, file, userId, title));
    }

    @GetMapping("/{id}/bookmarks")
    public ResponseEntity<List<Bookmark>> getBookmarks(@PathVariable Long id, @RequestParam Long userId) {
        currentUser.requireSelfOrStaff(userId);
        return ResponseEntity.ok(ebookService.getBookmarks(id, userId));
    }

    @PostMapping("/{id}/bookmark")
    public ResponseEntity<Bookmark> addBookmark(
            @PathVariable Long id,
            @RequestParam Long userId,
            @RequestParam Integer page,
            @RequestParam(required = false) String note,
            @RequestParam(required = false) String highlightedText) {
        currentUser.requireSelfOrStaff(userId);
        return ResponseEntity.ok(ebookService.addBookmark(id, userId, page, note, highlightedText));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        ebookService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
