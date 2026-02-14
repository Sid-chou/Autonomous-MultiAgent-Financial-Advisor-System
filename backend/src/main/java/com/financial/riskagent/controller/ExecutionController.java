package com.financial.riskagent.controller;

import com.financial.riskagent.model.*;
import com.financial.riskagent.service.ExecutionAgentService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Execution Controller
 * REST API endpoints for trade execution operations
 */
@RestController
@RequestMapping("/api/execution")
@CrossOrigin(origins = "*")
public class ExecutionController {

    @Autowired
    private ExecutionAgentService executionAgent;

    /**
     * Health check endpoint
     */
    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> health() {
        Map<String, Object> response = new HashMap<>();
        response.put("status", "UP");
        response.put("service", "execution-agent");
        response.put("version", "1.0.0");
        response.putAll(executionAgent.getExecutionStats());
        return ResponseEntity.ok(response);
    }

    /**
     * Create a new trade order
     */
    @PostMapping("/orders")
    public ResponseEntity<ExecutionOrder> createOrder(@RequestBody ExecutionOrder order) {
        try {
            ExecutionOrder created = executionAgent.createOrder(order);
            return ResponseEntity.ok(created);
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Invalid order: " + e.getMessage());
            return ResponseEntity.badRequest().build();
        } catch (Exception e) {
            System.err.println("❌ Error creating order: " + e.getMessage());
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get all orders
     */
    @GetMapping("/orders")
    public ResponseEntity<List<ExecutionOrder>> getAllOrders(
            @RequestParam(required = false) String status) {
        try {
            if (status != null && !status.isEmpty()) {
                ExecutionOrder.OrderStatus orderStatus = ExecutionOrder.OrderStatus.valueOf(status.toUpperCase());
                return ResponseEntity.ok(executionAgent.getOrdersByStatus(orderStatus));
            }
            return ResponseEntity.ok(executionAgent.getAllOrders());
        } catch (IllegalArgumentException e) {
            System.err.println("❌ Invalid status: " + status);
            return ResponseEntity.badRequest().build();
        }
    }

    /**
     * Get order by ID
     */
    @GetMapping("/orders/{orderId}")
    public ResponseEntity<ExecutionOrder> getOrder(@PathVariable String orderId) {
        ExecutionOrder order = executionAgent.getOrderById(orderId);
        if (order == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(order);
    }

    /**
     * Execute a specific order
     */
    @PostMapping("/execute/{orderId}")
    public ResponseEntity<ExecutionResult> executeOrder(@PathVariable String orderId) {
        System.out.println("📤 Executing order: " + orderId);
        ExecutionResult result = executionAgent.executeOrder(orderId);

        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Cancel a pending order
     */
    @DeleteMapping("/orders/{orderId}")
    public ResponseEntity<ExecutionResult> cancelOrder(@PathVariable String orderId) {
        System.out.println("🚫 Cancelling order: " + orderId);
        ExecutionResult result = executionAgent.cancelOrder(orderId);

        if (result.isSuccess()) {
            return ResponseEntity.ok(result);
        } else {
            return ResponseEntity.badRequest().body(result);
        }
    }

    /**
     * Execute portfolio rebalancing
     */
    @PostMapping("/rebalance")
    public ResponseEntity<ExecutionResult> executeRebalancing(@RequestBody RebalanceRequest request) {
        System.out.println("🔄 Rebalancing request received");
        try {
            ExecutionResult result = executionAgent.executeRebalancing(request);
            return ResponseEntity.ok(result);
        } catch (Exception e) {
            System.err.println("❌ Rebalancing failed: " + e.getMessage());
            e.printStackTrace();
            return ResponseEntity.internalServerError().build();
        }
    }

    /**
     * Get execution statistics
     */
    @GetMapping("/stats")
    public ResponseEntity<Map<String, Object>> getStats() {
        return ResponseEntity.ok(executionAgent.getExecutionStats());
    }

    /**
     * Clear all orders (demo/testing only)
     */
    @DeleteMapping("/orders")
    public ResponseEntity<Map<String, String>> clearAllOrders() {
        executionAgent.clearAllOrders();
        Map<String, String> response = new HashMap<>();
        response.put("message", "All orders cleared");
        return ResponseEntity.ok(response);
    }
}
