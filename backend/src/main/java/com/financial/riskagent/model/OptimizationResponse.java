package com.financial.riskagent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response from Portfolio Optimization Agent
 * Contains allocation analysis and rebalancing recommendations for Indian
 * market
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class OptimizationResponse {

    // Current portfolio allocation
    private Map<String, Double> currentAllocation; // e.g., {"Stocks": 70.0, "Bonds": 20.0, "Cash": 10.0}

    // Target allocation based on risk tolerance
    private Map<String, Double> targetAllocation;

    // Specific trade recommendations
    private List<TradeRecommendation> rebalanceTrades;

    // Projected improvement metrics
    private double projectedReturn;
    private double projectedRiskReduction;

    // AI-generated insight about why rebalancing helps
    private String aiInsight;

    // Agent status
    private String agentStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class TradeRecommendation {
        private String action; // "BUY" or "SELL"
        private String symbol; // Stock symbol
        private int quantity; // Number of shares
        private double value; // Trade value in ₹
        private String reason; // Why this trade is recommended
    }
}
