

package com.example.ai_assistant.service;

import com.example.ai_assistant.model.User;
import com.example.ai_assistant.model.UserRepository;
import com.example.ai_assistant.util.EmailUtil;
import com.example.ai_assistant.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import jakarta.mail.MessagingException;
import java.io.UnsupportedEncodingException;

@Service
public class UserService {


    @Autowired
    private JwtUtil jwtUtil;
    @Autowired
    private UserRepository userRepository;



    public String validateLogin(String email, String password) {
        User existingUser = userRepository.findByEmail(email);

        if (existingUser == null) {
            return null; // Email not found
        }

        if (!existingUser.getPassword().equals(password)) {
            return null; // Password incorrect
        }

        return jwtUtil.generateToken(email, 1000 * 60 * 60 * 12);
    }



    public String registerUser(User user) {

        User savedUser = userRepository.save(user);

        return jwtUtil.generateToken(user.getEmail(),1000 * 60 * 60 * 12);
    }


    @Autowired
    private EmailUtil emailUtil;



    public String sendResetEmail(String email) {
        String resetToken = jwtUtil.generateToken(email , 1000 * 60 * 15);
        try {
            emailUtil.sendResetEmail(email, resetToken);
            return "Reset email sent successfully";
        } catch (MessagingException | UnsupportedEncodingException e) {
            return "Failed to send reset email";
        }
    }





    public String editPassword(String token, String newPassword) {
        if (!jwtUtil.validateToken(token)) {
            return null;
        }

        String email = jwtUtil.extractUseremail(token);

        User user = userRepository.findByEmail(email);
        if (user == null) {
            return null; // User not found
        }

        user.setPassword(newPassword);

        userRepository.save(user);

        // Return a new token with 12h expiry
        return jwtUtil.generateToken(email, 1000 * 60 * 60 * 12);
    }

}
