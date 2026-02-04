package com.financial.riskagent.controller;

import com.financial.riskagent.model.SentimentResponse;
import com.financial.riskagent.service.SentimentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/sentiment")
@CrossOrigin(origins = "*")
public class SentimentController {

    @Autowired
    private SentimentService sentimentService;

    /**
     * Analyze sentiment for a ticker
     * GET /api/sentiment/analyze/{ticker}
     */
    @GetMapping("/analyze/{ticker}")
    public ResponseEntity<SentimentResponse> analyzeSentiment(@PathVariable String ticker) {
        SentimentResponse response = sentimentService.analyzeSentiment(ticker);
        return ResponseEntity.ok(response);
    }

    /**
     * Health check for sentiment service
     * GET /api/sentiment/health
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> checkHealth() {
        boolean isHealthy = sentimentService.isServiceHealthy();

        Map<String, Object> response = new HashMap<>();
        response.put("sentimentServiceHealthy", isHealthy);
        response.put("status", isHealthy ? "UP" : "DOWN");

        return ResponseEntity.ok(response);
    }
}
