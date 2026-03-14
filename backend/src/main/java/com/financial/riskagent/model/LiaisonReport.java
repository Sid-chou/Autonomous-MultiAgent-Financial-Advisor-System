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
public class LiaisonReport {

    private String ticker;

    private String headline;

    private String explanation;

    private String action;

    @JsonProperty("risk_note")
    private String riskNote;

    @JsonProperty("data_quality_note")
    private String dataQualityNote;

    private List<String> warnings;

    private String status;

    private String error;

    public static LiaisonReport nullReport(String ticker, String action, String errorMessage) {
        return LiaisonReport.builder()
                .ticker(ticker)
                .headline("Analysis summary temporarily unavailable.")
                .explanation("Please review the detailed agent reports above.")
                .action(action)
                .status("NULL")
                .error(errorMessage)
                .build();
    }
}
