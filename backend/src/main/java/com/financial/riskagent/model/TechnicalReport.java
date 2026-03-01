package com.financial.riskagent.model;

import com.fasterxml.jackson.annotation.JsonIgnoreProperties;
import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.Data;

@Data
@JsonIgnoreProperties(ignoreUnknown = true)
public class TechnicalReport {

    private String ticker;
    private Double rsi;

    @JsonProperty("macd_signal")
    private String macdSignal;

    @JsonProperty("macd_value")
    private Double macdValue;

    @JsonProperty("macd_histogram")
    private Double macdHistogram;

    @JsonProperty("bollinger_position")
    private String bollingerPosition;

    private Double atr;

    @JsonProperty("atr_zscore")
    private Double atrZscore;

    @JsonProperty("regime_flag")
    private Integer regimeFlag;

    @JsonProperty("regime_label")
    private String regimeLabel;

    private String trend;

    @JsonProperty("technical_score")
    private Double technicalScore;

    private String status;
    private String error;

    // Static factory method for NULL fallback
    public static TechnicalReport nullReport(String ticker, String errorMsg) {
        TechnicalReport report = new TechnicalReport();
        report.setTicker(ticker);
        report.setStatus("NULL");
        report.setError(errorMsg);
        return report;
    }
}
