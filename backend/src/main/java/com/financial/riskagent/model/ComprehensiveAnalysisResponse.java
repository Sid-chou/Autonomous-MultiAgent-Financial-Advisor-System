package com.financial.riskagent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

/**
 * Comprehensive analysis response from all agents
 * Combined insights from Risk, Optimization, Market, and Alert agents
 */
@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ComprehensiveAnalysisResponse {

    // Risk Agent analysis
    private RiskAnalysisResponse riskAnalysis;

    // Portfolio Optimization Agent analysis
    private OptimizationResponse optimization;

    // Market Analysis Agent data
    private MarketAnalysisResponse marketAnalysis;

    // Recent alerts from Alert Agent
    private List<Alert> recentAlerts;

    // Overall portfolio health score (0-100)
    private double healthScore;

    // Summary of all agents' recommendations
    private String executiveSummary;

    // Timestamp
    private String timestamp;

    // Overall agent coordination status
    private String coordinationStatus;
}
