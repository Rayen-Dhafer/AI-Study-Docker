package com.example.ai_assistant.service;


import com.example.ai_assistant.util.GroqEmbeddingUtil;
import com.example.ai_assistant.util.JwtUtil;
import com.example.ai_assistant.util.TextChunkUtil;
import org.apache.pdfbox.pdmodel.PDDocument;
import org.apache.pdfbox.text.PDFTextStripper;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.InputStream;
import java.util.List;

@Service
public class DocumentService {

    public String extractTextFromPdf(MultipartFile file) throws Exception {
        try (InputStream inputStream = file.getInputStream();
             PDDocument document = PDDocument.load(inputStream)) {

            PDFTextStripper pdfStripper = new PDFTextStripper();
            return pdfStripper.getText(document);
        }
    }

    @Autowired
    private JwtUtil jwtUtil;
    public String processPdfFileForEmbeddings(MultipartFile file, String token) throws Exception {
        String text = extractTextFromPdf(file);
        String title = file.getOriginalFilename();
        System.out.println(title);

        if (!jwtUtil.validateToken(token)) {
            return null;
        }

        String email = jwtUtil.extractUseremail(token);

        List<String> chunks = TextChunkUtil.chunkText(text, 1000);

        for (String chunk : chunks) {
            float[] embedding = GroqEmbeddingUtil.getEmbedding(chunk);
            ChromaService.saveEmbedding(email, title, chunk, embedding);

            System.out.println(" \n Embedding for chunk length " + chunk.length() + " is size: " + embedding.length);
            System.out.println();System.out.println();System.out.println();System.out.println();
        }
        return "Embeddings saved successfully";
    }


    public List<String> getTitlesByEmail(String token) {
        if (!jwtUtil.validateToken(token)) {
            return null;
        }
        String email = jwtUtil.extractUseremail(token);
        return ChromaService.getTitles(email);
    }

    public String deletePdf(String token, String title) {
        if (!jwtUtil.validateToken(token)) {
            return null;
        }
        String email = jwtUtil.extractUseremail(token);
        try {
            ChromaService.deleteByTitleAndEmail(email, title);
            return "PDF and embeddings deleted successfully";
        } catch (Exception e) {
            return "Failed to delete PDF: " + e.getMessage();
        }
    }


}
