package com.smartlibrary.config;

import com.smartlibrary.security.JwtAuthenticationFilter;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;

import java.io.IOException;

/**
 * Central authorization rules. Rules are evaluated top to bottom; the first match wins.
 * Rules that say "authenticated" for per-user data are completed by ownership checks in the
 * controllers (see CurrentUser.requireSelfOrStaff).
 */
@Configuration
@EnableWebSecurity
public class SecurityConfig {

    private static final String ADMIN = "ADMIN";
    private static final String LIBRARIAN = "LIBRARIAN";

    private final JwtAuthenticationFilter jwtAuthenticationFilter;

    public SecurityConfig(JwtAuthenticationFilter jwtAuthenticationFilter) {
        this.jwtAuthenticationFilter = jwtAuthenticationFilter;
    }

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
        http
            .csrf(csrf -> csrf.disable())
            .cors(cors -> {})
            .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
            .exceptionHandling(ex -> ex
                .authenticationEntryPoint((request, response, authException) ->
                        writeError(response, 401, "Unauthorized", "Authentication required or token expired"))
                .accessDeniedHandler((request, response, accessDeniedException) ->
                        writeError(response, 403, "Forbidden", "You do not have permission to perform this action")))
            .authorizeHttpRequests(auth -> auth
                // ---- Public ----
                .requestMatchers("/api/auth/login", "/api/auth/register", "/api/auth/refresh",
                        "/api/auth/forgot-password", "/api/auth/reset-password").permitAll()
                .requestMatchers(HttpMethod.GET, "/api/ebooks", "/api/ebooks/*").permitAll()
                .requestMatchers("/h2-console/**").permitAll()   // only reachable when the console is enabled (dev profile)
                .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()

                // ---- Users: staff may read, only admin may change ----
                .requestMatchers(HttpMethod.GET, "/api/users", "/api/users/**").hasAnyRole(ADMIN, LIBRARIAN)
                .requestMatchers("/api/users", "/api/users/**").hasRole(ADMIN)

                // ---- Catalogue: everyone signed in may read, staff may change ----
                .requestMatchers(HttpMethod.GET, "/api/books", "/api/books/**").authenticated()
                .requestMatchers("/api/books", "/api/books/**").hasAnyRole(ADMIN, LIBRARIAN)
                .requestMatchers(HttpMethod.GET, "/api/categories", "/api/categories/**").authenticated()
                .requestMatchers("/api/categories", "/api/categories/**").hasAnyRole(ADMIN, LIBRARIAN)

                // ---- Circulation: staff only, except a member's own history (checked in the controller) ----
                .requestMatchers(HttpMethod.GET, "/api/borrow/user/**").authenticated()
                .requestMatchers("/api/borrow", "/api/borrow/**").hasAnyRole(ADMIN, LIBRARIAN)

                // ---- Reservations: staff see all; members use their own (checked in the controller) ----
                .requestMatchers(HttpMethod.GET, "/api/reservations", "/api/reservations/book/**").hasAnyRole(ADMIN, LIBRARIAN)

                // ---- Staff-only data ----
                .requestMatchers("/api/dashboard/**", "/api/reports/**").hasAnyRole(ADMIN, LIBRARIAN)
                .requestMatchers(HttpMethod.GET, "/api/payments/stats").hasAnyRole(ADMIN, LIBRARIAN)
                .requestMatchers(HttpMethod.GET, "/api/attendance/daily", "/api/attendance/stats").hasAnyRole(ADMIN, LIBRARIAN)
                .requestMatchers(HttpMethod.GET, "/api/seats/all-reservations").hasAnyRole(ADMIN, LIBRARIAN)
                .requestMatchers(HttpMethod.POST, "/api/notifications").hasAnyRole(ADMIN, LIBRARIAN)

                // ---- E-book management ----
                .requestMatchers(HttpMethod.POST, "/api/ebooks/upload").hasAnyRole(ADMIN, LIBRARIAN)
                .requestMatchers(HttpMethod.DELETE, "/api/ebooks/**").hasAnyRole(ADMIN, LIBRARIAN)

                // ---- Branches: signed-in users may read, only admin may change ----
                .requestMatchers(HttpMethod.GET, "/api/branches", "/api/branches/**").authenticated()
                .requestMatchers("/api/branches", "/api/branches/**").hasRole(ADMIN)

                // ---- Everything else needs a valid access token ----
                .anyRequest().authenticated()
            )
            .headers(headers -> headers.frameOptions(frame -> frame.sameOrigin()))
            .addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);

        return http.build();
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration config) throws Exception {
        return config.getAuthenticationManager();
    }

    private static void writeError(HttpServletResponse response, int status, String error, String message)
            throws IOException {
        response.setStatus(status);
        response.setContentType("application/json");
        response.setCharacterEncoding("UTF-8");
        response.getWriter().write(
                "{\"status\":" + status + ",\"error\":\"" + error + "\",\"message\":\"" + message + "\"}");
    }
}
