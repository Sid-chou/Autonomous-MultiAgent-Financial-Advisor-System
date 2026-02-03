package com.financial.riskagent.service;

import com.financial.riskagent.model.Holding;
import com.financial.riskagent.model.OptimizationResponse;
import com.financial.riskagent.model.OptimizationResponse.TradeRecommendation;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.util.*;

/**
 * Portfolio Optimization Agent
 * Autonomous agent that analyzes portfolio allocation and suggests rebalancing
 * Optimized for Indian market (NSE/BSE stocks)
 */
@Service
public class PortfolioOptimizationService {

    @Autowired
    private AIRouterService aiRouter;

    /**
     * Analyze portfolio and generate optimization recommendations
     */
    public OptimizationResponse optimizePortfolio(List<Holding> holdings, String riskTolerance) {

        // Calculate total portfolio value
        double totalValue = holdings.stream()
                .mapToDouble(h -> h.getCurrentPrice() * h.getQuantity())
                .sum();

        // Calculate current allocation
        Map<String, Double> currentAllocation = calculateCurrentAllocation(holdings, totalValue);

        // Get target allocation based on risk tolerance
        Map<String, Double> targetAllocation = getTargetAllocation(riskTolerance);

        // Generate rebalancing trades
        List<TradeRecommendation> trades = generateRebalancingTrades(
                holdings, currentAllocation, targetAllocation, totalValue);

        // Calculate projected improvements
        double projectedReturn = calculateProjectedReturn(currentAllocation, targetAllocation);
        double projectedRiskReduction = calculateRiskReduction(currentAllocation, targetAllocation);

        // Generate AI insight
        String aiPrompt = buildOptimizationPrompt(
                currentAllocation, targetAllocation, trades, riskTolerance, totalValue);
        String aiInsight = aiRouter.generateInsight(
                aiPrompt,
                AIRouterService.InsightComplexity.HIGH);

        return OptimizationResponse.builder()
                .currentAllocation(currentAllocation)
                .targetAllocation(targetAllocation)
                .rebalanceTrades(trades)
                .projectedReturn(projectedReturn)
                .projectedRiskReduction(projectedRiskReduction)
                .aiInsight(aiInsight)
                .agentStatus("OPTIMIZATION_COMPLETE")
                .build();
    }

    /**
     * Calculate current portfolio allocation (simple classification)
     */
    private Map<String, Double> calculateCurrentAllocation(List<Holding> holdings, double totalValue) {
        Map<String, Double> allocation = new HashMap<>();

        double stocksValue = 0;
        double bondsValue = 0;

        for (Holding holding : holdings) {
            double value = holding.getCurrentPrice() * holding.getQuantity();
            String symbol = holding.getSymbol().toUpperCase();

            // Simple classification based on symbol
            if (isBond(symbol)) {
                bondsValue += value;
            } else {
                stocksValue += value; // Most Indian stocks
            }
        }

        // Convert to percentages
        allocation.put("Stocks", (stocksValue / totalValue) * 100);
        allocation.put("Bonds", (bondsValue / totalValue) * 100);
        allocation.put("Cash", 0.0); // Demo doesn't track cash

        return allocation;
    }

    /**
     * Check if symbol represents a bond
     */
    private boolean isBond(String symbol) {
        return symbol.contains("BOND") ||
                symbol.contains("GILT") ||
                symbol.contains("SDL") ||
                symbol.startsWith("G"); // Government securities
    }

    /**
     * Get target allocation based on risk tolerance (Indian market)
     */
    private Map<String, Double> getTargetAllocation(String riskTolerance) {
        Map<String, Double> target = new HashMap<>();

        switch (riskTolerance.toLowerCase()) {
            case "conservative":
                target.put("Stocks", 30.0);
                target.put("Bonds", 60.0);
                target.put("Cash", 10.0);
                break;
            case "moderate":
                target.put("Stocks", 50.0);
                target.put("Bonds", 40.0);
                target.put("Cash", 10.0);
                break;
            case "aggressive":
                target.put("Stocks", 75.0);
                target.put("Bonds", 20.0);
                target.put("Cash", 5.0);
                break;
            default:
                target.put("Stocks", 50.0);
                target.put("Bonds", 40.0);
                target.put("Cash", 10.0);
        }

        return target;
    }

    /**
     * Generate specific trade recommendations
     */
    private List<TradeRecommendation> generateRebalancingTrades(
            List<Holding> holdings,
            Map<String, Double> current,
            Map<String, Double> target,
            double totalValue) {
        List<TradeRecommendation> trades = new ArrayList<>();

        double stocksDiff = target.get("Stocks") - current.get("Stocks");
        double bondsDiff = target.get("Bonds") - current.get("Bonds");

        // Suggest stock trades
        if (Math.abs(stocksDiff) > 5) { // Only if difference > 5%
            double stockValue = (stocksDiff / 100) * totalValue;

            if (stocksDiff > 0) {
                // Need to buy stocks
                trades.add(TradeRecommendation.builder()
                        .action("BUY")
                        .symbol("NIFTYBEES") // Popular Indian ETF
                        .quantity((int) (stockValue / 200)) // Approx ₹200 per unit
                        .value(Math.abs(stockValue))
                        .reason("Increase equity exposure to match risk tolerance")
                        .build());
            } else {
                // Need to sell stocks
                if (!holdings.isEmpty()) {
                    Holding largest = holdings.stream()
                            .max(Comparator.comparingDouble(h -> h.getCurrentPrice() * h.getQuantity()))
                            .orElse(holdings.get(0));

                    int sellQty = (int) Math.min(
                            Math.abs(stockValue) / largest.getCurrentPrice(),
                            largest.getQuantity() / 2.0 // Max 50% of position
                    );

                    trades.add(TradeRecommendation.builder()
                            .action("SELL")
                            .symbol(largest.getSymbol())
                            .quantity(sellQty)
                            .value(sellQty * largest.getCurrentPrice())
                            .reason("Reduce equity concentration")
                            .build());
                }
            }
        }

        // Suggest bond/debt trades
        if (Math.abs(bondsDiff) > 5) {
            double bondValue = (bondsDiff / 100) * totalValue;

            if (bondsDiff > 0) {
                trades.add(TradeRecommendation.builder()
                        .action("BUY")
                        .symbol("LIQUIDBEES") // Liquid fund ETF
                        .quantity((int) (bondValue / 1000))
                        .value(Math.abs(bondValue))
                        .reason("Increase debt exposure for stability")
                        .build());
            }
        }

        return trades;
    }

    /**
     * Calculate projected return improvement
     */
    private double calculateProjectedReturn(Map<String, Double> current, Map<String, Double> target) {
        // Simplified calculation
        double currentExpectedReturn = current.get("Stocks") * 0.12 + current.get("Bonds") * 0.06;
        double targetExpectedReturn = target.get("Stocks") * 0.12 + target.get("Bonds") * 0.06;
        return targetExpectedReturn - currentExpectedReturn;
    }

    /**
     * Calculate projected risk reduction
     */
    private double calculateRiskReduction(Map<String, Double> current, Map<String, Double> target) {
        // Simplified calculation
        double currentRisk = current.get("Stocks") * 0.18 + current.get("Bonds") * 0.05;
        double targetRisk = target.get("Stocks") * 0.18 + target.get("Bonds") * 0.05;
        return currentRisk - targetRisk;
    }

    /**
     * Build AI prompt for optimization insight
     */
    private String buildOptimizationPrompt(
            Map<String, Double> current,
            Map<String, Double> target,
            List<TradeRecommendation> trades,
            String riskTolerance,
            double totalValue) {
        return String.format(
                "Portfolio worth ₹%.2f. Current allocation: Stocks %.1f%%, Bonds %.1f%%. " +
                        "Target for %s investor: Stocks %.1f%%, Bonds %.1f%%. " +
                        "Rebalancing suggested: %d trades. " +
                        "Explain in 2-3 sentences why this rebalancing helps, considering Indian market conditions.",
                totalValue,
                current.get("Stocks"),
                current.get("Bonds"),
                riskTolerance,
                target.get("Stocks"),
                target.get("Bonds"),
                trades.size());
    }
}
