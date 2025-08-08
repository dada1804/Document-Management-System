package com.dms.controller;

import com.dms.dto.AuthResponse;
import com.dms.dto.LoginRequest;
import com.dms.dto.UserRegistrationRequest;
import com.dms.entity.User;
import com.dms.security.JwtTokenUtil;
import com.dms.service.UserService;
import jakarta.validation.Valid;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/auth")
public class AuthController {

    @Autowired
    private AuthenticationManager authenticationManager;

    @Autowired
    private UserService userService;

    @Autowired
    private JwtTokenUtil jwtTokenUtil;

    @PostMapping("/register")
    public ResponseEntity<?> registerUser(@Valid @RequestBody UserRegistrationRequest registrationRequest) {
        try {
            // Check if username or email already exists
            if (userService.existsByUsername(registrationRequest.getUsername())) {
                return ResponseEntity.badRequest().body("Username already exists");
            }
            if (userService.existsByEmail(registrationRequest.getEmail())) {
                return ResponseEntity.badRequest().body("Email already exists");
            }

            // Create new user
            User user = new User(
                    registrationRequest.getUsername(),
                    registrationRequest.getEmail(),
                    registrationRequest.getPassword(),
                    registrationRequest.getFirstName(),
                    registrationRequest.getLastName()
            );

            User savedUser = userService.createUser(user);

            // Generate JWT token
            String token = jwtTokenUtil.generateToken(savedUser, savedUser.getId());

            AuthResponse authResponse = new AuthResponse(
                    token,
                    savedUser.getId(),
                    savedUser.getUsername(),
                    savedUser.getEmail(),
                    savedUser.getRole().name()
            );

            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Registration failed: " + e.getMessage());
        }
    }

    @PostMapping("/login")
    public ResponseEntity<?> authenticateUser(@Valid @RequestBody LoginRequest loginRequest) {
        try {
            Authentication authentication = authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword())
            );

            UserDetails userDetails = (UserDetails) authentication.getPrincipal();
            User user = userService.findByUsername(userDetails.getUsername()).orElse(null);

            if (user == null) {
                return ResponseEntity.badRequest().body("User not found");
            }

            String token = jwtTokenUtil.generateToken(userDetails, user.getId());

            AuthResponse authResponse = new AuthResponse(
                    token,
                    user.getId(),
                    user.getUsername(),
                    user.getEmail(),
                    user.getRole().name()
            );

            return ResponseEntity.ok(authResponse);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Invalid username or password");
        }
    }

    @GetMapping("/validate")
    public ResponseEntity<?> validateToken(@RequestHeader("Authorization") String token) {
        try {
            if (token != null && token.startsWith("Bearer ")) {
                String jwt = token.substring(7);
                String username = jwtTokenUtil.extractUsername(jwt);
                UserDetails userDetails = userService.loadUserByUsername(username);
                
                if (jwtTokenUtil.validateToken(jwt, userDetails)) {
                    User user = userService.findByUsername(username).orElse(null);
                    if (user != null) {
                        AuthResponse authResponse = new AuthResponse(
                                jwt,
                                user.getId(),
                                user.getUsername(),
                                user.getEmail(),
                                user.getRole().name()
                        );
                        return ResponseEntity.ok(authResponse);
                    }
                }
            }
            return ResponseEntity.badRequest().body("Invalid token");
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Token validation failed");
        }
    }
} 