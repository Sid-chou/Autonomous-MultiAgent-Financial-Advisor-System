package com.financial.riskagent.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

import java.util.Map;

@Data
public class UserProfile {

    @JsonProperty("totalBudget")
    private double totalBudget;

    @JsonProperty("cashAvailable")
    private double cashAvailable;

    @JsonProperty("maxTradeSize")
    private double maxTradeSize;

    @JsonProperty("dailyLossLimit")
    private double dailyLossLimit;

    @JsonProperty("maxExposurePerStock")
    private double maxExposurePerStock;

    @JsonProperty("riskLevel")
    private String riskLevel;

    @JsonProperty("currentDailyLoss")
    private double currentDailyLoss;

    @JsonProperty("currentExposure")
    private Map<String, Double> currentExposure;
}
