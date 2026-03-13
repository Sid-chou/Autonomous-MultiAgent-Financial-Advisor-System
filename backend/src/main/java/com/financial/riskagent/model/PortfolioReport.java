package com.financial.riskagent.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.Map;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class PortfolioReport {

    private String ticker;

    private String decision;

    @JsonProperty("decision_score")
    private Double decisionScore;

    private Double confidence;

    @JsonProperty("regime_flag")
    private Integer regimeFlag;

    @JsonProperty("regime_label")
    private String regimeLabel;

    private Map<String, Double> weights;

    private Map<String, Double> contributions;

    private String reasoning;

    @JsonProperty("agent_statuses")
    private Map<String, String> agentStatuses;

    private String status;

    private String error;

    public static PortfolioReport nullReport(String ticker, String errorMessage) {
        return PortfolioReport.builder()
                .ticker(ticker)
                .status("NULL")
                .error(errorMessage)
                .build();
    }
}
