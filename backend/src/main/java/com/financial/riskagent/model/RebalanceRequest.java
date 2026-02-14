package com.financial.riskagent.model;

import java.util.List;
import java.util.Map;

/**
 * Rebalance Request Model
 * Request model for executing portfolio rebalancing trades
 */
public class RebalanceRequest {

    private List<Holding> currentHoldings;
    private Map<String, Double> targetAllocation; // symbol -> target percentage
    private String riskTolerance;
    private Double maxTradeAmount;
    private boolean autoExecute; // If true, execute immediately; if false, create pending orders

    // Constructor
    public RebalanceRequest() {
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private RebalanceRequest request = new RebalanceRequest();

        public Builder currentHoldings(List<Holding> holdings) {
            request.currentHoldings = holdings;
            return this;
        }

        public Builder targetAllocation(Map<String, Double> allocation) {
            request.targetAllocation = allocation;
            return this;
        }

        public Builder riskTolerance(String riskTolerance) {
            request.riskTolerance = riskTolerance;
            return this;
        }

        public Builder maxTradeAmount(Double maxTradeAmount) {
            request.maxTradeAmount = maxTradeAmount;
            return this;
        }

        public Builder autoExecute(boolean autoExecute) {
            request.autoExecute = autoExecute;
            return this;
        }

        public RebalanceRequest build() {
            return request;
        }
    }

    // Getters and Setters
    public List<Holding> getCurrentHoldings() {
        return currentHoldings;
    }

    public void setCurrentHoldings(List<Holding> currentHoldings) {
        this.currentHoldings = currentHoldings;
    }

    public Map<String, Double> getTargetAllocation() {
        return targetAllocation;
    }

    public void setTargetAllocation(Map<String, Double> targetAllocation) {
        this.targetAllocation = targetAllocation;
    }

    public String getRiskTolerance() {
        return riskTolerance;
    }

    public void setRiskTolerance(String riskTolerance) {
        this.riskTolerance = riskTolerance;
    }

    public Double getMaxTradeAmount() {
        return maxTradeAmount;
    }

    public void setMaxTradeAmount(Double maxTradeAmount) {
        this.maxTradeAmount = maxTradeAmount;
    }

    public boolean isAutoExecute() {
        return autoExecute;
    }

    public void setAutoExecute(boolean autoExecute) {
        this.autoExecute = autoExecute;
    }
}
