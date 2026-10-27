package com.smartlibrary.service;

import com.smartlibrary.dto.NotificationRequest;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.model.Notification;
import com.smartlibrary.model.User;
import com.smartlibrary.repository.NotificationRepository;
import com.smartlibrary.repository.UserRepository;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class NotificationService {

    private final NotificationRepository notificationRepository;
    private final UserRepository userRepository;

    public NotificationService(NotificationRepository notificationRepository, UserRepository userRepository) {
        this.notificationRepository = notificationRepository;
        this.userRepository = userRepository;
    }

    public List<Notification> getAll(Long userId, boolean unreadOnly) {
        if (unreadOnly) {
            return notificationRepository.findByUserIdAndReadFalseOrderByCreatedAtDesc(userId);
        }
        return notificationRepository.findByUserIdOrderByCreatedAtDesc(userId);
    }

    public long getUnreadCount(Long userId) {
        return notificationRepository.countByUserIdAndReadFalse(userId);
    }

    public Notification create(Long userId, NotificationRequest request) {
        User user = userRepository.findById(userId)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + userId));
        Notification notification = new Notification();
        notification.setUser(user);
        notification.setTitle(request.title());
        notification.setMessage(request.message());
        notification.setType(request.type());
        notification.setRead(false);
        return notificationRepository.save(notification);
    }

    public void markRead(Long id) {
        Notification notification = notificationRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Notification not found: " + id));
        notification.setRead(true);
        notificationRepository.save(notification);
    }

    public void markAllRead(Long userId) {
        notificationRepository.markAllAsRead(userId);
    }

    public void delete(Long id) {
        notificationRepository.deleteById(id);
    }
}
