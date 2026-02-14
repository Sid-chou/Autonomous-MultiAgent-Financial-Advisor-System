package com.financial.riskagent.model;

import java.util.ArrayList;
import java.util.List;

/**
 * Execution Result Model
 * Response model for trade execution operations
 */
public class ExecutionResult {

    private boolean success;
    private String message;
    private String orderId;
    private List<ExecutionOrder> executedOrders;
    private double totalAmount;
    private String executionSummary;
    private int successCount;
    private int failureCount;

    // Constructor
    public ExecutionResult() {
        this.executedOrders = new ArrayList<>();
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private ExecutionResult result = new ExecutionResult();

        public Builder success(boolean success) {
            result.success = success;
            return this;
        }

        public Builder message(String message) {
            result.message = message;
            return this;
        }

        public Builder orderId(String orderId) {
            result.orderId = orderId;
            return this;
        }

        public Builder executedOrders(List<ExecutionOrder> orders) {
            result.executedOrders = orders;
            return this;
        }

        public Builder totalAmount(double totalAmount) {
            result.totalAmount = totalAmount;
            return this;
        }

        public Builder executionSummary(String summary) {
            result.executionSummary = summary;
            return this;
        }

        public Builder successCount(int count) {
            result.successCount = count;
            return this;
        }

        public Builder failureCount(int count) {
            result.failureCount = count;
            return this;
        }

        public ExecutionResult build() {
            return result;
        }
    }

    // Getters and Setters
    public boolean isSuccess() {
        return success;
    }

    public void setSuccess(boolean success) {
        this.success = success;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public List<ExecutionOrder> getExecutedOrders() {
        return executedOrders;
    }

    public void setExecutedOrders(List<ExecutionOrder> executedOrders) {
        this.executedOrders = executedOrders;
    }

    public double getTotalAmount() {
        return totalAmount;
    }

    public void setTotalAmount(double totalAmount) {
        this.totalAmount = totalAmount;
    }

    public String getExecutionSummary() {
        return executionSummary;
    }

    public void setExecutionSummary(String executionSummary) {
        this.executionSummary = executionSummary;
    }

    public int getSuccessCount() {
        return successCount;
    }

    public void setSuccessCount(int successCount) {
        this.successCount = successCount;
    }

    public int getFailureCount() {
        return failureCount;
    }

    public void setFailureCount(int failureCount) {
        this.failureCount = failureCount;
    }
}
