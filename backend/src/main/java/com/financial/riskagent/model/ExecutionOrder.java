package com.financial.riskagent.model;

import java.time.LocalDateTime;
import java.util.UUID;

/**
 * Execution Order Model
 * Represents a trade order in the execution system
 */
public class ExecutionOrder {

    public enum OrderType {
        BUY, SELL
    }

    public enum OrderStatus {
        PENDING,
        EXECUTING,
        EXECUTED,
        CANCELLED,
        FAILED
    }

    private String orderId;
    private String symbol;
    private OrderType orderType;
    private int quantity;
    private double price;
    private OrderStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime executedAt;
    private Double executedPrice;
    private Integer executedQuantity;
    private String failureReason;
    private String userId;

    // Constructor
    public ExecutionOrder() {
        this.orderId = UUID.randomUUID().toString();
        this.createdAt = LocalDateTime.now();
        this.status = OrderStatus.PENDING;
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private ExecutionOrder order = new ExecutionOrder();

        public Builder symbol(String symbol) {
            order.symbol = symbol;
            return this;
        }

        public Builder orderType(OrderType orderType) {
            order.orderType = orderType;
            return this;
        }

        public Builder quantity(int quantity) {
            order.quantity = quantity;
            return this;
        }

        public Builder price(double price) {
            order.price = price;
            return this;
        }

        public Builder userId(String userId) {
            order.userId = userId;
            return this;
        }

        public ExecutionOrder build() {
            return order;
        }
    }

    // Getters and Setters
    public String getOrderId() {
        return orderId;
    }

    public void setOrderId(String orderId) {
        this.orderId = orderId;
    }

    public String getSymbol() {
        return symbol;
    }

    public void setSymbol(String symbol) {
        this.symbol = symbol;
    }

    public OrderType getOrderType() {
        return orderType;
    }

    public void setOrderType(OrderType orderType) {
        this.orderType = orderType;
    }

    public int getQuantity() {
        return quantity;
    }

    public void setQuantity(int quantity) {
        this.quantity = quantity;
    }

    public double getPrice() {
        return price;
    }

    public void setPrice(double price) {
        this.price = price;
    }

    public OrderStatus getStatus() {
        return status;
    }

    public void setStatus(OrderStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getExecutedAt() {
        return executedAt;
    }

    public void setExecutedAt(LocalDateTime executedAt) {
        this.executedAt = executedAt;
    }

    public Double getExecutedPrice() {
        return executedPrice;
    }

    public void setExecutedPrice(Double executedPrice) {
        this.executedPrice = executedPrice;
    }

    public Integer getExecutedQuantity() {
        return executedQuantity;
    }

    public void setExecutedQuantity(Integer executedQuantity) {
        this.executedQuantity = executedQuantity;
    }

    public String getFailureReason() {
        return failureReason;
    }

    public void setFailureReason(String failureReason) {
        this.failureReason = failureReason;
    }

    public String getUserId() {
        return userId;
    }

    public void setUserId(String userId) {
        this.userId = userId;
    }

    public double getTotalValue() {
        if (executedPrice != null && executedQuantity != null) {
            return executedPrice * executedQuantity;
        }
        return price * quantity;
    }
}
