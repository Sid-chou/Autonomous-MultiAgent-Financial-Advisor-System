package com.financial.riskagent.controller;

import com.financial.riskagent.model.MarketAnalysisResponse;
import com.financial.riskagent.service.MarketAnalysisService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;

/**
 * REST Controller for Market Analysis Agent
 */
@RestController
@RequestMapping("/api/market")
@CrossOrigin(origins = "http://localhost:3000")
public class MarketAnalysisController {

    @Autowired
    private MarketAnalysisService marketService;

    /**
     * Get current market analysis
     */
    @GetMapping("/current")
    public ResponseEntity<MarketAnalysisResponse> getCurrentMarketAnalysis() {
        // #region agent log
        try {
            java.nio.file.Path logPath = Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log");
            Files.createDirectories(logPath.getParent());
            String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H0\",\"location\":\"MarketAnalysisController.java:getCurrent\",\"message\":\"Market API hit\",\"timestamp\":" + System.currentTimeMillis() + "}\n";
            Files.write(logPath, line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
        } catch (Exception e) { System.err.println("Debug log write failed: " + e.getMessage()); }
        // #endregion
        try {
            MarketAnalysisResponse response = marketService.analyzeMarket();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Market analysis error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Force refresh market data
     */
    @PostMapping("/refresh")
    public ResponseEntity<MarketAnalysisResponse> refreshMarketData() {
        try {
            MarketAnalysisResponse response = marketService.refresh();
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Market refresh error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
