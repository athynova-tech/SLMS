package com.smartlibrary.service;

import com.smartlibrary.dto.AuthResponse;
import com.smartlibrary.dto.ChangePasswordRequest;
import com.smartlibrary.dto.LoginRequest;
import com.smartlibrary.dto.RefreshTokenRequest;
import com.smartlibrary.dto.RegisterRequest;
import com.smartlibrary.dto.UpdateProfileRequest;
import com.smartlibrary.exception.BadRequestException;
import com.smartlibrary.model.Role;
import com.smartlibrary.model.User;
import com.smartlibrary.repository.UserRepository;
import com.smartlibrary.security.JwtTokenProvider;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

@Service
public class AuthService {

    private static final int MIN_PASSWORD_LENGTH = 8;

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
        if (!user.isActive()) {
            throw new BadRequestException("This account has been suspended. Please contact the library.");
        }
        return buildAuthResponse(user);
    }

    public AuthResponse register(RegisterRequest request) {
        if (userRepository.existsByEmail(request.email())) {
            throw new BadRequestException("Email already in use");
        }

        User user = new User();
        user.setEmail(request.email());
        user.setPassword(passwordEncoder.encode(request.password()));
        user.setFullName(request.fullName());
        // Phone is unique in the database, so only store it when one was actually given.
        if (request.phone() != null && !request.phone().isBlank()) {
            String phone = request.phone().trim();
            if (userRepository.existsByPhone(phone)) {
                throw new BadRequestException("Phone number already in use");
            }
            user.setPhone(phone);
        }
        if (request.address() != null && !request.address().isBlank()) {
            user.setAddress(request.address().trim());
        }
        user.setRole(Role.member);   // self-registration can only ever create a member
        user.setActive(true);
        user = userRepository.save(user);

        return buildAuthResponse(user);
    }

    public AuthResponse refresh(RefreshTokenRequest request) {
        String token = request.refreshToken();
        if (token == null || !jwtTokenProvider.validateRefreshToken(token)) {
            throw new BadRequestException("Invalid or expired refresh token");
        }
        User user = userRepository.findByEmail(jwtTokenProvider.getEmailFromToken(token))
                .orElseThrow(() -> new BadRequestException("User not found"));
        if (!user.isActive()) {
            throw new BadRequestException("This account has been suspended. Please contact the library.");
        }
        return buildAuthResponse(user);
    }

    public User getCurrentUser(String email) {
        return userRepository.findByEmail(email)
                .orElseThrow(() -> new BadRequestException("User not found"));
    }

    public void changePassword(String email, ChangePasswordRequest request) {
        if (request.oldPassword() == null || request.newPassword() == null) {
            throw new BadRequestException("Current and new password are required");
        }
        if (request.newPassword().length() < MIN_PASSWORD_LENGTH || request.newPassword().length() > 72) {
            throw new BadRequestException("New password must be between " + MIN_PASSWORD_LENGTH + " and 72 characters");
        }
        User user = getCurrentUser(email);
        if (!passwordEncoder.matches(request.oldPassword(), user.getPassword())) {
            throw new BadRequestException("Current password is incorrect");
        }
        if (passwordEncoder.matches(request.newPassword(), user.getPassword())) {
            throw new BadRequestException("New password must be different from the current one");
        }
        user.setPassword(passwordEncoder.encode(request.newPassword()));
        userRepository.save(user);
    }

    public User updateProfile(String email, UpdateProfileRequest request) {
        User user = getCurrentUser(email);
        user.setFullName(request.fullName().trim());
        // null means "leave unchanged"; an empty string clears the value.
        if (request.phone() != null) {
            if (request.phone().isBlank()) {
                user.setPhone(null);
            } else {
                String phone = request.phone().trim();
                if (!phone.equals(user.getPhone()) && userRepository.existsByPhone(phone)) {
                    throw new BadRequestException("Phone number already in use");
                }
                user.setPhone(phone);
            }
        }
        if (request.address() != null) {
            user.setAddress(request.address().isBlank() ? null : request.address().trim());
        }
        return userRepository.save(user);
    }

    private AuthResponse buildAuthResponse(User user) {
        String accessToken = jwtTokenProvider.generateToken(user.getEmail());
        String refreshToken = jwtTokenProvider.generateRefreshToken(user.getEmail());
        return new AuthResponse(accessToken, refreshToken, user.getEmail(), user.getFullName(),
                user.getRole().name(), user.getId());
    }
}
