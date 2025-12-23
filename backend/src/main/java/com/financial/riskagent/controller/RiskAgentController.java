package com.financial.riskagent.controller;

import com.financial.riskagent.model.PortfolioRequest;
import com.financial.riskagent.model.RiskAnalysisResponse;
import com.financial.riskagent.service.RiskAgentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.Map;

@RestController
@RequestMapping("/api/risk")
@CrossOrigin(origins = "http://localhost:3000")
public class RiskAgentController {

    @Autowired
    private RiskAgentService riskAgentService;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, String>> health() {
        Map<String, String> response = new HashMap<>();
        response.put("status", "UP");
        response.put("agent", "Risk Assessment Agent");
        response.put("version", "1.0.0");
        return ResponseEntity.ok(response);
    }

    /**
     * Main endpoint: Analyze portfolio risk
     */
    @PostMapping("/analyze")
    public ResponseEntity<RiskAnalysisResponse> analyzeRisk(@RequestBody PortfolioRequest request) {
        System.out.println("\n📥 Received risk analysis request");
        System.out.println("   Holdings: " + request.getHoldings().size());
        System.out.println("   Risk Tolerance: " + request.getRiskTolerance());

        try {
            RiskAnalysisResponse response = riskAgentService.analyzeRisk(request);
            System.out.println("📤 Sending analysis response\n");
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("❌ Error during analysis: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }
}
