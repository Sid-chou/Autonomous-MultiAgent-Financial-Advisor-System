package com.financial.riskagent.service;

import com.financial.riskagent.model.Alert;
import com.financial.riskagent.model.Alert.AlertSeverity;
import com.financial.riskagent.model.Alert.AlertType;
import com.financial.riskagent.model.Holding;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Alert & Notification Agent
 * Autonomous agent that monitors portfolio and generates alerts
 * Provides AI-powered alert explanations
 */
@Service
public class AlertService {

        @Autowired
        private AIRouterService aiRouter;

        // In-memory alert storage (replace with database in production)
        private final List<Alert> alerts = new ArrayList<>();
        private final AtomicLong alertIdCounter = new AtomicLong(1);

        /**
         * Check portfolio for alerts
         */
        public List<Alert> checkPortfolioAlerts(List<Holding> holdings, double currentRiskScore) {
                List<Alert> newAlerts = new ArrayList<>();

                // Check price movements
                newAlerts.addAll(checkPriceMovements(holdings));

                // Check risk threshold
                newAlerts.addAll(checkRiskThreshold(currentRiskScore));

                // Check diversification
                newAlerts.addAll(checkDiversification(holdings));

                // Store and return new alerts
                alerts.addAll(newAlerts);
                return newAlerts;
        }

        /**
         * Check for significant price movements
         */
        private List<Alert> checkPriceMovements(List<Holding> holdings) {
                List<Alert> priceAlerts = new ArrayList<>();

                for (Holding holding : holdings) {
                        double priceChange = ((holding.getCurrentPrice() - holding.getPurchasePrice())
                                        / holding.getPurchasePrice()) * 100;

                        if (Math.abs(priceChange) > 5) { // Alert if > ±5% from purchase price
                                AlertSeverity severity = Math.abs(priceChange) > 15
                                                ? AlertSeverity.CRITICAL
                                                : AlertSeverity.WARNING;

                                String message = String.format(
                                                "%s moved %+.2f%% from your purchase price (₹%.2f → ₹%.2f)",
                                                holding.getSymbol(),
                                                priceChange,
                                                holding.getPurchasePrice(),
                                                holding.getCurrentPrice());

                                // Generate AI explanation
                                String aiPrompt = String.format(
                                                "Stock %s changed %+.2f%% from purchase price. " +
                                                                "Investor holds %d shares bought at ₹%.2f, now worth ₹%.2f. "
                                                                +
                                                                "In 1-2 sentences, explain what this means and suggest action if needed. "
                                                                +
                                                                "Consider Indian market context.",
                                                holding.getSymbol(),
                                                priceChange,
                                                holding.getQuantity(),
                                                holding.getPurchasePrice(),
                                                holding.getCurrentPrice());

                                String aiExplanation = aiRouter.generateInsight(
                                                aiPrompt,
                                                AIRouterService.InsightComplexity.LOW);

                                priceAlerts.add(Alert.builder()
                                                .id(alertIdCounter.getAndIncrement())
                                                .type(AlertType.PRICE_MOVEMENT)
                                                .severity(severity)
                                                .message(message)
                                                .aiExplanation(aiExplanation)
                                                .symbol(holding.getSymbol())
                                                .value(priceChange)
                                                .read(false)
                                                .timestamp(LocalDateTime.now())
                                                .build());
                        }
                }

                return priceAlerts;
        }

        /**
         * Check if portfolio risk exceeds threshold
         */
        private List<Alert> checkRiskThreshold(double riskScore) {
                List<Alert> riskAlerts = new ArrayList<>();

                if (riskScore > 70) { // High risk threshold
                        String message = String.format(
                                        "Portfolio risk score is HIGH (%.1f/100) - Consider rebalancing",
                                        riskScore);

                        String aiPrompt = String.format(
                                        "Portfolio risk score reached %.1f out of 100. " +
                                                        "This is considered high risk. " +
                                                        "In 1-2 sentences, explain the implications and suggest immediate action for Indian investor.",
                                        riskScore);

                        String aiExplanation = aiRouter.generateInsight(
                                        aiPrompt,
                                        AIRouterService.InsightComplexity.MEDIUM);

                        riskAlerts.add(Alert.builder()
                                        .id(alertIdCounter.getAndIncrement())
                                        .type(AlertType.RISK_THRESHOLD)
                                        .severity(AlertSeverity.CRITICAL)
                                        .message(message)
                                        .aiExplanation(aiExplanation)
                                        .value(riskScore)
                                        .read(false)
                                        .timestamp(LocalDateTime.now())
                                        .build());
                } else if (riskScore > 50) { // Medium-high risk
                        riskAlerts.add(Alert.builder()
                                        .id(alertIdCounter.getAndIncrement())
                                        .type(AlertType.RISK_THRESHOLD)
                                        .severity(AlertSeverity.WARNING)
                                        .message(String.format("Portfolio risk elevated (%.1f/100) - Monitor closely",
                                                        riskScore))
                                        .aiExplanation(
                                                        "Your portfolio has medium-high risk. While not critical, consider reviewing your holdings for better risk-adjusted returns.")
                                        .value(riskScore)
                                        .read(false)
                                        .timestamp(LocalDateTime.now())
                                        .build());
                }

                return riskAlerts;
        }

        /**
         * Check portfolio diversification
         */
        private List<Alert> checkDiversification(List<Holding> holdings) {
                List<Alert> diversificationAlerts = new ArrayList<>();

                if (holdings.size() < 3) { // Too few holdings
                        String message = String.format(
                                        "Low diversification: Only %d holding(s) in portfolio",
                                        holdings.size());

                        diversificationAlerts.add(Alert.builder()
                                        .id(alertIdCounter.getAndIncrement())
                                        .type(AlertType.DIVERSIFICATION)
                                        .severity(AlertSeverity.WARNING)
                                        .message(message)
                                        .aiExplanation(
                                                        "A well-diversified portfolio typically holds 8-12 stocks across different sectors. "
                                                                        +
                                                                        "Consider adding more holdings to reduce concentration risk.")
                                        .value(Double.valueOf(holdings.size()))
                                        .read(false)
                                        .timestamp(LocalDateTime.now())
                                        .build());
                }

                return diversificationAlerts;
        }

        /**
         * Get all alerts
         */
        public List<Alert> getAllAlerts() {
                return new ArrayList<>(alerts);
        }

        /**
         * Get unread alerts
         */
        public List<Alert> getUnreadAlerts() {
                return alerts.stream()
                                .filter(alert -> !alert.isRead())
                                .collect(Collectors.toList());
        }

        /**
         * Mark alert as read
         */
        public void markAsRead(Long alertId) {
                alerts.stream()
                                .filter(alert -> alert.getId().equals(alertId))
                                .forEach(alert -> alert.setRead(true));
        }

        /**
         * Clear all alerts
         */
        public void clearAllAlerts() {
                alerts.clear();
        }

        /**
         * Get alert count
         */
        public int getAlertCount() {
                return alerts.size();
        }

        /**
         * Get unread alert count
         */
        public int getUnreadCount() {
                return (int) alerts.stream()
                                .filter(alert -> !alert.isRead())
                                .count();
        }
}
