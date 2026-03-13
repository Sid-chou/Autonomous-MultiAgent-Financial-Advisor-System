package com.financial.riskagent.model;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class FundamentalReport {

    private String ticker;

    @JsonProperty("valuation_signal")
    private String valuationSignal;

    @JsonProperty("pe_ratio")
    private Double peRatio;

    @JsonProperty("revenue_growth")
    private Double revenueGrowth;

    @JsonProperty("profit_margins")
    private Double profitMargins;

    @JsonProperty("debt_to_equity")
    private Double debtToEquity;

    @JsonProperty("fundamental_score")
    private Double fundamentalScore;

    private Double confidence;

    private String reasoning;

    @JsonProperty("data_source")
    private String dataSource;

    private String status;

    private String error;

    public static FundamentalReport nullReport(String ticker, String errorMessage) {
        return FundamentalReport.builder()
                .ticker(ticker)
                .status("NULL")
                .error(errorMessage)
                .build();
    }
}
