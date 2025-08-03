package com.example.ai_assistant.controller;

import com.example.ai_assistant.model.User;
import com.example.ai_assistant.service.ChatService;
import com.example.ai_assistant.service.UserService;
import com.example.ai_assistant.util.GroqEmbeddingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.Map;

@RestController
@RequestMapping("/api/users")
public class UserController {

    @Autowired
    private UserService userService;

    @PostMapping("/login")
    public ResponseEntity<String> login(@RequestBody User user) {
        String token = userService.validateLogin(user.getEmail(), user.getPassword());
        if (token == null) {
            return ResponseEntity.status(401).body("Invalid email or password");
        }
        return ResponseEntity.ok(token);
    }

    @PostMapping("/register")
    public ResponseEntity<String> register(@RequestBody User user) {
        String token = userService.registerUser(user);
        return ResponseEntity.ok(token);
    }

    @PostMapping("/reset-password")
    public ResponseEntity<String> resetPassword(@RequestBody User user) {

        String responseMsg = userService.sendResetEmail(user.getEmail());

        if (responseMsg.startsWith("Failed")) {
            return ResponseEntity.status(500).body(responseMsg);
        }

        return ResponseEntity.ok(responseMsg);
    }


    @PostMapping("/edit-password")
    public ResponseEntity<?> editPassword(
            @RequestHeader("Authorization") String authHeader,
            @RequestBody Map<String, String> body
    ) {
        String token = authHeader.replace("Bearer ", "");
        String newPassword = body.get("password");

        String newToken = userService.editPassword(token, newPassword);

        if (newToken == null) {
            return ResponseEntity.badRequest()
                    .body(Collections.singletonMap("message", "Jeton invalide ou email incorrect"));
        }
        return ResponseEntity.ok(Collections.singletonMap("token", newToken));
    }





}
