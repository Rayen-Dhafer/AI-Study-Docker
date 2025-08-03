package com.example.ai_assistant.controller;

import com.example.ai_assistant.service.ChatService;
import com.example.ai_assistant.service.DocumentService;
import com.example.ai_assistant.util.GroqEmbeddingUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.multipart.MultipartFile;

@RestController
@RequestMapping("/api/documents")
public class DocumentController {

    @Autowired
    private DocumentService documentService;


    @PostMapping(value = "/upload", consumes = MediaType.MULTIPART_FORM_DATA_VALUE)
    public ResponseEntity<String> uploadPdf(
            @RequestParam("file") MultipartFile file,
            @RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String text = documentService.processPdfFileForEmbeddings(file, token);
            return ResponseEntity.ok(text);
        } catch (Exception e) {
            return ResponseEntity.badRequest().body("Error reading PDF: " + e.getMessage());
        }
    }


    @Autowired
    private ChatService chatService;
    @PostMapping("/ask")
    public ResponseEntity<String> askQuestion(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String question,
            @RequestParam String title
    ) {
        String token = authHeader.replace("Bearer ", "");
        float[] embedding = GroqEmbeddingUtil.getEmbedding(question);
        String answer = chatService.askQuestion(token, question, title, embedding);
        return ResponseEntity.ok(answer);
    }


    @PostMapping("/titles")
    public ResponseEntity<?> getTitles(@RequestHeader("Authorization") String authHeader) {
        try {
            String token = authHeader.replace("Bearer ", "");
            var titles = documentService.getTitlesByEmail(token);

            if (titles == null) {
                return ResponseEntity.status(401).body("Invalid or expired token");
            }

            return ResponseEntity.ok(titles);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to fetch titles: " + e.getMessage());
        }
    }
    @PostMapping("/delete")
    public ResponseEntity<String> deletePdf(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String title) {
        try {
            String token = authHeader.replace("Bearer ", "");
            String result = documentService.deletePdf(token, title);

            if (result == null) {
                return ResponseEntity.status(401).body("Invalid or expired token");
            }

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.status(500).body("Failed to delete PDF: " + e.getMessage());
        }
    }

    @PostMapping("/generer")
    public ResponseEntity<String> generer(
            @RequestHeader("Authorization") String authHeader,
            @RequestParam String title,
            @RequestParam boolean allPdf,
            @RequestParam String partie,
            @RequestParam String type,
            @RequestParam int number
    ) {
        String token = authHeader.replace("Bearer ", "");
        float[] embedding = GroqEmbeddingUtil.getEmbedding(partie);
        String answer = chatService.generrerExs(token, partie, title, type, allPdf, number, embedding);
        return ResponseEntity.ok(answer);
    }

}
