package com.financial.riskagent.controller;

import com.financial.riskagent.model.Alert;
import com.financial.riskagent.model.PortfolioRequest;
import com.financial.riskagent.service.AlertService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

/**
 * REST Controller for Alert Agent
 */
@RestController
@RequestMapping("/api/alerts")
@CrossOrigin(origins = "http://localhost:3000")
public class AlertController {

    @Autowired
    private AlertService alertService;

    /**
     * Get all alerts
     */
    @GetMapping
    public ResponseEntity<List<Alert>> getAllAlerts() {
        return ResponseEntity.ok(alertService.getAllAlerts());
    }

    /**
     * Get unread alerts
     */
    @GetMapping("/unread")
    public ResponseEntity<List<Alert>> getUnreadAlerts() {
        return ResponseEntity.ok(alertService.getUnreadAlerts());
    }

    /**
     * Get alert count
     */
    @GetMapping("/count")
    public ResponseEntity<Map<String, Integer>> getAlertCount() {
        return ResponseEntity.ok(Map.of(
                "total", alertService.getAlertCount(),
                "unread", alertService.getUnreadCount()));
    }

    /**
     * Check portfolio for new alerts
     */
    @PostMapping("/check")
    public ResponseEntity<List<Alert>> checkAlerts(@RequestBody PortfolioRequest request) {
        try {
            // For demo, use a default risk score of 50
            List<Alert> alerts = alertService.checkPortfolioAlerts(request.getHoldings(), 50.0);
            return ResponseEntity.ok(alerts);
        } catch (Exception e) {
            System.err.println("Alert check error: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Mark alert as read
     */
    @PutMapping("/{id}/read")
    public ResponseEntity<Void> markAsRead(@PathVariable Long id) {
        alertService.markAsRead(id);
        return ResponseEntity.ok().build();
    }

    /**
     * Clear all alerts
     */
    @DeleteMapping
    public ResponseEntity<Void> clearAlerts() {
        alertService.clearAllAlerts();
        return ResponseEntity.ok().build();
    }
}
