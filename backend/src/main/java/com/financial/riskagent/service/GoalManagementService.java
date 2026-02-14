package com.financial.riskagent.service;

import com.financial.riskagent.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.temporal.ChronoUnit;
import java.util.*;
import java.util.concurrent.atomic.AtomicLong;
import java.util.stream.Collectors;

/**
 * Goal Management Service
 * CRUD operations and business logic for financial goals
 */
@Service
public class GoalManagementService {

    @Autowired
    private SIPCalculatorService sipCalculator;

    @Autowired
    private AssetAllocationService allocationService;

    // In-memory storage (replace with database in production)
    private final Map<Long, FinancialGoal> goals = new HashMap<>();
    private final AtomicLong idCounter = new AtomicLong(1);

    /**
     * Create a new financial goal
     */
    public FinancialGoal createGoal(FinancialGoal goal) {
        goal.setId(idCounter.getAndIncrement());
        goal.setCreatedAt(LocalDateTime.now());
        goal.setUpdatedAt(LocalDateTime.now());
        goal.setStatus(FinancialGoal.GoalStatus.ACTIVE);

        if (goal.getCurrentProgress() == null) {
            goal.setCurrentProgress(0.0);
        }

        goals.put(goal.getId(), goal);
        return goal;
    }

    /**
     * Get all financial goals
     */
    public List<FinancialGoal> getAllGoals() {
        return new ArrayList<>(goals.values());
    }

    /**
     * Get active goals only
     */
    public List<FinancialGoal> getActiveGoals() {
        return goals.values().stream()
                .filter(g -> g.getStatus() == FinancialGoal.GoalStatus.ACTIVE)
                .collect(Collectors.toList());
    }

    /**
     * Get goal by ID
     */
    public FinancialGoal getGoalById(Long id) {
        return goals.get(id);
    }

    /**
     * Update goal
     */
    public FinancialGoal updateGoal(Long id, FinancialGoal updatedGoal) {
        FinancialGoal existing = goals.get(id);
        if (existing == null) {
            return null;
        }

        // Update fields
        existing.setName(updatedGoal.getName());
        existing.setType(updatedGoal.getType());
        existing.setTargetAmount(updatedGoal.getTargetAmount());
        existing.setTargetDate(updatedGoal.getTargetDate());
        existing.setPriority(updatedGoal.getPriority());
        existing.setDescription(updatedGoal.getDescription());
        existing.setUpdatedAt(LocalDateTime.now());

        if (updatedGoal.getCurrentProgress() != null) {
            existing.setCurrentProgress(updatedGoal.getCurrentProgress());
        }

        if (updatedGoal.getStatus() != null) {
            existing.setStatus(updatedGoal.getStatus());
        }

        return existing;
    }

    /**
     * Delete goal
     */
    public boolean deleteGoal(Long id) {
        return goals.remove(id) != null;
    }

    /**
     * Calculate investment plan for a goal
     */
    public InvestmentPlan calculateInvestmentPlan(Long goalId, String riskTolerance) {
        FinancialGoal goal = goals.get(goalId);
        if (goal == null) {
            return null;
        }

        // Calculate years to goal
        int yearsToGoal = (int) ChronoUnit.YEARS.between(LocalDate.now(), goal.getTargetDate());
        if (yearsToGoal < 1) {
            yearsToGoal = 1;
        }

        // Get expected return
        double expectedReturn = sipCalculator.getExpectedReturn(riskTolerance, yearsToGoal);

        // Calculate SIP
        SIPCalculation sip = sipCalculator.calculateSIP(
                goal.getTargetAmount(),
                yearsToGoal,
                expectedReturn,
                goal.getCurrentProgress());

        // Determine asset allocation
        AssetAllocation allocation = allocationService.determineAllocation(riskTolerance, yearsToGoal);

        return InvestmentPlan.builder()
                .goalId(goalId)
                .monthlyInvestment(sip.getMonthlyInvestment())
                .initialInvestment(goal.getCurrentProgress())
                .expectedReturn(expectedReturn)
                .assetAllocation(allocation)
                .riskLevel(riskTolerance)
                .inflationAdjusted(true)
                .inflationRate(6.0)
                .yearsToGoal(yearsToGoal)
                .build();
    }

    /**
     * Track progress for a goal
     */
    public GoalProgress trackProgress(Long goalId) {
        FinancialGoal goal = goals.get(goalId);
        if (goal == null) {
            return null;
        }

        double currentValue = goal.getCurrentProgress();
        double targetValue = goal.getTargetAmount();
        double progressPercentage = (currentValue / targetValue) * 100;

        // Calculate if on track
        int daysElapsed = (int) ChronoUnit.DAYS.between(goal.getCreatedAt().toLocalDate(), LocalDate.now());
        int totalDays = (int) ChronoUnit.DAYS.between(goal.getCreatedAt().toLocalDate(), goal.getTargetDate());
        double expectedProgress = (double) daysElapsed / totalDays * targetValue;
        boolean onTrack = currentValue >= expectedProgress * 0.9; // 10% margin

        // Calculate required monthly investment
        int yearsRemaining = (int) ChronoUnit.YEARS.between(LocalDate.now(), goal.getTargetDate());
        if (yearsRemaining < 1)
            yearsRemaining = 1;

        SIPCalculation sip = sipCalculator.calculateSIP(
                targetValue,
                yearsRemaining,
                sipCalculator.getExpectedReturn("moderate", yearsRemaining),
                currentValue);

        return GoalProgress.builder()
                .goalId(goalId)
                .currentValue(currentValue)
                .targetValue(targetValue)
                .progressPercentage(progressPercentage)
                .onTrack(onTrack)
                .requiredMonthlyInvestment(sip.getMonthlyInvestment())
                .lastUpdated(LocalDate.now())
                .daysToGoal((int) ChronoUnit.DAYS.between(LocalDate.now(), goal.getTargetDate()))
                .build();
    }

    /**
     * Update goal progress
     */
    public FinancialGoal updateProgress(Long goalId, Double newProgress) {
        FinancialGoal goal = goals.get(goalId);
        if (goal == null) {
            return null;
        }

        goal.setCurrentProgress(newProgress);
        goal.setUpdatedAt(LocalDateTime.now());

        // Check if goal completed
        if (newProgress >= goal.getTargetAmount()) {
            goal.setStatus(FinancialGoal.GoalStatus.COMPLETED);
        }

        return goal;
    }

    /**
     * Get goals by priority
     */
    public List<FinancialGoal> getGoalsByPriority(FinancialGoal.GoalPriority priority) {
        return goals.values().stream()
                .filter(g -> g.getPriority() == priority)
                .filter(g -> g.getStatus() == FinancialGoal.GoalStatus.ACTIVE)
                .collect(Collectors.toList());
    }

    /**
     * Get goals by type
     */
    public List<FinancialGoal> getGoalsByType(FinancialGoal.GoalType type) {
        return goals.values().stream()
                .filter(g -> g.getType() == type)
                .filter(g -> g.getStatus() == FinancialGoal.GoalStatus.ACTIVE)
                .collect(Collectors.toList());
    }

    /**
     * Clear all goals (for testing)
     */
    public void clearAll() {
        goals.clear();
        idCounter.set(1);
    }
}
