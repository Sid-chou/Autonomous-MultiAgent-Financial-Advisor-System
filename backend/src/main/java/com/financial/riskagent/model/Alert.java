package com.financial.riskagent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

/**
 * Alert model for Alert Agent
 * Represents portfolio alerts and notifications
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Alert {

    private Long id;

    // Alert type
    private AlertType type;

    // Severity level
    private AlertSeverity severity;

    // Alert message
    private String message;

    // AI-generated explanation
    private String aiExplanation;

    // Related stock symbol (if applicable)
    private String symbol;

    // Alert value/metric
    private Double value;

    // Read status
    private boolean read;

    // Timestamp
    private LocalDateTime timestamp;

    public enum AlertType {
        PRICE_MOVEMENT, // Stock price changed significantly
        RISK_THRESHOLD, // Portfolio risk exceeded limit
        REBALANCE_NEEDED, // Portfolio needs rebalancing
        MARKET_EVENT, // Significant market event
        DIVERSIFICATION // Diversification warning
    }

    public enum AlertSeverity {
        INFO, // Informational
        WARNING, // Needs attention
        CRITICAL // Urgent action needed
    }
}
