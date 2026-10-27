package com.smartlibrary.service;

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
        if (userRepository.existsByEmail(email)) {
            throw new RuntimeException("Email already registered: " + email);
        }
        User user = new User();
        user.setFullName(fullName);
        user.setEmail(email);
        user.setPassword(passwordEncoder.encode(password));
        user.setPhone(phone);
        user.setRole(Role.valueOf(role.toLowerCase()));
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
        return userRepository.findByRole(Role.valueOf(role));
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
