package com.financial.riskagent.service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Google Gemini API Service (Backup AI)
 * Used when Groq is unavailable or rate limited
 */
@Service
public class GeminiService {

    @Value("${gemini.api.key}")
    private String apiKey;

    @Value("${gemini.api.url}")
    private String apiUrl;

    private final OkHttpClient client;
    private final Gson gson;

    public GeminiService() {
        this.client = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        this.gson = new Gson();
    }

    public String generateInsight(String prompt) {
        // #region agent log
        try {
            boolean placeholder = apiKey != null && apiKey.equals("YOUR_GEMINI_API_KEY_HERE");
            String d = "{\"apiKeyNull\":" + (apiKey == null) + ",\"apiKeyPlaceholder\":" + placeholder + ",\"apiKeyLength\":" + (apiKey == null ? 0 : apiKey.length()) + "}";
            String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H1\",\"hypothesisId2\":\"H2\",\"location\":\"GeminiService.java:generateInsight\",\"message\":\"Gemini generateInsight entry\",\"data\":" + d + ",\"timestamp\":" + System.currentTimeMillis() + "}\n";
            Files.write(Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log"), line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception _e) {}
        // #endregion
        // Skip if API key not configured
        if (apiKey == null || apiKey.equals("YOUR_GEMINI_API_KEY_HERE")) {
            // #region agent log
            try {
                String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H2\",\"location\":\"GeminiService.java:notConfigured\",\"message\":\"Gemini API key not configured branch\",\"timestamp\":" + System.currentTimeMillis() + "}\n";
                Files.write(Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log"), line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            } catch (Exception _e) {}
            // #endregion
            throw new RuntimeException("Gemini API key not configured");
        }

        try {
            // Prepare request
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("contents", List.of(
                    Map.of("parts", List.of(
                            Map.of("text", prompt)))));

            String jsonBody = gson.toJson(requestBody);

            Request request = new Request.Builder()
                    .url(apiUrl + "?key=" + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(RequestBody.create(jsonBody, MediaType.parse("application/json")))
                    .build();

            try (Response response = client.newCall(request).execute()) {
                // #region agent log
                if (!response.isSuccessful()) {
                    try {
                        String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H3\",\"location\":\"GeminiService.java:response\",\"message\":\"Gemini API error\",\"data\":{\"code\":" + response.code() + "},\"timestamp\":" + System.currentTimeMillis() + "}\n";
                        Files.write(Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log"), line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                    } catch (Exception _e) {}
                }
                // #endregion
                if (!response.isSuccessful()) {
                    throw new RuntimeException("Gemini API Error: " + response.code());
                }

                String responseBody = response.body().string();
                return extractContent(responseBody);
            }

        } catch (Exception e) {
            System.err.println("Gemini API Error: " + e.getMessage());
            throw new RuntimeException("Failed to generate AI insight from Gemini", e);
        }
    }

    private String extractContent(String responseBody) {
        try {
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);
            return jsonResponse
                    .getAsJsonArray("candidates")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("content")
                    .getAsJsonArray("parts")
                    .get(0).getAsJsonObject()
                    .get("text").getAsString();
        } catch (Exception e) {
            return "Unable to parse AI response.";
        }
    }
}
