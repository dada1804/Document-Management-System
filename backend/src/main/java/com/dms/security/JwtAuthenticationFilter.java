package com.dms.security;

import io.jsonwebtoken.ExpiredJwtException;
import io.jsonwebtoken.MalformedJwtException;
import io.jsonwebtoken.SignatureException;
import io.jsonwebtoken.UnsupportedJwtException;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UserDetailsService;
import org.springframework.security.web.authentication.WebAuthenticationDetailsSource;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;

@Component
public class JwtAuthenticationFilter extends OncePerRequestFilter {

    private final JwtTokenUtil jwtTokenUtil;
    private final UserDetailsService userDetailsService;

    public JwtAuthenticationFilter(JwtTokenUtil jwtTokenUtil, UserDetailsService userDetailsService) {
        this.jwtTokenUtil = jwtTokenUtil;
        this.userDetailsService = userDetailsService;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain chain)
            throws ServletException, IOException {

        final String authorizationHeader = request.getHeader("Authorization");

        String username = null;
        String jwt = null;

        if (authorizationHeader != null && authorizationHeader.startsWith("Bearer ")) {
            jwt = authorizationHeader.substring(7);
        } else {
            // Support EventSource (SSE) where headers cannot be set
            String qpToken = request.getParameter("access_token");
            if (qpToken != null && !qpToken.isBlank()) {
                jwt = qpToken;
            }
        }

        if (jwt != null) {
            try {
                username = jwtTokenUtil.extractUsername(jwt);
            } catch (SignatureException e) {
                logger.error("JWT signature verification failed", e);
            } catch (ExpiredJwtException e) {
                logger.error("JWT token is expired", e);
            } catch (UnsupportedJwtException e) {
                logger.error("JWT token is unsupported", e);
            } catch (MalformedJwtException e) {
                logger.error("JWT token is malformed", e);
            } catch (IllegalArgumentException e) {
                logger.error("JWT token is empty or null", e);
            } catch (Exception e) {
                logger.error("Error extracting username from JWT token", e);
            }
        } else {
            System.out.println("JWT Authentication Filter - No JWT provided");
        }

        if (username != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            System.out.println("JWT Authentication Filter - Loading user details for username: " + username);
            UserDetails userDetails = this.userDetailsService.loadUserByUsername(username);
            System.out.println("JWT Authentication Filter - User details loaded: " + userDetails.getUsername());

            if (jwtTokenUtil.validateToken(jwt, userDetails)) {
                UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                        userDetails, null, userDetails.getAuthorities());
                authToken.setDetails(new WebAuthenticationDetailsSource().buildDetails(request));
                SecurityContextHolder.getContext().setAuthentication(authToken);
                logger.debug("Authentication set for user: " + username);
                System.out.println("JWT Authentication Filter - Authentication set successfully for user: " + username);
            } else {
                logger.debug("JWT token validation failed for user: " + username);
                System.out.println("JWT Authentication Filter - Token validation failed for user: " + username);
            }
        } else if (username == null) {
            logger.debug("No username extracted from JWT token");
            System.out.println("JWT Authentication Filter - No username extracted from JWT token");
        } else {
            logger.debug("Authentication already exists for user: " + username);
            System.out.println("JWT Authentication Filter - Authentication already exists for user: " + username);
        }
        chain.doFilter(request, response);
    }
} 