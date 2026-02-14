package com.financial.riskagent.service;

import com.financial.riskagent.model.SIPCalculation;
import org.springframework.stereotype.Service;

/**
 * SIP Calculator Service
 * Calculates monthly SIP investments for financial goals
 */
@Service
public class SIPCalculatorService {

    private static final double DEFAULT_INFLATION_RATE = 6.0; // 6% for India

    /**
     * Calculate monthly SIP required to reach target amount
     */
    public SIPCalculation calculateSIP(Double targetAmount, Integer years, Double expectedReturn,
            Double currentSavings) {
        int months = years * 12;
        double monthlyRate = expectedReturn / 12 / 100;

        // Adjust target for current savings growth
        double futureValueOfSavings = currentSavings * Math.pow(1 + expectedReturn / 100, years);
        double adjustedTarget = targetAmount - futureValueOfSavings;

        // Calculate monthly SIP using Future Value of Annuity formula
        // FV = P × [(1 + r)^n - 1] / r × (1 + r)
        // Solving for P: P = FV × r / [(1 + r)^n - 1] / (1 + r)
        double monthlyInvestment;
        if (monthlyRate == 0) {
            // If no returns, simple division
            monthlyInvestment = adjustedTarget / months;
        } else {
            monthlyInvestment = adjustedTarget * monthlyRate /
                    (Math.pow(1 + monthlyRate, months) - 1) *
                    (1 / (1 + monthlyRate));
        }

        // Calculate totals
        double totalInvestment = (monthlyInvestment * months) + currentSavings;
        double finalValue = calculateFutureValue(monthlyInvestment, months, monthlyRate) + futureValueOfSavings;
        double totalReturns = finalValue - totalInvestment;

        return SIPCalculation.builder()
                .targetAmount(targetAmount)
                .years(years)
                .expectedReturn(expectedReturn)
                .currentSavings(currentSavings)
                .monthlyInvestment(Math.max(0, monthlyInvestment))
                .totalInvestment(totalInvestment)
                .totalReturns(totalReturns)
                .finalValue(finalValue)
                .build();
    }

    /**
     * Calculate how much a monthly SIP will grow to
     */
    public Double calculateFutureValue(Double monthlyInvestment, Integer months, Double monthlyRate) {
        if (monthlyRate == 0) {
            return monthlyInvestment * months;
        }

        return monthlyInvestment *
                ((Math.pow(1 + monthlyRate, months) - 1) / monthlyRate) *
                (1 + monthlyRate);
    }

    /**
     * Calculate inflation-adjusted target amount
     */
    public Double adjustForInflation(Double currentAmount, Integer years) {
        return adjustForInflation(currentAmount, years, DEFAULT_INFLATION_RATE);
    }

    public Double adjustForInflation(Double currentAmount, Integer years, Double inflationRate) {
        return currentAmount * Math.pow(1 + inflationRate / 100, years);
    }

    /**
     * Calculate what a lump sum investment will grow to
     */
    public Double calculateLumpSumGrowth(Double principal, Integer years, Double annualReturn) {
        return principal * Math.pow(1 + annualReturn / 100, years);
    }

    /**
     * Determine expected return based on risk tolerance and time horizon
     */
    public Double getExpectedReturn(String riskTolerance, Integer years) {
        // Conservative estimates for Indian market
        if (years > 10) {
            switch (riskTolerance.toLowerCase()) {
                case "aggressive":
                    return 12.0; // Equity heavy
                case "moderate":
                    return 10.0; // Balanced
                case "conservative":
                    return 7.5; // Debt heavy
                default:
                    return 10.0;
            }
        } else if (years > 5) {
            switch (riskTolerance.toLowerCase()) {
                case "aggressive":
                    return 10.0;
                case "moderate":
                    return 8.5;
                case "conservative":
                    return 7.0;
                default:
                    return 8.5;
            }
        } else {
            // Short term - conservative
            return 6.5;
        }
    }
}
