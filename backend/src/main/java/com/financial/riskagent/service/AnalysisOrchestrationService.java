package com.financial.riskagent.service;

import com.financial.riskagent.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;

@Service
public class AnalysisOrchestrationService {

    @Autowired
    private SentimentService sentimentService;

    @Autowired
    private TechnicalService technicalService;

    public CombinedAnalysisResponse analyze(String ticker) {

        // Fire both agents at the SAME TIME
        CompletableFuture<SentimentResponse> sentimentFuture = CompletableFuture
                .supplyAsync(() -> sentimentService.analyzeSentiment(ticker));

        CompletableFuture<TechnicalReport> technicalFuture = CompletableFuture
                .supplyAsync(() -> technicalService.analyzeTechnical(ticker));

        // Wait for BOTH to complete
        CompletableFuture.allOf(sentimentFuture, technicalFuture).join();

        // Collect results
        SentimentResponse sentimentReport = sentimentFuture.join();
        TechnicalReport technicalReport = technicalFuture.join();

        // Determine pipeline status
        String pipelineStatus = determinePipelineStatus(sentimentReport, technicalReport);

        return CombinedAnalysisResponse.builder()
                .ticker(ticker)
                .sentimentReport(sentimentReport)
                .technicalReport(technicalReport)
                .pipelineStatus(pipelineStatus)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    private String determinePipelineStatus(SentimentResponse sentiment, TechnicalReport technical) {
        boolean sentimentOk = sentiment != null && "OK".equals(sentiment.getStatus());
        boolean technicalOk = technical != null && "OK".equals(technical.getStatus());

        if (sentimentOk && technicalOk)
            return "OK";
        if (!sentimentOk && !technicalOk)
            return "FAILED";
        return "PARTIAL";
    }
}
