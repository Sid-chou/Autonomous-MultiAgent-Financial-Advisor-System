package com.financial.riskagent.service;

import com.google.common.cache.Cache;
import com.google.common.cache.CacheBuilder;
import com.google.common.util.concurrent.RateLimiter;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.security.MessageDigest;
import java.util.concurrent.TimeUnit;

/**
 * Intelligent AI Router Service
 * Routes requests to optimal AI provider (Groq primary, Gemini backup)
 * Includes caching and rate limiting for optimization
 */
@Service
public class AIRouterService {

    @Autowired
    private GroqService groqService;

    @Autowired(required = false)
    private GeminiService geminiService;

    @Value("${cache.ai.enabled:true}")
    private boolean cacheEnabled;

    @Value("${cache.ai.ttl:3600}")
    private int cacheTtlSeconds;

    // Rate limiter: 25 requests per minute (buffer for 30/min limit)
    private final RateLimiter groqRateLimiter = RateLimiter.create(25.0 / 60.0);

    // Response cache to reduce API calls
    private final Cache<String, String> responseCache;

    public AIRouterService() {
        this.responseCache = CacheBuilder.newBuilder()
                .maximumSize(1000)
                .expireAfterWrite(1, TimeUnit.HOURS)
                .build();
    }

    public enum InsightComplexity {
        HIGH, // Complex financial analysis - use Llama 3.1 70B
        MEDIUM, // General advice - use Llama 3.1 70B
        LOW // Simple alerts - use Gemma 2 9B
    }

    /**
     * Generate AI insight with optimal routing
     */
    public String generateInsight(String prompt, InsightComplexity complexity) {
        // Check cache first
        if (cacheEnabled) {
            String cacheKey = generateCacheKey(prompt, complexity);
            String cached = responseCache.getIfPresent(cacheKey);
            if (cached != null) {
                return cached;
            }
        }

        // Try Groq first (primary AI)
        try {
            if (groqRateLimiter.tryAcquire(2, TimeUnit.SECONDS)) {
                String response = callGroq(prompt, complexity);

                // Cache the response
                if (cacheEnabled) {
                    String cacheKey = generateCacheKey(prompt, complexity);
                    responseCache.put(cacheKey, response);
                }

                return response;
            }
        } catch (Exception e) {
            // #region agent log
            try {
                String msg = e.getMessage() != null ? e.getMessage().replace("\"", "'") : "null";
                String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H3\",\"location\":\"AIRouterService.java:groqFailed\",\"message\":\"Groq failed, falling back to Gemini\",\"data\":{\"error\":\"" + msg + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n";
                Files.write(Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log"), line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            } catch (Exception _e) {}
            // #endregion
            System.err.println("Groq failed, falling back to Gemini: " + e.getMessage());
        }

        // Fallback to Gemini if Groq fails or rate limited
        if (geminiService != null) {
            try {
                String response = geminiService.generateInsight(prompt);

                // Cache the response
                if (cacheEnabled) {
                    String cacheKey = generateCacheKey(prompt, complexity);
                    responseCache.put(cacheKey, response);
                }

                return response;
            } catch (Exception e) {
                // #region agent log
                try {
                    String msg = e.getMessage() != null ? e.getMessage().replace("\"", "'") : "null";
                    String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H3\",\"location\":\"AIRouterService.java:geminiFailed\",\"message\":\"Both AI services failed\",\"data\":{\"error\":\"" + msg + "\"},\"timestamp\":" + System.currentTimeMillis() + "}\n";
                    Files.write(Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log"), line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
                } catch (Exception _e) {}
                // #endregion
                System.err.println("Both AI services failed: " + e.getMessage());
            }
        }

        // Last resort: return generic message
        return "AI insight temporarily unavailable. Portfolio analysis completed successfully.";
    }

    /**
     * Call Groq with appropriate model based on complexity
     */
    private String callGroq(String prompt, InsightComplexity complexity) {
        // Add Indian market context to prompt
        String enhancedPrompt = groqService.generateIndianMarketPrompt(prompt);

        switch (complexity) {
            case HIGH:
            case MEDIUM:
                return groqService.generateComplexInsight(enhancedPrompt);
            case LOW:
                return groqService.generateSimpleInsight(enhancedPrompt);
            default:
                return groqService.generateComplexInsight(enhancedPrompt);
        }
    }

    /**
     * Generate cache key from prompt and complexity
     */
    private String generateCacheKey(String prompt, InsightComplexity complexity) {
        try {
            String input = prompt + complexity.name();
            MessageDigest md = MessageDigest.getInstance("MD5");
            byte[] hash = md.digest(input.getBytes());
            StringBuilder sb = new StringBuilder();
            for (byte b : hash) {
                sb.append(String.format("%02x", b));
            }
            return sb.toString();
        } catch (Exception e) {
            return String.valueOf(prompt.hashCode());
        }
    }

    /**
     * Clear cache (useful for testing)
     */
    public void clearCache() {
        responseCache.invalidateAll();
    }

    /**
     * Get cache statistics
     */
    public String getCacheStats() {
        return String.format("Cache size: %d, Hit rate: %.2f%%",
                responseCache.size(),
                responseCache.stats().hitRate() * 100);
    }
}
