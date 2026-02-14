package com.financial.riskagent.model;

import java.time.LocalDate;

/**
 * Goal Progress Model
 * Tracks progress towards a financial goal
 */
public class GoalProgress {
    private Long goalId;
    private Double currentValue;
    private Double targetValue;
    private Double progressPercentage;
    private Boolean onTrack;
    private Double requiredMonthlyInvestment;
    private Double actualMonthlyInvestment;
    private LocalDate lastUpdated;
    private Integer daysToGoal;

    public static Builder builder() {
        return new Builder();
    }

    public static class Builder {
        private GoalProgress progress = new GoalProgress();

        public Builder goalId(Long goalId) {
            progress.goalId = goalId;
            return this;
        }

        public Builder currentValue(Double currentValue) {
            progress.currentValue = currentValue;
            return this;
        }

        public Builder targetValue(Double targetValue) {
            progress.targetValue = targetValue;
            return this;
        }

        public Builder progressPercentage(Double progressPercentage) {
            progress.progressPercentage = progressPercentage;
            return this;
        }

        public Builder onTrack(Boolean onTrack) {
            progress.onTrack = onTrack;
            return this;
        }

        public Builder requiredMonthlyInvestment(Double requiredMonthlyInvestment) {
            progress.requiredMonthlyInvestment = requiredMonthlyInvestment;
            return this;
        }

        public Builder actualMonthlyInvestment(Double actualMonthlyInvestment) {
            progress.actualMonthlyInvestment = actualMonthlyInvestment;
            return this;
        }

        public Builder lastUpdated(LocalDate lastUpdated) {
            progress.lastUpdated = lastUpdated;
            return this;
        }

        public Builder daysToGoal(Integer daysToGoal) {
            progress.daysToGoal = daysToGoal;
            return this;
        }

        public GoalProgress build() {
            return progress;
        }
    }

    // Getters and Setters
    public Long getGoalId() {
        return goalId;
    }

    public void setGoalId(Long goalId) {
        this.goalId = goalId;
    }

    public Double getCurrentValue() {
        return currentValue;
    }

    public void setCurrentValue(Double currentValue) {
        this.currentValue = currentValue;
    }

    public Double getTargetValue() {
        return targetValue;
    }

    public void setTargetValue(Double targetValue) {
        this.targetValue = targetValue;
    }

    public Double getProgressPercentage() {
        return progressPercentage;
    }

    public void setProgressPercentage(Double progressPercentage) {
        this.progressPercentage = progressPercentage;
    }

    public Boolean getOnTrack() {
        return onTrack;
    }

    public void setOnTrack(Boolean onTrack) {
        this.onTrack = onTrack;
    }

    public Double getRequiredMonthlyInvestment() {
        return requiredMonthlyInvestment;
    }

    public void setRequiredMonthlyInvestment(Double requiredMonthlyInvestment) {
        this.requiredMonthlyInvestment = requiredMonthlyInvestment;
    }

    public Double getActualMonthlyInvestment() {
        return actualMonthlyInvestment;
    }

    public void setActualMonthlyInvestment(Double actualMonthlyInvestment) {
        this.actualMonthlyInvestment = actualMonthlyInvestment;
    }

    public LocalDate getLastUpdated() {
        return lastUpdated;
    }

    public void setLastUpdated(LocalDate lastUpdated) {
        this.lastUpdated = lastUpdated;
    }

    public Integer getDaysToGoal() {
        return daysToGoal;
    }

    public void setDaysToGoal(Integer daysToGoal) {
        this.daysToGoal = daysToGoal;
    }
}
