package com.financial.riskagent.controller;

import com.financial.riskagent.model.ComprehensiveAnalysisResponse;
import com.financial.riskagent.model.PortfolioRequest;
import com.financial.riskagent.service.AgentOrchestratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Agent Orchestrator
 * Provides comprehensive multi-agent analysis
 */
@RestController
@RequestMapping("/api/orchestrator")
@CrossOrigin(origins = "http://localhost:3000")
public class OrchestratorController {

    @Autowired
    private AgentOrchestratorService orchestrator;

    /**
     * Run comprehensive analysis with all agents
     */
    @PostMapping("/analyze/comprehensive")
    public ResponseEntity<ComprehensiveAnalysisResponse> analyzeComprehensive(@RequestBody PortfolioRequest request) {
        try {
            ComprehensiveAnalysisResponse response = orchestrator.analyzeComprehensive(request);
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Comprehensive analysis error: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get quick portfolio snapshot
     */
    @PostMapping("/snapshot")
    public ResponseEntity<String> getSnapshot(@RequestBody PortfolioRequest request) {
        try {
            String snapshot = orchestrator.getPortfolioSnapshot(request);
            return ResponseEntity.ok(snapshot);
        } catch (Exception e) {
            return ResponseEntity.internalServerError().build();
        }
    }
}
