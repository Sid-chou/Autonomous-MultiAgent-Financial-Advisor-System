package com.financial.riskagent.controller;

import com.financial.riskagent.model.*;
import com.financial.riskagent.service.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Planning Controller
 * REST API endpoints for financial planning operations
 */
@RestController
@RequestMapping("/api/planning")
@CrossOrigin(origins = "*")
public class PlanningController {

    @Autowired
    private GoalManagementService goalService;

    @Autowired
    private SIPCalculatorService sipCalculator;

    @Autowired
    private RetirementPlanningService retirementPlanner;

    @Autowired
    private AIFinancialPlannerService aiPlanner;

    // ==================== Goal Management ====================

    @PostMapping("/goals")
    public ResponseEntity<FinancialGoal> createGoal(@RequestBody FinancialGoal goal) {
        FinancialGoal created = goalService.createGoal(goal);
        return ResponseEntity.ok(created);
    }

    @GetMapping("/goals")
    public ResponseEntity<List<FinancialGoal>> getAllGoals() {
        return ResponseEntity.ok(goalService.getAllGoals());
    }

    @GetMapping("/goals/{id}")
    public ResponseEntity<FinancialGoal> getGoal(@PathVariable Long id) {
        FinancialGoal goal = goalService.getGoalById(id);
        if (goal == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(goal);
    }

    @PutMapping("/goals/{id}")
    public ResponseEntity<FinancialGoal> updateGoal(@PathVariable Long id, @RequestBody FinancialGoal goal) {
        FinancialGoal updated = goalService.updateGoal(id, goal);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(updated);
    }

    @DeleteMapping("/goals/{id}")
    public ResponseEntity<Void> deleteGoal(@PathVariable Long id) {
        boolean deleted = goalService.deleteGoal(id);
        if (!deleted) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok().build();
    }

    // ==================== Investment Planning ====================

    @GetMapping("/goals/{id}/plan")
    public ResponseEntity<Map<String, Object>> getInvestmentPlan(
            @PathVariable Long id,
            @RequestParam(defaultValue = "moderate") String riskTolerance) {
        FinancialGoal goal = goalService.getGoalById(id);
        if (goal == null) {
            return ResponseEntity.notFound().build();
        }

        InvestmentPlan plan = goalService.calculateInvestmentPlan(id, riskTolerance);
        String aiStrategy = aiPlanner.generateGoalStrategy(goal, plan);

        Map<String, Object> response = new HashMap<>();
        response.put("goal", goal);
        response.put("plan", plan);
        response.put("aiStrategy", aiStrategy);

        return ResponseEntity.ok(response);
    }

    // ==================== Progress Tracking ====================

    @GetMapping("/goals/{id}/progress")
    public ResponseEntity<GoalProgress> getProgress(@PathVariable Long id) {
        GoalProgress progress = goalService.trackProgress(id);
        if (progress == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(progress);
    }

    @PutMapping("/goals/{id}/progress")
    public ResponseEntity<FinancialGoal> updateProgress(
            @PathVariable Long id,
            @RequestBody Map<String, Double> request) {
        Double newProgress = request.get("currentProgress");
        if (newProgress == null) {
            return ResponseEntity.badRequest().build();
        }

        FinancialGoal updated = goalService.updateProgress(id, newProgress);
        if (updated == null) {
            return ResponseEntity.notFound().build();
        }

        return ResponseEntity.ok(updated);
    }

    // ==================== SIP Calculator ====================

    @PostMapping("/calculate-sip")
    public ResponseEntity<SIPCalculation> calculateSIP(@RequestBody Map<String, Object> request) {
        try {
            Double targetAmount = ((Number) request.get("targetAmount")).doubleValue();
            Integer years = ((Number) request.get("years")).intValue();
            Double expectedReturn = ((Number) request.get("expectedReturn")).doubleValue();
            Double currentSavings = request.containsKey("currentSavings")
                    ? ((Number) request.get("currentSavings")).doubleValue()
                    : 0.0;

            SIPCalculation result = sipCalculator.calculateSIP(
                    targetAmount,
                    years,
                    expectedReturn,
                    currentSavings);

            return ResponseEntity.ok(result);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== Retirement Planning ====================

    @PostMapping("/retirement-plan")
    public ResponseEntity<Map<String, Object>> calculateRetirement(@RequestBody Map<String, Object> request) {
        try {
            Integer currentAge = ((Number) request.get("currentAge")).intValue();
            Integer retirementAge = ((Number) request.get("retirementAge")).intValue();
            Double monthlyExpenses = ((Number) request.get("monthlyExpenses")).doubleValue();
            Double currentSavings = ((Number) request.get("currentSavings")).doubleValue();
            String riskTolerance = (String) request.getOrDefault("riskTolerance", "moderate");

            RetirementPlan plan = retirementPlanner.calculateRetirement(
                    currentAge,
                    retirementAge,
                    monthlyExpenses,
                    currentSavings,
                    riskTolerance);

            String aiInsight = aiPlanner.generateRetirementInsight(plan);
            plan.setAiInsight(aiInsight);

            Map<String, Object> response = new HashMap<>();
            response.put("plan", plan);
            response.put("aiInsight", aiInsight);

            return ResponseEntity.ok(response);
        } catch (Exception e) {
            return ResponseEntity.badRequest().build();
        }
    }

    // ==================== Comprehensive Plan ====================

    @GetMapping("/comprehensive-plan")
    public ResponseEntity<Map<String, Object>> getComprehensivePlan(
            @RequestParam(required = false, defaultValue = "50000") Double monthlyIncome) {
        List<FinancialGoal> activeGoals = goalService.getActiveGoals();
        String comprehensivePlan = aiPlanner.generateComprehensivePlan(activeGoals, monthlyIncome);

        // Calculate total monthly investment needed
        double totalMonthlyInvestment = 0.0;
        for (FinancialGoal goal : activeGoals) {
            InvestmentPlan plan = goalService.calculateInvestmentPlan(goal.getId(), "moderate");
            if (plan != null) {
                totalMonthlyInvestment += plan.getMonthlyInvestment();
            }
        }

        Map<String, Object> response = new HashMap<>();
        response.put("goals", activeGoals);
        response.put("totalMonthlyInvestment", totalMonthlyInvestment);
        response.put("comprehensivePlan", comprehensivePlan);
        response.put("monthlyIncome", monthlyIncome);
        response.put("investmentToIncomeRatio", (totalMonthlyInvestment / monthlyIncome) * 100);

        return ResponseEntity.ok(response);
    }

    // ==================== Health Check ====================

    @GetMapping("/health")
    public ResponseEntity<Map<String, Object>> healthCheck() {
        Map<String, Object> health = new HashMap<>();
        health.put("status", "UP");
        health.put("service", "planning-agent");
        health.put("goalsCount", goalService.getAllGoals().size());
        return ResponseEntity.ok(health);
    }
}
