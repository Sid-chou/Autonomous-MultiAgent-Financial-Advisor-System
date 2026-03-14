package com.financial.riskagent.model;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class CombinedAnalysisResponse {

    private String ticker;
    private SentimentResponse sentimentReport;
    private TechnicalReport technicalReport;
    private FundamentalReport fundamentalReport;
    private PortfolioReport portfolioReport;
    private RiskReport riskReport;
    private LiaisonReport liaisonReport;
    private String pipelineStatus; // OK, PARTIAL, FAILED
    private String timestamp;
}
