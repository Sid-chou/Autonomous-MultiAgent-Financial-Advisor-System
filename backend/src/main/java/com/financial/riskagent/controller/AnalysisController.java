package com.financial.riskagent.controller;

import com.financial.riskagent.model.CombinedAnalysisRequest;
import com.financial.riskagent.model.CombinedAnalysisResponse;
import com.financial.riskagent.model.UserProfile;
import com.financial.riskagent.service.AnalysisOrchestrationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;

@RestController
@RequestMapping("/api/v1")
@CrossOrigin(origins = "*")
public class AnalysisController {

    @Autowired
    private AnalysisOrchestrationService orchestrationService;

    /**
     * Combined analysis — calls all five agents
     * POST /api/v1/analyze
     * Body: { "ticker": "INFY.NS", "userProfile": { ... } }
     */
    @PostMapping("/analyze")
    public ResponseEntity<CombinedAnalysisResponse> analyze(
            @RequestBody CombinedAnalysisRequest request) {

        if (request.getTicker() == null || request.getTicker().isEmpty()) {
            return ResponseEntity.badRequest().build();
        }

        // Use default profile if none provided
        UserProfile userProfile = request.getUserProfile();
        if (userProfile == null) {
            userProfile = getDefaultUserProfile();
        }

        CombinedAnalysisResponse response = orchestrationService.analyze(
                request.getTicker(), userProfile);

        return ResponseEntity.ok(response);
    }

    private UserProfile getDefaultUserProfile() {
        UserProfile profile = new UserProfile();
        profile.setTotalBudget(100000);
        profile.setCashAvailable(100000);
        profile.setMaxTradeSize(0.10);
        profile.setDailyLossLimit(0.05);
        profile.setMaxExposurePerStock(0.15);
        profile.setRiskLevel("moderate");
        profile.setCurrentDailyLoss(0.0);
        profile.setCurrentExposure(new HashMap<>());
        return profile;
    }
}
