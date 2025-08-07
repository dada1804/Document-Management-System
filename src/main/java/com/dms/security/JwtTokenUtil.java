package com.dms.security;

import io.jsonwebtoken.*;
import io.jsonwebtoken.security.Keys;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.stereotype.Component;

import javax.crypto.SecretKey;
import java.util.Date;
import java.util.HashMap;
import java.util.Map;
import java.util.function.Function;

@Component
public class JwtTokenUtil {

    @Value("${jwt.secret}")
    private String secret;

    @Value("${jwt.expiration}")
    private Long expiration;

    private SecretKey getSigningKey() {
        // For HMAC-SHA256, we need at least 256 bits (32 bytes)
        // If the secret is shorter, we'll use SHA-256 to hash it to get a proper key
        byte[] keyBytes = secret.getBytes();
        if (keyBytes.length < 32) {
            // Use SHA-256 to hash the secret to get a 32-byte key
            try {
                java.security.MessageDigest digest = java.security.MessageDigest.getInstance("SHA-256");
                byte[] hashedKey = digest.digest(keyBytes);
                return Keys.hmacShaKeyFor(hashedKey);
            } catch (java.security.NoSuchAlgorithmException e) {
                // Fallback: pad the key
                byte[] paddedKey = new byte[32];
                System.arraycopy(keyBytes, 0, paddedKey, 0, Math.min(keyBytes.length, 32));
                return Keys.hmacShaKeyFor(paddedKey);
            }
        }
        return Keys.hmacShaKeyFor(keyBytes);
    }

    public String extractUsername(String token) {
        try {
            String username = extractClaim(token, Claims::getSubject);
            System.out.println("JWT Token - Extracted username: " + username);
            return username;
        } catch (Exception e) {
            System.out.println("JWT Token - Error extracting username: " + e.getMessage());
            throw e;
        }
    }

    public Date extractExpiration(String token) {
        return extractClaim(token, Claims::getExpiration);
    }

    public <T> T extractClaim(String token, Function<Claims, T> claimsResolver) {
        final Claims claims = extractAllClaims(token);
        return claimsResolver.apply(claims);
    }

    private Claims extractAllClaims(String token) {
        try {
            Claims claims = Jwts.parserBuilder()
                    .setSigningKey(getSigningKey())
                    .build()
                    .parseClaimsJws(token)
                    .getBody();
            System.out.println("JWT Token - Successfully parsed claims for subject: " + claims.getSubject());
            return claims;
        } catch (Exception e) {
            System.out.println("JWT Token - Error parsing claims: " + e.getMessage());
            throw e;
        }
    }

    private Boolean isTokenExpired(String token) {
        return extractExpiration(token).before(new Date());
    }

    public String generateToken(UserDetails userDetails) {
        Map<String, Object> claims = new HashMap<>();
        return createToken(claims, userDetails.getUsername());
    }

    public String generateToken(UserDetails userDetails, Long userId) {
        Map<String, Object> claims = new HashMap<>();
        claims.put("userId", userId);
        String token = createToken(claims, userDetails.getUsername());
        System.out.println("JWT Token - Generated token for user: " + userDetails.getUsername() + ", userId: " + userId);
        System.out.println("JWT Token - Token: " + token.substring(0, 20) + "...");
        return token;
    }

    private String createToken(Map<String, Object> claims, String subject) {
        String token = Jwts.builder()
                .setClaims(claims)
                .setSubject(subject)
                .setIssuedAt(new Date(System.currentTimeMillis()))
                .setExpiration(new Date(System.currentTimeMillis() + expiration))
                .signWith(getSigningKey(), SignatureAlgorithm.HS256)
                .compact();
        System.out.println("JWT Token - Created token for subject: " + subject + ", claims: " + claims);
        return token;
    }

    public Boolean validateToken(String token, UserDetails userDetails) {
        final String username = extractUsername(token);
        boolean isValid = (username.equals(userDetails.getUsername()) && !isTokenExpired(token));
        System.out.println("JWT Token validation - Username from token: " + username);
        System.out.println("JWT Token validation - Username from userDetails: " + userDetails.getUsername());
        System.out.println("JWT Token validation - Token expired: " + isTokenExpired(token));
        System.out.println("JWT Token validation - Is valid: " + isValid);
        return isValid;
    }

    public Long extractUserId(String token) {
        Claims claims = extractAllClaims(token);
        return claims.get("userId", Long.class);
    }
} 