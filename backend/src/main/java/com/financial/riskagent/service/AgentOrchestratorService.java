package com.financial.riskagent.service;

import com.financial.riskagent.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

/**
 * Agent Orchestrator Service
 * Coordinates all autonomous agents to provide comprehensive portfolio analysis
 * Manages inter-agent communication and data flow
 */
@Service
public class AgentOrchestratorService {

    @Autowired
    private RiskAgentService riskAgent;

    @Autowired
    private PortfolioOptimizationService optimizationAgent;

    @Autowired
    private MarketAnalysisService marketAgent;

    @Autowired
    private AlertService alertAgent;

    @Autowired
    private AIRouterService aiRouter;

    /**
     * Comprehensive multi-agent portfolio analysis
     * All agents work together to provide complete financial insights
     */
    public ComprehensiveAnalysisResponse analyzeComprehensive(PortfolioRequest request) {

        try {
            // STEP 1: Get market context (Market Agent runs first)
            MarketAnalysisResponse marketAnalysis = marketAgent.analyzeMarket();

            // STEP 2: Analyze portfolio risk (Risk Agent with market context)
            RiskAnalysisResponse riskAnalysis = riskAgent.analyzeRisk(request);

            // STEP 3: Generate optimization recommendations (Optimization Agent)
            OptimizationResponse optimization = optimizationAgent.optimizePortfolio(
                    request.getHoldings(),
                    request.getRiskTolerance());

            // STEP 4: Check for alerts (Alert Agent)
            List<Alert> alerts = alertAgent.checkPortfolioAlerts(
                    request.getHoldings(),
                    Double.parseDouble(riskAnalysis.getRiskScore()));

            // STEP 5: Calculate overall portfolio health score
            double healthScore = calculateHealthScore(riskAnalysis, optimization, alerts);

            // STEP 6: Generate executive summary from all agents
            String executiveSummary = generateExecutiveSummary(
                    riskAnalysis,
                    optimization,
                    marketAnalysis,
                    alerts,
                    healthScore);

            // Build comprehensive response
            return ComprehensiveAnalysisResponse.builder()
                    .riskAnalysis(riskAnalysis)
                    .optimization(optimization)
                    .marketAnalysis(marketAnalysis)
                    .recentAlerts(alerts)
                    .healthScore(healthScore)
                    .executiveSummary(executiveSummary)
                    .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                    .coordinationStatus("ALL_AGENTS_OPERATIONAL")
                    .build();

        } catch (Exception e) {
            System.err.println("Multi-agent analysis error: " + e.getMessage());
            throw new RuntimeException("Failed to complete comprehensive analysis", e);
        }
    }

    /**
     * Calculate overall portfolio health score (0-100)
     */
    private double calculateHealthScore(
            RiskAnalysisResponse risk,
            OptimizationResponse optimization,
            List<Alert> alerts) {
        double score = 100.0;

        // Deduct for risk issues
        int riskScore = Integer.parseInt(risk.getRiskScore());
        if (riskScore > 70) {
            score -= 25; // High risk
        } else if (riskScore > 50) {
            score -= 10; // Medium risk
        }

        // Deduct for diversification issues
        if (risk.getDiversificationScore() < 40) {
            score -= 15; // Poor diversification
        } else if (risk.getDiversificationScore() < 60) {
            score -= 5; // Moderate diversification
        }

        // Deduct for critical alerts
        long criticalAlerts = alerts.stream()
                .filter(a -> a.getSeverity() == Alert.AlertSeverity.CRITICAL)
                .count();
        score -= (criticalAlerts * 10);

        // Deduct for allocation mismatch
        if (Math.abs(optimization.getProjectedRiskReduction()) > 5) {
            score -= 10; // Needs rebalancing
        }

        return Math.max(0, Math.min(100, score));
    }

    /**
     * Generate executive summary combining all agent insights
     */
    private String generateExecutiveSummary(
            RiskAnalysisResponse risk,
            OptimizationResponse optimization,
            MarketAnalysisResponse market,
            List<Alert> alerts,
            double healthScore) {
        String prompt = String.format(
                "Portfolio Analysis Summary:\n" +
                        "- Health Score: %.1f/100\n" +
                        "- Risk Level: %s (Score: %s)\n" +
                        "- Diversification: %.1f/100\n" +
                        "- Market Trend: %s (%s sentiment)\n" +
                        "- Allocation Gap: %.1f%% needs rebalancing\n" +
                        "- Active Alerts: %d (%d critical)\n\n" +
                        "Provide a brief executive summary (3-4 sentences) for an Indian investor. " +
                        "Focus on the 2-3 most important points they should act on.",

                healthScore,
                risk.getRiskLevel(),
                risk.getRiskScore(),
                risk.getDiversificationScore(),
                market.getTrend(),
                market.getSentiment(),
                Math.abs(optimization.getProjectedRiskReduction()),
                alerts.size(),
                alerts.stream().filter(a -> a.getSeverity() == Alert.AlertSeverity.CRITICAL).count());

        return aiRouter.generateInsight(
                prompt,
                AIRouterService.InsightComplexity.HIGH);
    }

    /**
     * Get quick portfolio snapshot (lightweight version)
     */
    public String getPortfolioSnapshot(PortfolioRequest request) {
        RiskAnalysisResponse risk = riskAgent.analyzeRisk(request);
        MarketAnalysisResponse market = marketAgent.analyzeMarket();

        return String.format(
                "Portfolio: ₹%.2f | Risk: %s | Market: %s | Diversification: %.1f%%",
                risk.getTotalValue(),
                risk.getRiskLevel(),
                market.getTrend(),
                risk.getDiversificationScore());
    }
}
