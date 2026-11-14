package com.smartlibrary.config;

import com.smartlibrary.model.Role;
import com.smartlibrary.model.User;
import com.smartlibrary.repository.UserRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Profile;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

/**
 * Outside the dev profile there is no demo data, so the first administrator is created from
 * environment variables (ADMIN_EMAIL, ADMIN_PASSWORD) when the users table is empty.
 */
@Component
@Profile("!dev")
public class AdminBootstrap implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(AdminBootstrap.class);

    private final UserRepository userRepository;
    private final PasswordEncoder passwordEncoder;
    private final String adminEmail;
    private final String adminPassword;

    public AdminBootstrap(UserRepository userRepository,
                          PasswordEncoder passwordEncoder,
                          @Value("${app.bootstrap.admin-email:}") String adminEmail,
                          @Value("${app.bootstrap.admin-password:}") String adminPassword) {
        this.userRepository = userRepository;
        this.passwordEncoder = passwordEncoder;
        this.adminEmail = adminEmail;
        this.adminPassword = adminPassword;
    }

    @Override
    public void run(String... args) {
        if (userRepository.count() > 0) {
            return;
        }
        if (adminEmail.isBlank() || adminPassword.length() < 12) {
            log.warn("No users exist. Set ADMIN_EMAIL and ADMIN_PASSWORD (12+ characters) to create the first administrator.");
            return;
        }
        User admin = new User();
        admin.setEmail(adminEmail.trim());
        admin.setPassword(passwordEncoder.encode(adminPassword));
        admin.setFullName("System Administrator");
        admin.setRole(Role.admin);
        admin.setActive(true);
        userRepository.save(admin);
        log.info("Created initial administrator account for {}", adminEmail.trim());
    }
}
