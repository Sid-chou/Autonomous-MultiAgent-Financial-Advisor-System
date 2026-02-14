package com.financial.riskagent.model;

/**
 * SIP Calculation Request/Response Model
 */
public class SIPCalculation {
    // Input parameters
    private Double targetAmount;
    private Integer years;
    private Double expectedReturn;
    private Double currentSavings;

    // Calculated results
    private Double monthlyInvestment;
    private Double totalInvestment;
    private Double totalReturns;
    private Double finalValue;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private SIPCalculation calc = new SIPCalculation();

        public Builder targetAmount(Double targetAmount) {
            calc.targetAmount = targetAmount;
            return this;
        }

        public Builder years(Integer years) {
            calc.years = years;
            return this;
        }

        public Builder expectedReturn(Double expectedReturn) {
            calc.expectedReturn = expectedReturn;
            return this;
        }

        public Builder currentSavings(Double currentSavings) {
            calc.currentSavings = currentSavings;
            return this;
        }

        public Builder monthlyInvestment(Double monthlyInvestment) {
            calc.monthlyInvestment = monthlyInvestment;
            return this;
        }

        public Builder totalInvestment(Double totalInvestment) {
            calc.totalInvestment = totalInvestment;
            return this;
        }

        public Builder totalReturns(Double totalReturns) {
            calc.totalReturns = totalReturns;
            return this;
        }

        public Builder finalValue(Double finalValue) {
            calc.finalValue = finalValue;
            return this;
        }

        public SIPCalculation build() {
            return calc;
        }
    }

    // Getters and Setters
    public Double getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(Double targetAmount) {
        this.targetAmount = targetAmount;
    }

    public Integer getYears() {
        return years;
    }

    public void setYears(Integer years) {
        this.years = years;
    }

    public Double getExpectedReturn() {
        return expectedReturn;
    }

    public void setExpectedReturn(Double expectedReturn) {
        this.expectedReturn = expectedReturn;
    }

    public Double getCurrentSavings() {
        return currentSavings;
    }

    public void setCurrentSavings(Double currentSavings) {
        this.currentSavings = currentSavings;
    }

    public Double getMonthlyInvestment() {
        return monthlyInvestment;
    }

    public void setMonthlyInvestment(Double monthlyInvestment) {
        this.monthlyInvestment = monthlyInvestment;
    }

    public Double getTotalInvestment() {
        return totalInvestment;
    }

    public void setTotalInvestment(Double totalInvestment) {
        this.totalInvestment = totalInvestment;
    }

    public Double getTotalReturns() {
        return totalReturns;
    }

    public void setTotalReturns(Double totalReturns) {
        this.totalReturns = totalReturns;
    }

    public Double getFinalValue() {
        return finalValue;
    }

    public void setFinalValue(Double finalValue) {
        this.finalValue = finalValue;
    }
}
