package com.financial.riskagent.model;

/**
 * Investment Plan Model
 * Contains calculated investment strategy for a financial goal
 */
public class InvestmentPlan {
    private Long goalId;
    private Double monthlyInvestment;
    private Double initialInvestment;
    private Double expectedReturn;
    private AssetAllocation assetAllocation;
    private String riskLevel;
    private Boolean inflationAdjusted;
    private Double inflationRate;
    private Integer yearsToGoal;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private InvestmentPlan plan = new InvestmentPlan();

        public Builder goalId(Long goalId) {
            plan.goalId = goalId;
            return this;
        }

        public Builder monthlyInvestment(Double monthlyInvestment) {
            plan.monthlyInvestment = monthlyInvestment;
            return this;
        }

        public Builder initialInvestment(Double initialInvestment) {
            plan.initialInvestment = initialInvestment;
            return this;
        }

        public Builder expectedReturn(Double expectedReturn) {
            plan.expectedReturn = expectedReturn;
            return this;
        }

        public Builder assetAllocation(AssetAllocation assetAllocation) {
            plan.assetAllocation = assetAllocation;
            return this;
        }

        public Builder riskLevel(String riskLevel) {
            plan.riskLevel = riskLevel;
            return this;
        }

        public Builder inflationAdjusted(Boolean inflationAdjusted) {
            plan.inflationAdjusted = inflationAdjusted;
            return this;
        }

        public Builder inflationRate(Double inflationRate) {
            plan.inflationRate = inflationRate;
            return this;
        }

        public Builder yearsToGoal(Integer yearsToGoal) {
            plan.yearsToGoal = yearsToGoal;
            return this;
        }

        public InvestmentPlan build() {
            return plan;
        }
    }

    // Getters and Setters
    public Long getGoalId() {
        return goalId;
    }

    public void setGoalId(Long goalId) {
        this.goalId = goalId;
    }

    public Double getMonthlyInvestment() {
        return monthlyInvestment;
    }

    public void setMonthlyInvestment(Double monthlyInvestment) {
        this.monthlyInvestment = monthlyInvestment;
    }

    public Double getInitialInvestment() {
        return initialInvestment;
    }

    public void setInitialInvestment(Double initialInvestment) {
        this.initialInvestment = initialInvestment;
    }

    public Double getExpectedReturn() {
        return expectedReturn;
    }

    public void setExpectedReturn(Double expectedReturn) {
        this.expectedReturn = expectedReturn;
    }

    public AssetAllocation getAssetAllocation() {
        return assetAllocation;
    }

    public void setAssetAllocation(AssetAllocation assetAllocation) {
        this.assetAllocation = assetAllocation;
    }

    public String getRiskLevel() {
        return riskLevel;
    }

    public void setRiskLevel(String riskLevel) {
        this.riskLevel = riskLevel;
    }

    public Boolean getInflationAdjusted() {
        return inflationAdjusted;
    }

    public void setInflationAdjusted(Boolean inflationAdjusted) {
        this.inflationAdjusted = inflationAdjusted;
    }

    public Double getInflationRate() {
        return inflationRate;
    }

    public void setInflationRate(Double inflationRate) {
        this.inflationRate = inflationRate;
    }

    public Integer getYearsToGoal() {
        return yearsToGoal;
    }

    public void setYearsToGoal(Integer yearsToGoal) {
        this.yearsToGoal = yearsToGoal;
    }
}
