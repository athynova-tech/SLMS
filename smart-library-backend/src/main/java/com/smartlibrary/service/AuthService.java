package com.smartlibrary.service;

import com.smartlibrary.dto.AuthResponse;
import com.smartlibrary.dto.LoginRequest;
import com.smartlibrary.dto.RefreshTokenRequest;
import com.smartlibrary.dto.RegisterRequest;
import com.smartlibrary.exception.BadRequestException;
import com.smartlibrary.model.Role;
import com.smartlibrary.model.User;
import com.smartlibrary.repository.UserRepository;
import com.smartlibrary.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private final UserRepository userRepository;
    private final JwtTokenProvider jwtTokenProvider;
    private final PasswordEncoder passwordEncoder;

    public AuthService(UserRepository userRepository, JwtTokenProvider jwtTokenProvider, PasswordEncoder passwordEncoder) {
        this.userRepository = userRepository;
        this.jwtTokenProvider = jwtTokenProvider;
        this.passwordEncoder = passwordEncoder;
    }

    public AuthResponse login(LoginRequest request) {
        User user = userRepository.findByEmail(request.email())
                .orElseThrow(() -> new BadRequestException("Invalid email or password"));

        if (!passwordEncoder.matches(request.password(), user.getPassword())) {
            throw new BadRequestException("Invalid email or password");
        }

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, token, user.getEmail(), user.getFullName(), user.getRole().name(), user.getId());
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        user.setRole(Role.member);
        user.setActive(true);
        user = userRepository.save(user);

        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, token, user.getEmail(), user.getFullName(), user.getRole().name(), user.getId());
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String email = jwtTokenProvider.getEmailFromToken(request.refreshToken());
        User user = userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
        String token = jwtTokenProvider.generateToken(user.getEmail());
        return new AuthResponse(token, token, user.getEmail(), user.getFullName(), user.getRole().name(), user.getId());
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }
}
