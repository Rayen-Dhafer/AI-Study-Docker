package com.example.ai_assistant.util;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.InternetAddress;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Component;

import java.io.UnsupportedEncodingException;

@Component
public class EmailUtil {

    @Autowired
    private JavaMailSender mailSender;

    public void sendResetEmail(String toEmail, String token) throws MessagingException, UnsupportedEncodingException {
        String resetLink = "http://localhost:5173/edit-password?token=" + token;

        String html = """
    <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; max-width: 600px; margin: 40px auto; background: #ffffff; border: 1px solid #e1e4e8; border-radius: 8px; box-shadow: 0 4px 12px rgba(0,0,0,0.05); padding: 40px; color: #24292e;">
        <div style="text-align: center; margin-bottom: 24px;">
            <h1 style="font-size: 28px; font-weight: 700; margin: 0; color: #4f46e5; -webkit-background-clip: text; -webkit-text-fill-color: transparent;">
                AI Study
            </h1>
        </div>
        <h2 style="font-size: 22px; font-weight: 600; margin-bottom: 24px; color: #1f2937;">
            Réinitialisation de votre mot de passe
        </h2>
        <p style="font-size: 16px; line-height: 1.5; color: #4b5563;">
            Nous avons reçu une demande de réinitialisation de mot de passe pour votre compte. Cliquez sur le bouton ci-dessous pour choisir un nouveau mot de passe. Ce lien expirera dans 15 minutes.
        </p>
        <div style="text-align: center; margin: 30px 0;">
            <a href="%s"
               style="display: inline-block; padding: 14px 28px; font-size: 16px; font-weight: 600; color: #fff; background: linear-gradient(to right, #4f46e5, #0ea5e9); border-radius: 6px; text-decoration: none; box-shadow: 0 2px 8px rgba(79, 70, 229, 0.4); transition: all 0.3s ease;">
               Réinitialiser le mot de passe
            </a>
        </div>
        <p style="font-size: 14px; color: #6b7280;">
            Si vous n'avez pas demandé de réinitialisation de mot de passe, vous pouvez ignorer cet email en toute sécurité. Votre compte est sécurisé.
        </p>
        <hr style="border: none; border-top: 1px solid #e5e7eb; margin: 32px 0;">
        <div style="text-align: center;">
            <p style="font-size: 12px; color: #9ca3af;">
                © 2025 AI Study. Tous droits réservés.<br>
                Paris, France
            </p>
        </div>
    </div>
    """.formatted(resetLink);

        MimeMessage message = mailSender.createMimeMessage();
        MimeMessageHelper helper = new MimeMessageHelper(message, true);
        helper.setTo(toEmail);
        helper.setFrom(new InternetAddress("arena1clubs@gmail.com", "AI Study"));
        helper.setSubject("Reset Password");
        helper.setText(html, true);

        mailSender.send(message);
    }
}
