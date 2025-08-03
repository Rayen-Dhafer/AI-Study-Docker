package com.example.ai_assistant.service;

import org.springframework.http.*;
import org.springframework.web.client.RestTemplate;
import com.fasterxml.jackson.databind.*;

import java.util.*;


public class ChromaService {
    private static final String SAVE_EMBEDDING_URL = "http://aistudydocker-python-server:5000/api/save-embedding";
    private static final String GET_TITLES_URL = "http://aistudydocker-python-server:5000/api/get-titles";
    private static final String DELETE_URL = "http://aistudydocker-python-server:5000/api/delete";
    private static final String COLLECTION_NAME = "document_embeddings";

    public static void saveEmbedding(String email, String title, String chunk, float[] embedding) {
        if (embedding.length != 384) {
            throw new IllegalArgumentException("Embedding must be 384-dimensional");
        }

        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> payload = new HashMap<>();
        payload.put("embedding", embedding);
        payload.put("email", email);
        payload.put("text", chunk);
        payload.put("title", title);
        payload.put("collection_name", COLLECTION_NAME);

        restTemplate.postForEntity(
                SAVE_EMBEDDING_URL,
                new HttpEntity<>(payload, new HttpHeaders()),
                String.class
        );
    }

    public static List<String> getTitles(String email) {

        RestTemplate restTemplate = new RestTemplate();


        Map<String, Object> request = new HashMap<>();
        request.put("email", email);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);
        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(request, headers);

        ResponseEntity<String> response = restTemplate.exchange(
                GET_TITLES_URL,
                HttpMethod.POST,
                httpEntity,
                String.class
        );

        if (response.getStatusCode() == HttpStatus.OK) {
            try {
                // Parse JSON response
                ObjectMapper mapper = new ObjectMapper();
                JsonNode root = mapper.readTree(response.getBody());
                JsonNode titlesNode = root.get("titles");

                List<String> titles = new ArrayList<>();
                if (titlesNode.isArray()) {
                    for (JsonNode title : titlesNode) {
                        titles.add(title.asText());
                    }
                }
                return titles;

            } catch (Exception e) {
                throw new RuntimeException("Failed to parse get-titles response: " + e.getMessage());
            }
        } else {
            throw new RuntimeException("Failed to fetch titles, status code: " + response.getStatusCode());
        }
    }


    public static void deleteByTitleAndEmail(String email, String title) {
        RestTemplate restTemplate = new RestTemplate();

        Map<String, Object> request = new HashMap<>();
        request.put("email", email);
        request.put("title", title);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> httpEntity = new HttpEntity<>(request, headers);



        ResponseEntity<String> response = restTemplate.exchange(
                DELETE_URL,
                HttpMethod.POST,
                httpEntity,
                String.class
        );

        if (response.getStatusCode() != HttpStatus.OK) {
            throw new RuntimeException("Failed to delete documents: " + response.getBody());
        }
    }

}
