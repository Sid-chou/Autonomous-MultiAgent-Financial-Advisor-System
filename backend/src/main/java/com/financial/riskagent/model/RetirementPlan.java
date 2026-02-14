package com.financial.riskagent.model;

/**
 * Retirement Plan Model
 * Contains comprehensive retirement planning calculations
 */
public class RetirementPlan {
    // Input parameters
    private Integer currentAge;
    private Integer retirementAge;
    private Double currentMonthlyExpenses;
    private Double currentSavings;

    // Calculated results
    private Integer yearsToRetirement;
    private Double corpusNeeded;
    private Double monthlyInvestmentRequired;
    private Double futureMonthlyExpenses;
    private Double currentProgress;
    private AssetAllocation assetAllocation;
    private String aiInsight;
    private Double inflationRate;
    private Double expectedReturn;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private RetirementPlan plan = new RetirementPlan();

        public Builder currentAge(Integer currentAge) {
            plan.currentAge = currentAge;
            return this;
        }

        public Builder retirementAge(Integer retirementAge) {
            plan.retirementAge = retirementAge;
            return this;
        }

        public Builder currentMonthlyExpenses(Double currentMonthlyExpenses) {
            plan.currentMonthlyExpenses = currentMonthlyExpenses;
            return this;
        }

        public Builder currentSavings(Double currentSavings) {
            plan.currentSavings = currentSavings;
            return this;
        }

        public Builder yearsToRetirement(Integer yearsToRetirement) {
            plan.yearsToRetirement = yearsToRetirement;
            return this;
        }

        public Builder corpusNeeded(Double corpusNeeded) {
            plan.corpusNeeded = corpusNeeded;
            return this;
        }

        public Builder monthlyInvestmentRequired(Double monthlyInvestmentRequired) {
            plan.monthlyInvestmentRequired = monthlyInvestmentRequired;
            return this;
        }

        public Builder futureMonthlyExpenses(Double futureMonthlyExpenses) {
            plan.futureMonthlyExpenses = futureMonthlyExpenses;
            return this;
        }

        public Builder currentProgress(Double currentProgress) {
            plan.currentProgress = currentProgress;
            return this;
        }

        public Builder assetAllocation(AssetAllocation assetAllocation) {
            plan.assetAllocation = assetAllocation;
            return this;
        }

        public Builder aiInsight(String aiInsight) {
            plan.aiInsight = aiInsight;
            return this;
        }

        public Builder inflationRate(Double inflationRate) {
            plan.inflationRate = inflationRate;
            return this;
        }

        public Builder expectedReturn(Double expectedReturn) {
            plan.expectedReturn = expectedReturn;
            return this;
        }

        public RetirementPlan build() {
            return plan;
        }
    }

    // Getters and Setters
    public Integer getCurrentAge() {
        return currentAge;
    }

    public void setCurrentAge(Integer currentAge) {
        this.currentAge = currentAge;
    }

    public Integer getRetirementAge() {
        return retirementAge;
    }

    public void setRetirementAge(Integer retirementAge) {
        this.retirementAge = retirementAge;
    }

    public Double getCurrentMonthlyExpenses() {
        return currentMonthlyExpenses;
    }

    public void setCurrentMonthlyExpenses(Double currentMonthlyExpenses) {
        this.currentMonthlyExpenses = currentMonthlyExpenses;
    }

    public Double getCurrentSavings() {
        return currentSavings;
    }

    public void setCurrentSavings(Double currentSavings) {
        this.currentSavings = currentSavings;
    }

    public Integer getYearsToRetirement() {
        return yearsToRetirement;
    }

    public void setYearsToRetirement(Integer yearsToRetirement) {
        this.yearsToRetirement = yearsToRetirement;
    }

    public Double getCorpusNeeded() {
        return corpusNeeded;
    }

    public void setCorpusNeeded(Double corpusNeeded) {
        this.corpusNeeded = corpusNeeded;
    }

    public Double getMonthlyInvestmentRequired() {
        return monthlyInvestmentRequired;
    }

    public void setMonthlyInvestmentRequired(Double monthlyInvestmentRequired) {
        this.monthlyInvestmentRequired = monthlyInvestmentRequired;
    }

    public Double getFutureMonthlyExpenses() {
        return futureMonthlyExpenses;
    }

    public void setFutureMonthlyExpenses(Double futureMonthlyExpenses) {
        this.futureMonthlyExpenses = futureMonthlyExpenses;
    }

    public Double getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(Double currentProgress) {
        this.currentProgress = currentProgress;
    }

    public AssetAllocation getAssetAllocation() {
        return assetAllocation;
    }

    public void setAssetAllocation(AssetAllocation assetAllocation) {
        this.assetAllocation = assetAllocation;
    }

    public String getAiInsight() {
        return aiInsight;
    }

    public void setAiInsight(String aiInsight) {
        this.aiInsight = aiInsight;
    }

    public Double getInflationRate() {
        return inflationRate;
    }

    public void setInflationRate(Double inflationRate) {
        this.inflationRate = inflationRate;
    }

    public Double getExpectedReturn() {
        return expectedReturn;
    }

    public void setExpectedReturn(Double expectedReturn) {
        this.expectedReturn = expectedReturn;
    }
}
