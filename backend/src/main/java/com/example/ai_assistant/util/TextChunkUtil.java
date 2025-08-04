package com.example.ai_assistant.util;

import java.util.ArrayList;
import java.util.List;

public class TextChunkUtil {

 
    public static List<String> chunkText(String text, int maxChunkSize) {
        List<String> chunks = new ArrayList<>();
        int length = text.length();
        int start = 0;

        while (start < length) {
            int end = Math.min(length, start + maxChunkSize);
 
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
