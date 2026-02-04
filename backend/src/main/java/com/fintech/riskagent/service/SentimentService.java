package com.fintech.riskagent.service;

import com.fintech.riskagent.model.SentimentResponse;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class SentimentService {

    @Value("${sentiment.service.url:http://localhost:5000}")
    private String sentimentServiceUrl;

    private final RestTemplate restTemplate;

    public SentimentService() {
        this.restTemplate = new RestTemplate();
    }

    /**
     * Analyze sentiment for a given ticker
     */
    public SentimentResponse analyzeSentiment(String ticker) {
        try {
            String url = sentimentServiceUrl + "/api/v1/analyze-sentiment";

            // Create request body
            Map<String, String> requestBody = new HashMap<>();
            requestBody.put("ticker", ticker.toUpperCase());

            // Set headers
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            HttpEntity<Map<String, String>> entity = new HttpEntity<>(requestBody, headers);

            // Make POST request
            ResponseEntity<SentimentResponse> response = restTemplate.exchange(
                    url,
                    HttpMethod.POST,
                    entity,
                    SentimentResponse.class);

            return response.getBody();

        } catch (Exception e) {
            System.err.println("Error calling sentiment service: " + e.getMessage());

            // Return fallback response
            return createFallbackResponse(ticker, e.getMessage());
        }
    }

    /**
     * Check if sentiment service is healthy
     */
    public boolean isServiceHealthy() {
        try {
            String url = sentimentServiceUrl + "/health";
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(url,
                    (Class<Map<String, Object>>) (Class<?>) Map.class);
            return response.getStatusCode() == HttpStatus.OK;
        } catch (Exception e) {
            return false;
        }
    }

    /**
     * Create fallback response when service is unavailable
     */
    private SentimentResponse createFallbackResponse(String ticker, String errorMessage) {
        SentimentResponse fallback = new SentimentResponse();
        fallback.setTicker(ticker);
        fallback.setOverallSentiment("NEUTRAL");
        fallback.setPositiveScore(0.33);
        fallback.setNegativeScore(0.33);
        fallback.setNeutralScore(0.34);
        fallback.setConfidenceScore(0.0);
        fallback.setNewsCount(0);
        fallback.setSocialCount(0);
        fallback.setMessage("Sentiment service unavailable: " + errorMessage);
        return fallback;
    }
}
