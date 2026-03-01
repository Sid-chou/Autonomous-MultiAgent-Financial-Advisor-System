package com.financial.riskagent.controller;

import com.financial.riskagent.model.CombinedAnalysisRequest;
import com.financial.riskagent.model.CombinedAnalysisResponse;
import com.financial.riskagent.service.AnalysisOrchestrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class AnalysisController {

    @Autowired
    private AnalysisOrchestrationService orchestrationService;

    /**
     * Combined analysis — calls Sentiment + Technical agents in parallel
     * POST /api/v1/analyze
     * Body: { "ticker": "INFY.NS" }
     */
    @PostMapping("/analyze")
    public ResponseEntity<CombinedAnalysisResponse> analyze(
            @RequestBody CombinedAnalysisRequest request) {

        if (request.getTicker() == null || request.getTicker().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        CombinedAnalysisResponse response = orchestrationService.analyze(request.getTicker());

        return ResponseEntity.ok(response);
    }
}
