package com.financial.riskagent.service;

import com.financial.riskagent.model.AssetAllocation;
import com.financial.riskagent.model.RetirementPlan;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

/**
 * Retirement Planning Service
 * Calculates retirement corpus and investment strategy
 */
@Service
public class RetirementPlanningService {

        @Autowired
        private SIPCalculatorService sipCalculator;

        @Autowired
        private AssetAllocationService allocationService;

        private static final double DEFAULT_INFLATION_RATE = 6.0; // India avg
        private static final double WITHDRAWAL_RATE = 0.04; // 4% rule
        private static final int LIFE_EXPECTANCY = 85; // Years

        /**
         * Calculate comprehensive retirement plan
         */
        public RetirementPlan calculateRetirement(
                        Integer currentAge,
                        Integer retirementAge,
                        Double currentMonthlyExpenses,
                        Double currentSavings,
                        String riskTolerance) {
                // Calculate years to retirement
                int yearsToRetirement = retirementAge - currentAge;

                // Calculate expected return based on years and risk tolerance
                double expectedReturn = sipCalculator.getExpectedReturn(riskTolerance, yearsToRetirement);

                // Calculate future monthly expenses (inflation-adjusted)
                double futureMonthlyExpenses = sipCalculator.adjustForInflation(
                                currentMonthlyExpenses,
                                yearsToRetirement,
                                DEFAULT_INFLATION_RATE);

                // Calculate retirement corpus needed (based on 4% withdrawal rule)
                // Annual expenses / 4% = corpus needed
                double annualExpenses = futureMonthlyExpenses * 12;
                double corpusNeeded = annualExpenses / WITHDRAWAL_RATE;

                // Calculate monthly investment required
                double monthlyInvestment = sipCalculator.calculateSIP(
                                corpusNeeded,
                                yearsToRetirement,
                                expectedReturn,
                                currentSavings).getMonthlyInvestment();

                // Determine asset allocation
                AssetAllocation allocation = allocationService.determineAllocation(
                                riskTolerance,
                                yearsToRetirement);

                // Calculate current progress
                double currentProgress = (currentSavings / corpusNeeded) * 100;

                return RetirementPlan.builder()
                                .currentAge(currentAge)
                                .retirementAge(retirementAge)
                                .currentMonthlyExpenses(currentMonthlyExpenses)
                                .currentSavings(currentSavings)
                                .yearsToRetirement(yearsToRetirement)
                                .corpusNeeded(corpusNeeded)
                                .monthlyInvestmentRequired(monthlyInvestment)
                                .futureMonthlyExpenses(futureMonthlyExpenses)
                                .currentProgress(currentProgress)
                                .assetAllocation(allocation)
                                .inflationRate(DEFAULT_INFLATION_RATE)
                                .expectedReturn(expectedReturn)
                                .build();
        }

        /**
         * Calculate how long retirement corpus will last
         */
        public Integer calculateCorpusLastsForYears(Double corpus, Double monthlyExpenses) {
                // Using 4% withdrawal rule
                double annualWithdrawal = corpus * WITHDRAWAL_RATE;
                double annualExpenses = monthlyExpenses * 12;

                if (annualExpenses >= annualWithdrawal) {
                        return 0; // Corpus insufficient
                }

                // Simplified: assuming corpus grows at inflation rate
                return (LIFE_EXPECTANCY - 60); // Typical: 25 years post-retirement
        }

        /**
         * Adjust retirement plan if behind target
         */
        public RetirementPlan adjustPlan(RetirementPlan currentPlan, Double actualSavings) {
                // Recalculate with updated savings
                return calculateRetirement(
                                currentPlan.getCurrentAge(),
                                currentPlan.getRetirementAge(),
                                currentPlan.getCurrentMonthlyExpenses(),
                                actualSavings,
                                "moderate" // Default risk tolerance
                );
        }
}
