package com.financial.riskagent.model;

import java.time.LocalDate;
import java.time.LocalDateTime;

/**
 * Financial Goal Entity
 * Represents a user's financial goal (e.g., retirement, house, education)
 */
public class FinancialGoal {
    private Long id;
    private String name;
    private GoalType type;
    private Double targetAmount;
    private LocalDate targetDate;
    private GoalPriority priority;
    private Double currentProgress;
    private String description;
    private GoalStatus status;
    private LocalDateTime createdAt;
    private LocalDateTime updatedAt;

    public enum GoalType {
        RETIREMENT,
        HOUSE,
        EDUCATION,
        EMERGENCY_FUND,
        VACATION,
        WEDDING,
        VEHICLE,
        BUSINESS,
        OTHER
    }

    public enum GoalPriority {
        HIGH,
        MEDIUM,
        LOW
    }

    public enum GoalStatus {
        ACTIVE,
        COMPLETED,
        PAUSED,
        CANCELLED
    }

    // Builder pattern
    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private FinancialGoal goal = new FinancialGoal();

        public Builder id(Long id) {
            goal.id = id;
            return this;
        }

        public Builder name(String name) {
            goal.name = name;
            return this;
        }

        public Builder type(GoalType type) {
            goal.type = type;
            return this;
        }

        public Builder targetAmount(Double targetAmount) {
            goal.targetAmount = targetAmount;
            return this;
        }

        public Builder targetDate(LocalDate targetDate) {
            goal.targetDate = targetDate;
            return this;
        }

        public Builder priority(GoalPriority priority) {
            goal.priority = priority;
            return this;
        }

        public Builder currentProgress(Double currentProgress) {
            goal.currentProgress = currentProgress;
            return this;
        }

        public Builder description(String description) {
            goal.description = description;
            return this;
        }

        public Builder status(GoalStatus status) {
            goal.status = status;
            return this;
        }

        public Builder createdAt(LocalDateTime createdAt) {
            goal.createdAt = createdAt;
            return this;
        }

        public Builder updatedAt(LocalDateTime updatedAt) {
            goal.updatedAt = updatedAt;
            return this;
        }

        public FinancialGoal build() {
            return goal;
        }
    }

    // Getters and Setters
    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public GoalType getType() {
        return type;
    }

    public void setType(GoalType type) {
        this.type = type;
    }

    public Double getTargetAmount() {
        return targetAmount;
    }

    public void setTargetAmount(Double targetAmount) {
        this.targetAmount = targetAmount;
    }

    public LocalDate getTargetDate() {
        return targetDate;
    }

    public void setTargetDate(LocalDate targetDate) {
        this.targetDate = targetDate;
    }

    public GoalPriority getPriority() {
        return priority;
    }

    public void setPriority(GoalPriority priority) {
        this.priority = priority;
    }

    public Double getCurrentProgress() {
        return currentProgress;
    }

    public void setCurrentProgress(Double currentProgress) {
        this.currentProgress = currentProgress;
    }

    public String getDescription() {
        return description;
    }

    public void setDescription(String description) {
        this.description = description;
    }

    public GoalStatus getStatus() {
        return status;
    }

    public void setStatus(GoalStatus status) {
        this.status = status;
    }

    public LocalDateTime getCreatedAt() {
        return createdAt;
    }

    public void setCreatedAt(LocalDateTime createdAt) {
        this.createdAt = createdAt;
    }

    public LocalDateTime getUpdatedAt() {
        return updatedAt;
    }

    public void setUpdatedAt(LocalDateTime updatedAt) {
        this.updatedAt = updatedAt;
    }
}
