package com.financial.riskagent.service;

import com.financial.riskagent.model.AssetAllocation;
import org.springframework.stereotype.Service;

/**
 * Asset Allocation Service
 * Determines optimal portfolio allocation based on risk and time horizon
 */
@Service
public class AssetAllocationService {

    /**
     * Determine asset allocation based on risk tolerance and years to goal
     */
    public AssetAllocation determineAllocation(String riskTolerance, Integer yearsToGoal) {
        // Rule-based allocation considering Indian market context

        if (yearsToGoal > 10) {
            // Long-term goals - more equity exposure
            switch (riskTolerance.toLowerCase()) {
                case "aggressive":
                    return AssetAllocation.builder()
                            .equity(80.0)
                            .debt(12.0)
                            .gold(5.0)
                            .cash(3.0)
                            .build();

                case "moderate":
                    return AssetAllocation.builder()
                            .equity(65.0)
                            .debt(25.0)
                            .gold(7.0)
                            .cash(3.0)
                            .build();

                case "conservative":
                    return AssetAllocation.builder()
                            .equity(45.0)
                            .debt(40.0)
                            .gold(10.0)
                            .cash(5.0)
                            .build();

                default:
                    return getBalancedAllocation();
            }
        } else if (yearsToGoal > 5) {
            // Medium-term goals - balanced approach
            switch (riskTolerance.toLowerCase()) {
                case "aggressive":
                    return AssetAllocation.builder()
                            .equity(60.0)
                            .debt(30.0)
                            .gold(5.0)
                            .cash(5.0)
                            .build();

                case "moderate":
                    return AssetAllocation.builder()
                            .equity(50.0)
                            .debt(35.0)
                            .gold(10.0)
                            .cash(5.0)
                            .build();

                case "conservative":
                    return AssetAllocation.builder()
                            .equity(30.0)
                            .debt(55.0)
                            .gold(10.0)
                            .cash(5.0)
                            .build();

                default:
                    return getBalancedAllocation();
            }
        } else {
            // Short-term goals - capital protection focus
            switch (riskTolerance.toLowerCase()) {
                case "aggressive":
                    return AssetAllocation.builder()
                            .equity(35.0)
                            .debt(50.0)
                            .gold(5.0)
                            .cash(10.0)
                            .build();

                case "moderate":
                    return AssetAllocation.builder()
                            .equity(20.0)
                            .debt(65.0)
                            .gold(5.0)
                            .cash(10.0)
                            .build();

                case "conservative":
                    return AssetAllocation.builder()
                            .equity(10.0)
                            .debt(75.0)
                            .gold(5.0)
                            .cash(10.0)
                            .build();

                default:
                    return getBalancedAllocation();
            }
        }
    }

    /**
     * Get default balanced allocation
     */
    private AssetAllocation getBalancedAllocation() {
        return AssetAllocation.builder()
                .equity(60.0)
                .debt(30.0)
                .gold(7.0)
                .cash(3.0)
                .build();
    }

    /**
     * Adjust allocation as goal approaches (glide path)
     */
    public AssetAllocation getGlidePath(AssetAllocation currentAllocation, Integer yearsRemaining) {
        if (yearsRemaining <= 2) {
            // Shift to conservative in final 2 years
            return AssetAllocation.builder()
                    .equity(currentAllocation.getEquity() * 0.5)
                    .debt(currentAllocation.getDebt() + currentAllocation.getEquity() * 0.35)
                    .gold(currentAllocation.getGold() + 2.0)
                    .cash(currentAllocation.getCash() + currentAllocation.getEquity() * 0.15)
                    .build();
        }

        return currentAllocation;
    }

    /**
     * Validate allocation adds up to 100%
     */
    public boolean isValidAllocation(AssetAllocation allocation) {
        double total = allocation.getEquity() + allocation.getDebt() +
                allocation.getGold() + allocation.getCash();
        return Math.abs(total - 100.0) < 0.01; // Allow for rounding errors
    }
}
