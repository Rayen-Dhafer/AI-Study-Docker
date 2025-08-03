package com.example.ai_assistant.util;

import java.util.ArrayList;
import java.util.List;

public class TextChunkUtil {

    /**
     * Split large text into chunks of max size (e.g., 1000 characters).
     * This is important because embedding APIs often have max token limits.
     */
    public static List<String> chunkText(String text, int maxChunkSize) {
        List<String> chunks = new ArrayList<>();
        int length = text.length();
        int start = 0;

        while (start < length) {
            int end = Math.min(length, start + maxChunkSize);
            // Optional: try to split at last whitespace before maxChunkSize for better chunks
            if (end < length) {
                int lastSpace = text.lastIndexOf(' ', end);
                if (lastSpace > start) {
                    end = lastSpace;
                }
            }
            chunks.add(text.substring(start, end).trim());
            start = end;
        }
        return chunks;
    }
}
