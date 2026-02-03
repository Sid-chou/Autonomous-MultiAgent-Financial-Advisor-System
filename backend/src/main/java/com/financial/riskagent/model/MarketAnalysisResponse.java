package com.financial.riskagent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;
import java.util.Map;

/**
 * Response from Market Analysis Agent
 * Contains Indian market data and sentiment analysis
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class MarketAnalysisResponse {

    // Indian market indices
    private Map<String, IndexData> indices; // NIFTY50, SENSEX, BANKNIFTY

    // Market trend
    private String trend; // "BULLISH", "BEARISH", "NEUTRAL"

    // Market volatility index
    private double volatilityIndex;

    // Market sentiment
    private String sentiment; // "POSITIVE", "NEGATIVE", "MIXED"

    // Sector performance
    private List<SectorPerformance> sectors;

    // AI-generated market insight
    private String aiInsight;

    // Timestamp
    private String timestamp;

    // Agent status
    private String agentStatus;

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class IndexData {
        private String name;
        private double currentValue;
        private double changePercent;
        private String direction; // "UP", "DOWN", "FLAT"
    }

    @Data
    @Builder
    @NoArgsConstructor
    @AllArgsConstructor
    public static class SectorPerformance {
        private String sector;
        private double performance; // Percentage change
        private String status; // "LEADING", "LAGGING", "NEUTRAL"
    }
}
