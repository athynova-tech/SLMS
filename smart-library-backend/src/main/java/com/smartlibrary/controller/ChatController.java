package com.smartlibrary.controller;

import com.smartlibrary.repository.UserRepository;
import com.smartlibrary.service.ChatbotService;
import org.springframework.http.ResponseEntity;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Map;

@RestController
@RequestMapping("/api/chat")
public class ChatController {

    private final ChatbotService chatbotService;
    private final UserRepository userRepository;

    public ChatController(ChatbotService chatbotService, UserRepository userRepository) {
        this.chatbotService = chatbotService;
        this.userRepository = userRepository;
    }

    @PostMapping("/message")
    public ResponseEntity<Map<String, Object>> sendMessage(
            @RequestBody Map<String, String> body,
            Authentication authentication) {
        String message = body.getOrDefault("message", "");
        Long userId = null;

        if (authentication != null && authentication.isAuthenticated()) {
            Object principal = authentication.getPrincipal();
            if (principal instanceof UserDetails userDetails) {
                String email = userDetails.getUsername();
                userId = userRepository.findByEmail(email)
                        .map(u -> u.getId())
                        .orElse(null);
            }
        }

        Map<String, Object> response = chatbotService.processMessage(message, userId);
        return ResponseEntity.ok(response);
    }
}
