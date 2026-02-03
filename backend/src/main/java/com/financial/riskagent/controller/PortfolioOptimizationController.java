package com.financial.riskagent.controller;

import com.financial.riskagent.model.OptimizationResponse;
import com.financial.riskagent.model.PortfolioRequest;
import com.financial.riskagent.service.PortfolioOptimizationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

/**
 * REST Controller for Portfolio Optimization Agent
 */
@RestController
@RequestMapping("/api/optimization")
@CrossOrigin(origins = "http://localhost:3000")
public class PortfolioOptimizationController {

    @Autowired
    private PortfolioOptimizationService optimizationService;

    /**
     * Analyze portfolio and generate rebalancing recommendations
     */
    @PostMapping("/analyze")
    public ResponseEntity<OptimizationResponse> analyzePortfolio(@RequestBody PortfolioRequest request) {
        try {
            OptimizationResponse response = optimizationService.optimizePortfolio(
                    request.getHoldings(),
                    request.getRiskTolerance());
            return ResponseEntity.ok(response);
        } catch (Exception e) {
            System.err.println("Optimization error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }
}
