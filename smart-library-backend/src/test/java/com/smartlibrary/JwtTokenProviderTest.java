package com.smartlibrary;

import com.smartlibrary.security.JwtTokenProvider;
import org.junit.jupiter.api.Test;

import java.util.Base64;

import static org.junit.jupiter.api.Assertions.assertEquals;
import static org.junit.jupiter.api.Assertions.assertFalse;
import static org.junit.jupiter.api.Assertions.assertThrows;
import static org.junit.jupiter.api.Assertions.assertTrue;

class JwtTokenProviderTest {

    private static final String SECRET =
            Base64.getEncoder().encodeToString("0123456789abcdef0123456789abcdef".getBytes());

    private final JwtTokenProvider provider = new JwtTokenProvider(SECRET, 60_000, 600_000);

    @Test
    void accessTokenIsAcceptedAsAccessOnly() {
        String token = provider.generateToken("member@library.com");
        assertTrue(provider.validateToken(token));
        assertFalse(provider.validateRefreshToken(token));
        assertEquals("member@library.com", provider.getEmailFromToken(token));
    }

    @Test
    void refreshTokenCannotBeUsedAsAccessToken() {
        String refresh = provider.generateRefreshToken("member@library.com");
        assertTrue(provider.validateRefreshToken(refresh));
        assertFalse(provider.validateToken(refresh));
    }

    @Test
    void expiredTokenIsRejected() {
        JwtTokenProvider shortLived = new JwtTokenProvider(SECRET, -1_000, -1_000);
        assertFalse(shortLived.validateToken(shortLived.generateToken("a@b.com")));
    }

    @Test
    void tamperedTokenIsRejected() {
        String token = provider.generateToken("member@library.com");
        assertFalse(provider.validateToken(token + "x"));
    }

    @Test
    void weakSecretIsRefused() {
        String weak = Base64.getEncoder().encodeToString("too-short".getBytes());
        assertThrows(IllegalStateException.class, () -> new JwtTokenProvider(weak, 1000, 1000));
    }
}
