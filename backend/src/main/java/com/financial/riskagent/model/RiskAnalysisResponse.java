package com.financial.riskagent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;
import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskAnalysisResponse {
    private double totalValue;
    private double totalRisk;
    private double valueAtRisk;
    private double standardDeviation;
    private double diversificationScore;
    private String riskLevel; // LOW, MEDIUM, HIGH
    private String riskScore; // 0-100
    private List<String> recommendations;
    private String aiInsight;
    private String agentStatus;
}
