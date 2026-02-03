package com.financial.riskagent.service;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import okhttp3.*;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.io.IOException;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.util.HashMap;
import java.util.List;
import java.util.Map;
import java.util.concurrent.TimeUnit;

/**
 * Groq API Service for ultra-fast AI responses
 * Uses Llama 3.1 models for financial analysis
 */
@Service
public class GroqService {

    @Value("${groq.api.key}")
    private String apiKey;

    @Value("${groq.api.url}")
    private String apiUrl;

    @Value("${groq.model.complex}")
    private String complexModel;

    @Value("${groq.model.simple}")
    private String simpleModel;

    private final OkHttpClient client;
    private final Gson gson;

    public GroqService() {
        this.client = new OkHttpClient.Builder()
                .connectTimeout(10, TimeUnit.SECONDS)
                .readTimeout(30, TimeUnit.SECONDS)
                .build();
        this.gson = new Gson();
    }

    /**
     * Generate AI response for complex analysis (uses Llama 3.1 70B)
     */
    public String generateComplexInsight(String prompt) {
        return generate(prompt, complexModel, 200);
    }

    /**
     * Generate AI response for simple tasks (uses Gemma 2 9B)
     */
    public String generateSimpleInsight(String prompt) {
        return generate(prompt, simpleModel, 100);
    }

    /**
     * Generate AI response with custom model and max tokens
     */
    public String generate(String prompt, String model, int maxTokens) {
        // #region agent log
        try {
            String d = "{\"apiKeyNull\":" + (apiKey == null) + ",\"apiKeyEmpty\":" + (apiKey != null && apiKey.isEmpty()) + ",\"apiKeyLength\":" + (apiKey == null ? 0 : apiKey.length()) + ",\"apiKeyPrefix\":" + (apiKey == null || apiKey.length() < 4 ? "\"null\"" : "\"" + apiKey.substring(0, 4) + "\"") + "}";
            String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H1\",\"hypothesisId2\":\"H2\",\"location\":\"GroqService.java:generate\",\"message\":\"Groq generate entry\",\"data\":" + d + ",\"timestamp\":" + System.currentTimeMillis() + "}\n";
            Files.write(Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log"), line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception _e) {}
        // #endregion
        try {
            // Prepare request payload
            Map<String, Object> requestBody = new HashMap<>();
            requestBody.put("model", model);
            requestBody.put("messages", List.of(
                    Map.of("role", "user", "content", prompt)));
            requestBody.put("temperature", 0.7);
            requestBody.put("max_tokens", maxTokens);

            String jsonBody = gson.toJson(requestBody);

            // Build HTTP request
            RequestBody body = RequestBody.create(
                    jsonBody,
                    MediaType.parse("application/json"));

            Request request = new Request.Builder()
                    .url(apiUrl)
                    .addHeader("Authorization", "Bearer " + apiKey)
                    .addHeader("Content-Type", "application/json")
                    .post(body)
                    .build();

            // Execute request
            try (Response response = client.newCall(request).execute()) {
                // #region agent log
                if (!response.isSuccessful()) {
                    try {
                        String errBody = response.body() != null ? response.body().string() : "";
                        String preview = (errBody.length() > 200 ? errBody.substring(0, 200) : errBody).replace("\\", "\\\\").replace("\"", "'").replace("\n", " ");
                        String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H3\",\"location\":\"GroqService.java:response\",\"message\":\"Groq API error\",\"data\":{\"code\":" + response.code() + ",\"message\":\"" + response.message().replace("\"", "'") + "\",\"bodyPreview\":\"" + preview + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n";
                        Files.write(Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log"), line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                    } catch (Exception _e) {}
                }
                // #endregion
                if (!response.isSuccessful()) {
                    throw new IOException("Groq API Error: " + response.code() + " - " + response.message());
                }

                String responseBody = response.body().string();
                return extractContent(responseBody);
            }

        } catch (Exception e) {
            System.err.println("Groq API Error: " + e.getMessage());
            throw new RuntimeException("Failed to generate AI insight from Groq", e);
        }
    }

    /**
     * Extract content from Groq API response
     */
    private String extractContent(String responseBody) {
        try {
            JsonObject jsonResponse = gson.fromJson(responseBody, JsonObject.class);
            return jsonResponse
                    .getAsJsonArray("choices")
                    .get(0).getAsJsonObject()
                    .getAsJsonObject("message")
                    .get("content").getAsString();
        } catch (Exception e) {
            System.err.println("Failed to parse Groq response: " + e.getMessage());
            return "Unable to generate AI insight at this time.";
        }
    }

    /**
     * Generate financial analysis prompt for Indian market
     */
    public String generateIndianMarketPrompt(String basePrompt) {
        return basePrompt + " Consider Indian market context (NSE/BSE), " +
                "use ₹ for currency, and provide India-specific financial advice.";
    }
}
