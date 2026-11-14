package com.smartlibrary.service;

import com.smartlibrary.exception.BadRequestException;
import com.smartlibrary.exception.ResourceNotFoundException;
import com.smartlibrary.model.Role;
import com.smartlibrary.model.User;
import com.smartlibrary.repository.UserRepository;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
public class UserService {

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;

    public UserService(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
    }

    public User create(String fullName, String email, String password, String phone, String role) {
        if (fullName == null || fullName.isBlank() || email == null || email.isBlank()) {
            throw new BadRequestException("Full name and email are required");
        }
        if (password == null || password.length() < 8 || password.length() > 72) {
            throw new BadRequestException("Password must be between 8 and 72 characters");
        }
        if (userRepository.existsByEmail(email)) {
            throw new BadRequestException("Email already registered: " + email);
        }
        User user = new User();
        user.setFullName(fullName.trim());
        user.setEmail(email.trim());
        user.setPassword(passwordEncoder.encode(password));
        // Phone is unique in the database: store it only when one was given.
        if (phone != null && !phone.isBlank()) {
            if (userRepository.existsByPhone(phone.trim())) {
                throw new BadRequestException("Phone number already in use");
            }
            user.setPhone(phone.trim());
        }
        user.setRole(parseRole(role));
        user.setActive(true);
        return userRepository.save(user);
    }

    public List<User> getAll() {
        return userRepository.findAll();
    }

    public User getById(Long id) {
        return userRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + id));
    }

    public List<User> search(String fullName) {
        return userRepository.findByFullNameContainingIgnoreCase(fullName);
    }

    public List<User> getByRole(String role) {
        return userRepository.findByRole(parseRole(role));
    }

    private Role parseRole(String role) {
        try {
            return Role.valueOf(role.trim().toLowerCase());
        } catch (IllegalArgumentException | NullPointerException e) {
            throw new BadRequestException("Unknown role: " + role);
        }
    }

    public User suspend(Long id) {
        User user = getById(id);
        user.setActive(false);
        return userRepository.save(user);
    }

    public User activate(Long id) {
        User user = getById(id);
        user.setActive(true);
        return userRepository.save(user);
    }

    public void delete(Long id) {
        userRepository.deleteById(id);
    }
}
