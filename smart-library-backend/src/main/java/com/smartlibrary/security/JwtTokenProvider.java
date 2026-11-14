package com.smartlibrary.security;

import io.jsonwebtoken.Claims;
import io.jsonwebtoken.JwtException;
import io.jsonwebtoken.Jwts;
import io.jsonwebtoken.io.Decoders;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;

@Component
public class JwtTokenProvider {

    private static final String TYPE_CLAIM = "type";
    private static final String ACCESS = "access";
    private static final String REFRESH = "refresh";

    private final SecretKey signingKey;
    private final long accessExpiration;
    private final long refreshExpiration;

    public JwtTokenProvider(
            @Value("${jwt.secret}") String jwtSecret,
            @Value("${jwt.expiration:1800000}") long accessExpiration,
            @Value("${jwt.refresh-expiration:604800000}") long refreshExpiration) {
        byte[] keyBytes = Decoders.BASE64.decode(jwtSecret);
        if (keyBytes.length < 32) {
            throw new IllegalStateException("jwt.secret must be Base64 and decode to at least 32 bytes");
        }
        this.signingKey = Keys.hmacShaKeyFor(keyBytes);
        this.accessExpiration = accessExpiration;
        this.refreshExpiration = refreshExpiration;
    }

    /** Short-lived token used on every API request. */
    public String generateToken(String email) {
        return build(email, ACCESS, accessExpiration);
    }

    /** Longer-lived token that can only be exchanged for a new pair at /api/auth/refresh. */
    public String generateRefreshToken(String email) {
        return build(email, REFRESH, refreshExpiration);
    }

    public String getEmailFromToken(String token) {
        return parse(token).getSubject();
    }

    /** True only for a valid, unexpired ACCESS token. */
    public boolean validateToken(String token) {
        return hasType(token, ACCESS);
    }

    /** True only for a valid, unexpired REFRESH token. */
    public boolean validateRefreshToken(String token) {
        return hasType(token, REFRESH);
    }

    private String build(String email, String type, long ttlMillis) {
        Date now = new Date();
        return Jwts.builder()
                .subject(email)
                .claim(TYPE_CLAIM, type)
                .issuedAt(now)
                .expiration(new Date(now.getTime() + ttlMillis))
                .signWith(signingKey)
                .compact();
    }

    private boolean hasType(String token, String expectedType) {
        try {
            Claims claims = parse(token);
            return expectedType.equals(claims.get(TYPE_CLAIM, String.class));
        } catch (JwtException | IllegalArgumentException e) {
            return false;
        }
    }

    private Claims parse(String token) {
        return Jwts.parser()
                .verifyWith(signingKey)
                .build()
                .parseSignedClaims(token)
                .getPayload();
    }
}
