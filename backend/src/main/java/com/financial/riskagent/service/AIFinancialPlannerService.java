package com.financial.riskagent.service;

import com.financial.riskagent.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.temporal.ChronoUnit;
import java.util.List;

/**
 * AI Financial Planner Service
 * Generates AI-powered financial strategies and insights
 */
@Service
public class AIFinancialPlannerService {

    @Autowired
    private AIRouterService aiRouter;

    /**
     * Generate comprehensive AI strategy for a goal
     */
    public String generateGoalStrategy(FinancialGoal goal, InvestmentPlan plan) {
        String prompt = buildGoalStrategyPrompt(goal, plan);
        return aiRouter.generateInsight(prompt, AIRouterService.InsightComplexity.MEDIUM);
    }

    /**
     * Generate AI insight for retirement plan
     */
    public String generateRetirementInsight(RetirementPlan plan) {
        String prompt = String.format(
                "Retirement Planning Analysis:\n" +
                        "Current age: %d, Retirement age: %d (%d years to retirement)\n" +
                        "Current monthly expenses: ₹%,.0f\n" +
                        "Future monthly expenses (inflation-adjusted): ₹%,.0f\n" +
                        "Retirement corpus needed: ₹%,.0f\n" +
                        "Monthly SIP required: ₹%,.0f\n" +
                        "Current savings: ₹%,.0f (%.1f%% progress)\n\n" +
                        "Provide a 3-4 sentence strategic insight for this Indian investor. " +
                        "Address: (1) Is the retirement plan realistic? " +
                        "(2) Key actions to take now " +
                        "(3) Investment strategy recommendations",
                plan.getCurrentAge(),
                plan.getRetirementAge(),
                plan.getYearsToRetirement(),
                plan.getCurrentMonthlyExpenses(),
                plan.getFutureMonthlyExpenses(),
                plan.getCorpusNeeded(),
                plan.getMonthlyInvestmentRequired(),
                plan.getCurrentSavings(),
                plan.getCurrentProgress());

        return aiRouter.generateInsight(prompt, AIRouterService.InsightComplexity.HIGH);
    }

    /**
     * Generate comprehensive financial plan for multiple goals
     */
    public String generateComprehensivePlan(List<FinancialGoal> goals, Double totalMonthlyIncome) {
        if (goals.isEmpty()) {
            return "No active financial goals. Consider setting goals like emergency fund, retirement, or major purchases.";
        }

        String prompt = buildComprehensivePlanPrompt(goals, totalMonthlyIncome);
        return aiRouter.generateInsight(prompt, AIRouterService.InsightComplexity.HIGH);
    }

    /**
     * Generate advice when goal is off-track
     */
    public String generateGetBackOnTrackAdvice(FinancialGoal goal, GoalProgress progress) {
        String prompt = String.format(
                "Financial Goal Status:\n" +
                        "Goal: %s (%s)\n" +
                        "Target: ₹%,.0f by %s\n" +
                        "Current progress: ₹%,.0f (%.1f%%)\n" +
                        "Status: BEHIND SCHEDULE\n" +
                        "Required monthly SIP to catch up: ₹%,.0f\n" +
                        "Days remaining: %d\n\n" +
                        "Provide 2-3 actionable recommendations to get back on track. " +
                        "Be specific and practical for Indian investor context.",
                goal.getName(),
                goal.getType(),
                goal.getTargetAmount(),
                goal.getTargetDate(),
                progress.getCurrentValue(),
                progress.getProgressPercentage(),
                progress.getRequiredMonthlyInvestment(),
                progress.getDaysToGoal());

        return aiRouter.generateInsight(prompt, AIRouterService.InsightComplexity.MEDIUM);
    }

    /**
     * Build prompt for goal strategy
     */
    private String buildGoalStrategyPrompt(FinancialGoal goal, InvestmentPlan plan) {
        int yearsToGoal = (int) ChronoUnit.YEARS.between(LocalDate.now(), goal.getTargetDate());

        return String.format(
                "Financial Goal Planning:\n" +
                        "Goal: %s (%s priority %s)\n" +
                        "Target amount: ₹%,.0f\n" +
                        "Timeline: %d years\n" +
                        "Current savings: ₹%,.0f\n" +
                        "Recommended monthly SIP: ₹%,.0f\n" +
                        "Expected return: %.1f%% per year\n" +
                        "Asset allocation: Equity %.0f%%, Debt %.0f%%, Gold %.0f%%, Cash %.0f%%\n\n" +
                        "Provide a strategic 3-4 sentence plan for achieving this goal. " +
                        "Include: (1) Specific investment instruments for Indian market " +
                        "(2) Risk considerations (3) Tax-saving opportunities if applicable. " +
                        "Be practical and actionable.",
                goal.getName(),
                goal.getPriority().toString().toLowerCase(),
                goal.getType(),
                goal.getTargetAmount(),
                yearsToGoal,
                goal.getCurrentProgress(),
                plan.getMonthlyInvestment(),
                plan.getExpectedReturn(),
                plan.getAssetAllocation().getEquity(),
                plan.getAssetAllocation().getDebt(),
                plan.getAssetAllocation().getGold(),
                plan.getAssetAllocation().getCash());
    }

    /**
     * Build prompt for comprehensive plan
     */
    private String buildComprehensivePlanPrompt(List<FinancialGoal> goals, Double monthlyIncome) {
        StringBuilder prompt = new StringBuilder();
        prompt.append("Comprehensive Financial Planning:\n");
        prompt.append(String.format("Monthly income: ₹%,.0f\n\n", monthlyIncome));
        prompt.append("Financial goals:\n");

        for (int i = 0; i < goals.size(); i++) {
            FinancialGoal goal = goals.get(i);
            prompt.append(String.format(
                    "%d. %s (%s) - ₹%,.0f target in %d years (Priority: %s)\n",
                    i + 1,
                    goal.getName(),
                    goal.getType(),
                    goal.getTargetAmount(),
                    ChronoUnit.YEARS.between(LocalDate.now(), goal.getTargetDate()),
                    goal.getPriority()));
        }

        prompt.append("\nProvide a comprehensive financial plan that:\n");
        prompt.append("1. Prioritizes these goals effectively\n");
        prompt.append("2. Suggests realistic monthly allocation for each goal\n");
        prompt.append("3. Identifies potential conflicts or unrealistic expectations\n");
        prompt.append("4. Recommends specific investment strategies for Indian market\n");
        prompt.append("5. Highlights tax-saving opportunities\n\n");
        prompt.append("Keep response concise (5-6 sentences max). Be actionable and specific.");

        return prompt.toString();
    }
}
