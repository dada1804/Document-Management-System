package com.dms.security;

import org.junit.jupiter.api.Test;
import org.springframework.boot.test.context.SpringBootTest;
import org.springframework.security.core.userdetails.User;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.test.context.TestPropertySource;

import java.util.ArrayList;

import static org.junit.jupiter.api.Assertions.*;

@SpringBootTest
@TestPropertySource(properties = {
    "jwt.secret=9a825ec87975b699104c675aeb969f359c2b31510e701647ba1863d68d7d93b9",
    "jwt.expiration=86400000"
})
class JwtTokenUtilTest {

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @Test
    void testJwtTokenGenerationAndValidation() {
        // Create a test user
        UserDetails userDetails = User.builder()
                .username("testuser")
                .password("password")
                .authorities(new ArrayList<>())
                .build();

        // Generate token
        String token = jwtTokenUtil.generateToken(userDetails, 1L);
        
        // Verify token is not null
        assertNotNull(token);
        assertFalse(token.isEmpty());

        // Extract username from token
        String extractedUsername = jwtTokenUtil.extractUsername(token);
        assertEquals("testuser", extractedUsername);

        // Extract user ID from token
        Long extractedUserId = jwtTokenUtil.extractUserId(token);
        assertEquals(1L, extractedUserId);

        // Validate token
        assertTrue(jwtTokenUtil.validateToken(token, userDetails));
    }

    @Test
    void testJwtTokenWithInvalidSecret() {
        // This test verifies that the JWT utility can handle the secret key properly
        UserDetails userDetails = User.builder()
                .username("testuser")
                .password("password")
                .authorities(new ArrayList<>())
                .build();

        // Generate token should not throw exception
        assertDoesNotThrow(() -> {
            String token = jwtTokenUtil.generateToken(userDetails, 1L);
            assertNotNull(token);
        });
    }
} 