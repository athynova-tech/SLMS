package com.smartlibrary.security;

import com.smartlibrary.model.User;
import com.smartlibrary.repository.UserRepository;
import org.springframework.security.access.AccessDeniedException;
import org.springframework.security.authentication.AnonymousAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;

/**
 * Resolves the authenticated user and enforces "own data or staff" rules.
 * Controllers use this instead of trusting a userId sent by the client.
 */
@Component
public class CurrentUser {

    private final UserRepository userRepository;

    public CurrentUser(UserRepository userRepository) {
        this.userRepository = userRepository;
    }

    private Authentication authentication() {
        Authentication auth = SecurityContextHolder.getContext().getAuthentication();
        if (auth == null || !auth.isAuthenticated() || auth instanceof AnonymousAuthenticationToken) {
            throw new AccessDeniedException("Authentication required");
        }
        return auth;
    }

    public User get() {
        String email = authentication().getName();
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new AccessDeniedException("User not found"));
    }

    public Long id() {
        return get().getId();
    }

    public boolean isStaff() {
        return authentication().getAuthorities().stream()
                .anyMatch(a -> a.getAuthority().equals("ROLE_ADMIN") || a.getAuthority().equals("ROLE_LIBRARIAN"));
    }

    /** Allows staff, or the user whose id is given. Anyone else gets a 403. */
    public void requireSelfOrStaff(Long userId) {
        if (isStaff()) {
            return;
        }
        if (userId == null || !userId.equals(id())) {
            throw new AccessDeniedException("You can only access your own data");
        }
    }
}
