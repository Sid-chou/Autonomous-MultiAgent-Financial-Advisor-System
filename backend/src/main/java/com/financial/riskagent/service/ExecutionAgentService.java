package com.financial.riskagent.service;

import com.financial.riskagent.model.*;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.*;
import java.util.concurrent.ConcurrentHashMap;
import java.util.stream.Collectors;

/**
 * Execution Agent Service
 * Autonomous agent responsible for executing trades and managing orders
 * Simulates trade execution without connecting to real brokers (demo mode)
 */
@Service
public class ExecutionAgentService {

    // In-memory order storage (Thread-safe)
    private final Map<String, ExecutionOrder> orderStore = new ConcurrentHashMap<>();

    // Execution statistics
    private int totalExecuted = 0;
    private int totalFailed = 0;
    private double totalVolume = 0.0;

    /**
     * Create a new trade order
     */
    public ExecutionOrder createOrder(ExecutionOrder order) {
        // Validate order
        validateOrder(order);

        // Store order
        orderStore.put(order.getOrderId(), order);

        System.out.println("📝 Created order: " + order.getOrderId() +
                " | " + order.getOrderType() + " " + order.getQuantity() +
                " " + order.getSymbol() + " @ ₹" + order.getPrice());

        return order;
    }

    /**
     * Execute a pending order
     */
    public ExecutionResult executeOrder(String orderId) {
        ExecutionOrder order = orderStore.get(orderId);

        if (order == null) {
            return ExecutionResult.builder()
                    .success(false)
                    .message("Order not found: " + orderId)
                    .build();
        }

        if (order.getStatus() != ExecutionOrder.OrderStatus.PENDING) {
            return ExecutionResult.builder()
                    .success(false)
                    .message("Order is not in PENDING status. Current status: " + order.getStatus())
                    .orderId(orderId)
                    .build();
        }

        // Update status to EXECUTING
        order.setStatus(ExecutionOrder.OrderStatus.EXECUTING);

        try {
            // Simulate execution delay (500ms - 2000ms)
            Thread.sleep((long) (500 + Math.random() * 1500));

            // Simulate 95% success rate
            boolean executionSuccess = Math.random() < 0.95;

            if (executionSuccess) {
                // Successful execution
                order.setStatus(ExecutionOrder.OrderStatus.EXECUTED);
                order.setExecutedAt(LocalDateTime.now());

                // Simulate slight price variation (±0.5%)
                double priceVariation = 1.0 + (Math.random() * 0.01 - 0.005);
                order.setExecutedPrice(order.getPrice() * priceVariation);
                order.setExecutedQuantity(order.getQuantity());

                // Update statistics
                totalExecuted++;
                totalVolume += order.getTotalValue();

                System.out.println("✅ Executed order: " + orderId +
                        " | " + order.getOrderType() + " " + order.getQuantity() +
                        " " + order.getSymbol() + " @ ₹" + String.format("%.2f", order.getExecutedPrice()));

                return ExecutionResult.builder()
                        .success(true)
                        .message("Order executed successfully")
                        .orderId(orderId)
                        .totalAmount(order.getTotalValue())
                        .executionSummary(String.format("%s %d %s @ ₹%.2f = ₹%.2f",
                                order.getOrderType(),
                                order.getExecutedQuantity(),
                                order.getSymbol(),
                                order.getExecutedPrice(),
                                order.getTotalValue()))
                        .build();

            } else {
                // Failed execution
                order.setStatus(ExecutionOrder.OrderStatus.FAILED);
                order.setFailureReason("Market conditions unfavorable / Insufficient liquidity");
                totalFailed++;

                System.out.println("❌ Failed to execute order: " + orderId + " | " + order.getFailureReason());

                return ExecutionResult.builder()
                        .success(false)
                        .message("Order execution failed: " + order.getFailureReason())
                        .orderId(orderId)
                        .build();
            }

        } catch (InterruptedException e) {
            order.setStatus(ExecutionOrder.OrderStatus.FAILED);
            order.setFailureReason("Execution interrupted");
            Thread.currentThread().interrupt();

            return ExecutionResult.builder()
                    .success(false)
                    .message("Execution interrupted")
                    .orderId(orderId)
                    .build();
        }
    }

    /**
     * Cancel a pending order
     */
    public ExecutionResult cancelOrder(String orderId) {
        ExecutionOrder order = orderStore.get(orderId);

        if (order == null) {
            return ExecutionResult.builder()
                    .success(false)
                    .message("Order not found: " + orderId)
                    .build();
        }

        if (order.getStatus() != ExecutionOrder.OrderStatus.PENDING) {
            return ExecutionResult.builder()
                    .success(false)
                    .message("Only PENDING orders can be cancelled. Current status: " + order.getStatus())
                    .orderId(orderId)
                    .build();
        }

        order.setStatus(ExecutionOrder.OrderStatus.CANCELLED);

        System.out.println("🚫 Cancelled order: " + orderId);

        return ExecutionResult.builder()
                .success(true)
                .message("Order cancelled successfully")
                .orderId(orderId)
                .build();
    }

    /**
     * Get all orders
     */
    public List<ExecutionOrder> getAllOrders() {
        return new ArrayList<>(orderStore.values())
                .stream()
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt())) // Sort by newest first
                .collect(Collectors.toList());
    }

    /**
     * Get orders by status
     */
    public List<ExecutionOrder> getOrdersByStatus(ExecutionOrder.OrderStatus status) {
        return orderStore.values().stream()
                .filter(order -> order.getStatus() == status)
                .sorted((a, b) -> b.getCreatedAt().compareTo(a.getCreatedAt()))
                .collect(Collectors.toList());
    }

    /**
     * Get specific order by ID
     */
    public ExecutionOrder getOrderById(String orderId) {
        return orderStore.get(orderId);
    }

    /**
     * Execute portfolio rebalancing
     * Generates trade orders from optimization recommendations
     */
    public ExecutionResult executeRebalancing(RebalanceRequest request) {
        List<ExecutionOrder> createdOrders = new ArrayList<>();

        // Calculate portfolio total value
        double totalValue = request.getCurrentHoldings().stream()
                .mapToDouble(h -> h.getCurrentPrice() * h.getQuantity())
                .sum();

        System.out.println("🔄 Starting rebalancing for portfolio: ₹" + String.format("%.2f", totalValue));

        // Create orders based on target allocation
        for (Map.Entry<String, Double> entry : request.getTargetAllocation().entrySet()) {
            String symbol = entry.getKey();
            double targetPercentage = entry.getValue();

            // Find current holding
            Optional<Holding> currentHolding = request.getCurrentHoldings().stream()
                    .filter(h -> h.getSymbol().equals(symbol))
                    .findFirst();

            double currentValue = currentHolding.map(h -> h.getCurrentPrice() * h.getQuantity()).orElse(0.0);
            double targetValue = totalValue * (targetPercentage / 100.0);
            double difference = targetValue - currentValue;

            // Only create order if difference is significant (> ₹1000)
            if (Math.abs(difference) > 1000) {
                double currentPrice = currentHolding.map(Holding::getCurrentPrice).orElse(0.0);

                if (currentPrice == 0.0) {
                    System.out.println("⚠️ Cannot create order for " + symbol + ": price not available");
                    continue;
                }

                int quantity = (int) Math.abs(difference / currentPrice);

                if (quantity > 0) {
                    ExecutionOrder order = ExecutionOrder.builder()
                            .symbol(symbol)
                            .orderType(difference > 0 ? ExecutionOrder.OrderType.BUY : ExecutionOrder.OrderType.SELL)
                            .quantity(quantity)
                            .price(currentPrice)
                            .build();

                    createOrder(order);
                    createdOrders.add(order);

                    // Auto-execute if requested
                    if (request.isAutoExecute()) {
                        executeOrder(order.getOrderId());
                    }
                }
            }
        }

        // Build result
        int successCount = (int) createdOrders.stream()
                .filter(o -> o.getStatus() == ExecutionOrder.OrderStatus.EXECUTED)
                .count();

        int failureCount = (int) createdOrders.stream()
                .filter(o -> o.getStatus() == ExecutionOrder.OrderStatus.FAILED)
                .count();

        double totalOrderValue = createdOrders.stream()
                .mapToDouble(ExecutionOrder::getTotalValue)
                .sum();

        String summary = String.format("Created %d orders | %s %d orders | Total: ₹%.2f",
                createdOrders.size(),
                request.isAutoExecute() ? "Executed" : "Pending",
                request.isAutoExecute() ? successCount : createdOrders.size(),
                totalOrderValue);

        System.out.println("✅ " + summary);

        return ExecutionResult.builder()
                .success(true)
                .message("Rebalancing " + (request.isAutoExecute() ? "executed" : "prepared"))
                .executedOrders(createdOrders)
                .totalAmount(totalOrderValue)
                .successCount(successCount)
                .failureCount(failureCount)
                .executionSummary(summary)
                .build();
    }

    /**
     * Validate order parameters
     */
    private void validateOrder(ExecutionOrder order) {
        if (order.getSymbol() == null || order.getSymbol().trim().isEmpty()) {
            throw new IllegalArgumentException("Symbol cannot be empty");
        }

        if (order.getOrderType() == null) {
            throw new IllegalArgumentException("Order type must be specified");
        }

        if (order.getQuantity() <= 0) {
            throw new IllegalArgumentException("Quantity must be greater than 0");
        }

        if (order.getPrice() <= 0) {
            throw new IllegalArgumentException("Price must be greater than 0");
        }
    }

    /**
     * Get execution statistics
     */
    public Map<String, Object> getExecutionStats() {
        int totalOrders = orderStore.size();
        double successRate = totalOrders > 0 ? (double) totalExecuted / totalOrders * 100 : 0;

        Map<String, Object> stats = new HashMap<>();
        stats.put("totalOrders", totalOrders);
        stats.put("totalExecuted", totalExecuted);
        stats.put("totalFailed", totalFailed);
        stats.put("pendingOrders", getOrdersByStatus(ExecutionOrder.OrderStatus.PENDING).size());
        stats.put("successRate", String.format("%.1f%%", successRate));
        stats.put("totalVolume", String.format("₹%.2f", totalVolume));

        return stats;
    }

    /**
     * Clear all orders (for testing/demo purposes)
     */
    public void clearAllOrders() {
        orderStore.clear();
        totalExecuted = 0;
        totalFailed = 0;
        totalVolume = 0.0;
        System.out.println("🗑️ Cleared all orders");
    }
}
