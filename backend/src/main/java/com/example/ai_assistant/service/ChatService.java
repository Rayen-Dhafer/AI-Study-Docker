package com.example.ai_assistant.service;

import com.example.ai_assistant.util.GroqEmbeddingUtil;
import com.example.ai_assistant.util.JwtUtil;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.*;

@Service
public class ChatService {
    private static final String FLASK_SEARCH_URL = "http://aistudydocker-python-server:5000/api/search";
    private static final String GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions";
    private static final String API_KEY = "GROQ_API_KEY";
    private static final String MODEL = "meta-llama/llama-4-scout-17b-16e-instruct";

    private static final String COLLECTION_NAME = "document_embeddings"; // same as in ChromaService

    @Autowired
    private JwtUtil jwtUtil;
    public String askQuestion(String token, String question, String title, float[] embedding) {


        if (!jwtUtil.validateToken(token)) {
            return null;
        }
        String email = jwtUtil.extractUseremail(token);

        RestTemplate restTemplate = new RestTemplate();

         
        String normalizedEmail = email.toLowerCase();

         
        Map<String, Object> searchPayload = new HashMap<>();
        searchPayload.put("embedding", embedding);
        searchPayload.put("email", normalizedEmail);
        searchPayload.put("title", title);
        searchPayload.put("collection_name", COLLECTION_NAME);
        searchPayload.put("top_k", 3);

        HttpHeaders headers = new HttpHeaders();
        headers.setContentType(MediaType.APPLICATION_JSON);

        HttpEntity<Map<String, Object>> searchRequest = new HttpEntity<>(searchPayload, headers);
        ResponseEntity<Map> searchResponse = restTemplate.postForEntity(FLASK_SEARCH_URL, searchRequest, Map.class);

        
        List<String> matches = (List<String>) ((Map) searchResponse.getBody()).get("matches");
        String context = String.join("\n", matches);

        if (context == null || context.trim().isEmpty()) {
            return "Aucune information trouvée dans le PDF";
        }

        Map<String, Object> groqBody = new HashMap<>();
        groqBody.put("model", MODEL);

        List<Map<String, String>> messages = new ArrayList<>();
        messages.add(Map.of("role", "system", "content",
                "Tu es un assistant intelligent. Tu dois répondre uniquement à partir du texte fourni ci-dessous. "+
                        "Si tu ne trouves pas la réponse dans le contexte, dis simplement 'Aucune information trouvée dans le PDF'" ));

        messages.add(Map.of("role", "user", "content", "Contexte:\n" + context + "\n\nQuestion: " + question));
        groqBody.put("messages", messages);

        System.out.println("Contexte envoyé au modèle:\n" + groqBody);

        HttpHeaders groqHeaders = new HttpHeaders();
        groqHeaders.setContentType(MediaType.APPLICATION_JSON);
        groqHeaders.setBearerAuth(API_KEY);

        HttpEntity<Map<String, Object>> groqRequest = new HttpEntity<>(groqBody, groqHeaders);
        ResponseEntity<Map> groqResponse = restTemplate.postForEntity(GROQ_API_URL, groqRequest, Map.class);

        try {
            Map<String, Object> message = (Map<String, Object>)
                    ((List<Map<String, Object>>) groqResponse.getBody().get("choices"))
                            .get(0).get("message");
            return message.get("content").toString();
        } catch (Exception e) {
            return "Erreur dans la réponse du modèle.";
        }
    }

    public String generrerExs(String token, String partie, String title, String type, boolean allPdf, int number, float[] embedding) {
        if (!jwtUtil.validateToken(token)) {
            return null;
        }

        String email = jwtUtil.extractUseremail(token);
        RestTemplate restTemplate = new RestTemplate();
        String normalizedEmail = email.toLowerCase();

        String context;

        if (!allPdf) {
             
            context = askQuestion(token, "Quel est le contenu de la partie " + partie + " ?", title, embedding);

            // Check if askQuestion says no info
            if (context == null || context.trim().isEmpty() || context.equalsIgnoreCase("Aucune information trouvée dans le PDF.")) {
                
                return "Aucune information trouvée pour la partie spécifiée, génération annulée.";
            }
        } else {
            
            Map<String, Object> getAllPayload = new HashMap<>();
            getAllPayload.put("email", normalizedEmail);
            getAllPayload.put("title", title);

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, Object>> getAllRequest = new HttpEntity<>(getAllPayload, headers);
            ResponseEntity<Map> getAllResponse = restTemplate.postForEntity("http://aistudydocker-python-server:5000/api/getAll", getAllRequest, Map.class);

            List<String> matches = (List<String>) ((Map) getAllResponse.getBody()).get("matches");
            context = String.join("\n", matches);

            if (context == null || context.trim().isEmpty()) {
                return "Je ne sais pas.";
            }
        }

         
        Map<String, Object> groqBody = new HashMap<>();
        groqBody.put("model", MODEL);

        List<Map<String, String>> messages = new ArrayList<>();

        String systemPrompt;

        if(!context.equals("Aucune information trouvée dans le PDF")) {
            if ("qcm".equalsIgnoreCase(type)) {
                systemPrompt = String.format("""
                        Tu es un assistant qui génère des QCM. Génère exactement %d questions à choix multiples à partir du texte donné.
                        Chaque question doit avoir 3 choix (a, b, c) avec une seule bonne réponse.
                        Si tu ne trouves pas la partie dans le contexte, dis simplement 'Aucune information trouvée dans le PDF' 
                        Retourne le résultat dans ce format :
                        
                        Q1) ...
                        a. ...
                        b. ...
                        c. ...
                        correcte réponse: A
                        
                        etc.
                        
                        Ne génère rien d’autre que les questions dans ce format.
                        """, number);
            } else if ("ouvertes".equalsIgnoreCase(type)) {
                systemPrompt = String.format("""
                        Tu es un assistant qui génère des questions ouvertes. Génère exactement %d questions ouvertes pertinentes basées sur le texte fourni.
                        Pour chaque question, donne aussi une réponse complète et correcte.
                        Si le texte ne contient pas assez d'information, répond simplement : "Aucune information trouvée dans le PDF"
                        Utilise ce format :
                        
                        Q1) ...
                        Réponse: ...
                        
                        Q2) ...
                        Réponse: ...
                        
                        etc.
                        
                        Ne génère rien d’autre que les questions et réponses dans ce format.
                        """, number);
            } else {
                return "Type de génération non reconnu.";
            }
        }else{ return "Type de génération non reconnu.";}


        messages.add(Map.of("role", "system", "content", systemPrompt));

        String userMessage;
        if (!allPdf) {
            userMessage = "Contexte:\n" + context + "\n\nPartie: " + partie;
        } else {
            userMessage = "Contexte:\n" + context + "\n\nGénère les questions sur l’ensemble du document.";
        }

        messages.add(Map.of("role", "user", "content", userMessage));
        groqBody.put("messages", messages);

        System.out.println("Contexte envoyé au modèle:\n" + groqBody);

        HttpHeaders groqHeaders = new HttpHeaders();
        groqHeaders.setContentType(MediaType.APPLICATION_JSON);
        groqHeaders.setBearerAuth(API_KEY);

        HttpEntity<Map<String, Object>> groqRequest = new HttpEntity<>(groqBody, groqHeaders);
        ResponseEntity<Map> groqResponse = restTemplate.postForEntity(GROQ_API_URL, groqRequest, Map.class);

        try {
            Map<String, Object> message = (Map<String, Object>)
                    ((List<Map<String, Object>>) groqResponse.getBody().get("choices"))
                            .get(0).get("message");
            return message.get("content").toString();
        } catch (Exception e) {
            return "Erreur dans la réponse du modèle.";
        }
    }


}
