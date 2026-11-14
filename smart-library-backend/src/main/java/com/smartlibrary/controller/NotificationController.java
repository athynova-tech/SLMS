package com.smartlibrary.controller;

import com.smartlibrary.dto.NotificationRequest;
import com.smartlibrary.model.Notification;
import com.smartlibrary.security.CurrentUser;
import com.smartlibrary.service.NotificationService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/notifications")
public class NotificationController {

    private final NotificationService notificationService;
    private final CurrentUser currentUser;

    public NotificationController(NotificationService notificationService, CurrentUser currentUser) {
        this.notificationService = notificationService;
        this.currentUser = currentUser;
    }

    @GetMapping
    public ResponseEntity<List<Notification>> getAll(
            @RequestParam Long userId,
            @RequestParam(defaultValue = "false") boolean unreadOnly) {
        currentUser.requireSelfOrStaff(userId);
        return ResponseEntity.ok(notificationService.getAll(userId, unreadOnly));
    }

    @GetMapping("/unread-count")
    public ResponseEntity<Long> getUnreadCount(@RequestParam Long userId) {
        currentUser.requireSelfOrStaff(userId);
        return ResponseEntity.ok(notificationService.getUnreadCount(userId));
    }

    // Staff only (see SecurityConfig).
    @PostMapping
    public ResponseEntity<Notification> create(@RequestParam Long userId,
                                                @RequestBody NotificationRequest request) {
        return ResponseEntity.ok(notificationService.create(userId, request));
    }

    @PostMapping("/{id}/read")
    public ResponseEntity<Void> markRead(@PathVariable Long id) {
        currentUser.requireSelfOrStaff(notificationService.getById(id).getUser().getId());
        notificationService.markRead(id);
        return ResponseEntity.ok().build();
    }

    @PostMapping("/read-all")
    public ResponseEntity<Void> markAllRead(@RequestParam Long userId) {
        currentUser.requireSelfOrStaff(userId);
        notificationService.markAllRead(userId);
        return ResponseEntity.ok().build();
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        currentUser.requireSelfOrStaff(notificationService.getById(id).getUser().getId());
        notificationService.delete(id);
        return ResponseEntity.noContent().build();
    }
}
