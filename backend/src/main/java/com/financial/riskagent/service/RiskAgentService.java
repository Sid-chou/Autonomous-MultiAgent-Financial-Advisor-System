package com.financial.riskagent.service;

import com.financial.riskagent.model.Holding;
import com.financial.riskagent.model.PortfolioRequest;
import com.financial.riskagent.model.RiskAnalysisResponse;
import org.springframework.stereotype.Service;

import java.util.ArrayList;
import java.util.List;
import java.util.Random;

@Service
public class RiskAgentService {

    private final Random random = new Random();

    /**
     * Main method: Analyze portfolio risk
     * This is where the autonomous agent logic lives
     */
    public RiskAnalysisResponse analyzeRisk(PortfolioRequest request) {
        System.out.println("🤖 Risk Agent: Starting portfolio analysis...");

        List<Holding> holdings = request.getHoldings();

        // Calculate portfolio metrics
        double totalValue = calculateTotalValue(holdings);
        double volatility = calculateVolatility(holdings);
        double valueAtRisk = calculateVaR(totalValue, volatility);
        double diversificationScore = calculateDiversification(holdings);

        // Generate risk score (0-100)
        int riskScore = calculateRiskScore(volatility, diversificationScore);

        // Determine risk level
        String riskLevel = determineRiskLevel(riskScore);

        // Generate recommendations
        List<String> recommendations = generateRecommendations(
                riskLevel, diversificationScore, holdings.size(), request.getRiskTolerance());

        // AI Insight (simulated for demo)
        String aiInsight = generateAIInsight(riskLevel, totalValue, holdings.size());

        System.out.println("✅ Risk Agent: Analysis complete!");

        return RiskAnalysisResponse.builder()
                .totalValue(totalValue)
                .totalRisk(volatility)
                .valueAtRisk(valueAtRisk)
                .standardDeviation(volatility)
                .diversificationScore(diversificationScore)
                .riskLevel(riskLevel)
                .riskScore(String.valueOf(riskScore))
                .recommendations(recommendations)
                .aiInsight(aiInsight)
                .agentStatus("ANALYSIS_COMPLETE")
                .build();
    }

    /**
     * Calculate total portfolio value
     */
    private double calculateTotalValue(List<Holding> holdings) {
        return holdings.stream()
                .mapToDouble(h -> h.getCurrentPrice() * h.getQuantity())
                .sum();
    }

    /**
     * Calculate portfolio volatility (standard deviation)
     * Simplified calculation for demo
     */
    private double calculateVolatility(List<Holding> holdings) {
        if (holdings.isEmpty())
            return 0;

        // Calculate returns for each holding
        List<Double> returns = new ArrayList<>();
        for (Holding h : holdings) {
            double returnPct = ((h.getCurrentPrice() - h.getPurchasePrice()) / h.getPurchasePrice()) * 100;
            returns.add(Math.abs(returnPct));
        }

        // Calculate average return
        double avgReturn = returns.stream().mapToDouble(Double::doubleValue).average().orElse(0);

        // Calculate variance
        double variance = returns.stream()
                .mapToDouble(r -> Math.pow(r - avgReturn, 2))
                .average()
                .orElse(0);

        // Standard deviation (volatility)
        return Math.sqrt(variance);
    }

    /**
     * Calculate Value at Risk (VaR) - simplified 95% confidence
     */
    private double calculateVaR(double totalValue, double volatility) {
        // 95% VaR = Portfolio Value * 1.65 * Daily Volatility
        // Simplified: assume daily volatility is annual volatility / sqrt(252)
        double dailyVolatility = volatility / Math.sqrt(252);
        return totalValue * 1.65 * (dailyVolatility / 100);
    }

    /**
     * Calculate diversification score (0-100)
     * Higher score = better diversification
     */
    private double calculateDiversification(List<Holding> holdings) {
        if (holdings.isEmpty())
            return 0;

        // Simple heuristic: number of holdings + value distribution
        int numHoldings = holdings.size();

        // Calculate Herfindahl index (concentration)
        double totalValue = calculateTotalValue(holdings);
        double herfindahl = holdings.stream()
                .mapToDouble(h -> {
                    double weight = (h.getCurrentPrice() * h.getQuantity()) / totalValue;
                    return weight * weight;
                })
                .sum();

        // Convert to diversification score (0-100)
        // Lower Herfindahl = better diversification
        double diversificationFromConcentration = (1 - herfindahl) * 100;

        // Bonus points for more holdings (up to 20 holdings)
        double diversificationFromCount = Math.min(numHoldings * 5, 50);

        return Math.min((diversificationFromConcentration + diversificationFromCount) / 2, 100);
    }

    /**
     * Calculate overall risk score (0-100)
     * Higher = more risky
     */
    private int calculateRiskScore(double volatility, double diversificationScore) {
        // Volatility contributes 60%, lack of diversification contributes 40%
        double volatilityComponent = Math.min(volatility * 3, 60);
        double diversificationComponent = (100 - diversificationScore) * 0.4;

        return (int) Math.min(volatilityComponent + diversificationComponent, 100);
    }

    /**
     * Determine risk level from score
     */
    private String determineRiskLevel(int riskScore) {
        if (riskScore < 30)
            return "LOW";
        if (riskScore < 60)
            return "MEDIUM";
        return "HIGH";
    }

    /**
     * Generate personalized recommendations
     */
    private List<String> generateRecommendations(String riskLevel, double diversificationScore,
            int numHoldings, String riskTolerance) {
        List<String> recommendations = new ArrayList<>();

        // Risk level recommendations
        if (riskLevel.equals("HIGH")) {
            recommendations.add("⚠️ High Risk Detected: Consider rebalancing to reduce overall portfolio risk");
            recommendations.add("Consider adding bonds or defensive stocks to reduce volatility");
        } else if (riskLevel.equals("MEDIUM")) {
            recommendations.add("✓ Moderate Risk: Portfolio is reasonably balanced");
        } else {
            recommendations.add("✓ Low Risk: Portfolio is conservative and stable");
        }

        // Diversification recommendations
        if (diversificationScore < 40) {
            recommendations.add("⚠️ Low Diversification: Add more holdings across different sectors");
            recommendations.add("Consider index funds or ETFs for instant diversification");
        } else if (diversificationScore < 70) {
            recommendations.add("Diversification could be improved - consider adding 2-3 more positions");
        } else {
            recommendations.add("✓ Well Diversified: Portfolio has good spread across holdings");
        }

        // Holdings count recommendations
        if (numHoldings < 5) {
            recommendations.add("Portfolio has too few holdings - recommended minimum is 5-10");
        } else if (numHoldings > 30) {
            recommendations.add("Portfolio may be over-diversified - consider consolidating positions");
        }

        // Risk tolerance alignment
        if (riskTolerance != null) {
            if (riskTolerance.equals("conservative") && riskLevel.equals("HIGH")) {
                recommendations.add("🎯 Alignment Issue: Your portfolio risk doesn't match your conservative profile");
            } else if (riskTolerance.equals("aggressive") && riskLevel.equals("LOW")) {
                recommendations.add("🎯 Growth Opportunity: You may be too conservative for your risk tolerance");
            } else {
                recommendations.add("✓ Risk Alignment: Portfolio matches your risk tolerance");
            }
        }

        return recommendations;
    }

    /**
     * Generate AI-powered insight
     * In production, this would call Gemini API
     */
    private String generateAIInsight(String riskLevel, double totalValue, int numHoldings) {
        String[] insights = {
                "Based on current market conditions and your portfolio composition, the " + riskLevel.toLowerCase() +
                        " risk level suggests a " + (riskLevel.equals("HIGH") ? "cautious" : "balanced")
                        + " approach to future investments.",

                "Your portfolio of $" + String.format("%.2f", totalValue) + " across " + numHoldings +
                        " holdings shows " + (numHoldings >= 8 ? "good" : "limited") + " diversification potential.",

                "Market volatility indicators suggest " + (riskLevel.equals("LOW") ? "maintaining" : "reviewing") +
                        " your current allocation strategy. Consider "
                        + (riskLevel.equals("HIGH") ? "defensive" : "growth") + " sectors.",

                "Risk-adjusted returns could be optimized by "
                        + (riskLevel.equals("HIGH") ? "reducing exposure to volatile assets"
                                : "maintaining current strategy")
                        + "."
        };

        return insights[random.nextInt(insights.length)];
    }
}
