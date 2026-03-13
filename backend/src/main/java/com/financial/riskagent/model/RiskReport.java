package com.financial.riskagent.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.List;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RiskReport {

    private String ticker;

    private Boolean approved;

    @JsonProperty("proposed_trade_size")
    private Double proposedTradeSize;

    @JsonProperty("adjusted_size")
    private Double adjustedSize;

    @JsonProperty("adjusted_amount")
    private Double adjustedAmount;

    @JsonProperty("block_reason")
    private String blockReason;

    private List<String> warnings;

    @JsonProperty("rules_checked")
    private List<String> rulesChecked;

    @JsonProperty("regime_flag")
    private Integer regimeFlag;

    @JsonProperty("risk_level")
    private String riskLevel;

    private String status;

    private String error;

    public static RiskReport nullReport(String ticker, String errorMessage) {
        return RiskReport.builder()
                .ticker(ticker)
                .approved(false)
                .status("NULL")
                .error(errorMessage)
                .build();
    }
}
