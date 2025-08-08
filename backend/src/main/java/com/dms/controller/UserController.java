package com.dms.controller;

import com.dms.entity.User;
import com.dms.service.UserService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @GetMapping
    public ResponseEntity<?> listActiveUsers() {
        List<User> users = userService.findAllActiveUsers();
        List<UserSummary> summaries = users.stream()
                .map(u -> new UserSummary(u.getId(), u.getUsername(), u.getEmail(), u.getFirstName(), u.getLastName()))
                .collect(Collectors.toList());
        return ResponseEntity.ok(summaries);
    }

    public static class UserSummary {
        private Long id;
        private String username;
        private String email;
        private String firstName;
        private String lastName;

        public UserSummary(Long id, String username, String email, String firstName, String lastName) {
            this.id = id; this.username = username; this.email = email; this.firstName = firstName; this.lastName = lastName;
        }
        public Long getId() { return id; }
        public String getUsername() { return username; }
        public String getEmail() { return email; }
        public String getFirstName() { return firstName; }
        public String getLastName() { return lastName; }
    }
} 