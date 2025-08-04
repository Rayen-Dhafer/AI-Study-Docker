package com.example.ai_assistant.util;

import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import java.util.*;

public class GroqEmbeddingUtil {
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String API_KEY = "GROQ_API_KEY";
    private static final String MODEL = "llama-3.3-70b-versatile"; 

    private static final int EMBEDDING_SIZE = 384;
    private static final Random RANDOM = new Random();

    public static float[] getEmbedding(String text) {
        try {
            String semanticDesc = getSemanticDescription(text);
            float[] embedding = new float[384];


            int hash = semanticDesc.hashCode();
            for (int i = 0; i < 384; i++) {
                embedding[i] = (hash % 1000) / 1000f;
                hash = hash * 31 + i;  
            }
            return embedding;
        } catch (Exception e) {
            return getRandomVector(384);
        }
    }

    private static float[] getRandomVector(int dim) {
        float[] v = new float[dim];
        for (int i = 0; i < dim; i++) {
            v[i] = (float) (Math.random() * 2 - 1);  
        }
        return v;
    }

    private static String getSemanticDescription(String text) {
        RestTemplate restTemplate = new RestTemplate();
        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        headers.setBearerAuth(API_KEY);

        String prompt = "Describe the core semantic meaning of this text in 10 words or less:\n" + text;

        Map<String, Object> body = Map.of(
                "model", MODEL,
                "messages", List.of(Map.of("role", "user", "content", prompt)),
                "max_tokens", 20,
                "temperature", 0.1
        );

        ResponseEntity<Map> response = restTemplate.postForEntity(
                GROQ_API_URL,
                new HttpEntity<>(body, headers),
                Map.class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            return extractResponseContent(response.getBody());
        }
        throw new RuntimeException("Groq API request failed");
    }

    private static String extractResponseContent(Map<String, Object> response) {
        try {
            return ((List<Map<String, Object>>) response.get("choices"))
                    .get(0)
                    .get("message")
                    .toString();
        } catch (Exception e) {
            throw new RuntimeException("Failed to parse Groq response");
        }
    }

}