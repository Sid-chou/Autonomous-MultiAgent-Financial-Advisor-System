package com.financial.riskagent.service;

import com.financial.riskagent.model.*;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.concurrent.CompletableFuture;
import java.util.stream.Stream;

@Service
public class AnalysisOrchestrationService {

    @Autowired
    private SentimentService sentimentService;

    @Autowired
    private TechnicalService technicalService;

    @Autowired
    private FundamentalService fundamentalService;

    @Autowired
    private PortfolioService portfolioService;

    @Autowired
    private RiskManagerService riskManagerService;

    @Autowired
    private UserLiaisonService userLiaisonService;

    public CombinedAnalysisResponse analyze(String ticker, UserProfile userProfile) {

        // STEP 1 — Fire three agents in parallel
        CompletableFuture<SentimentResponse> sentimentFuture = CompletableFuture
                .supplyAsync(() -> sentimentService.analyzeSentiment(ticker));

        CompletableFuture<TechnicalReport> technicalFuture = CompletableFuture
                .supplyAsync(() -> technicalService.analyzeTechnical(ticker));

        CompletableFuture<FundamentalReport> fundamentalFuture = CompletableFuture
                .supplyAsync(() -> fundamentalService.analyzeFundamental(ticker));

        // Wait for ALL three to complete
        CompletableFuture.allOf(sentimentFuture, technicalFuture, fundamentalFuture).join();

        // STEP 2 — Collect parallel results
        SentimentResponse sentimentReport = sentimentFuture.join();
        TechnicalReport technicalReport = technicalFuture.join();
        FundamentalReport fundamentalReport = fundamentalFuture.join();

        // STEP 3 — Call Portfolio Manager sequentially (needs all three reports)
        PortfolioReport portfolioReport = portfolioService.analyzePortfolio(
                ticker, sentimentReport, technicalReport, fundamentalReport);

        // STEP 4 — Call Risk Manager sequentially (needs all reports + user profile)
        RiskReport riskReport = riskManagerService.analyzeRisk(
                ticker, userProfile, sentimentReport, technicalReport, fundamentalReport);

        // STEP 5 — Call User Liaison sequentially (last — needs ALL reports)
        LiaisonReport liaisonReport = userLiaisonService.analyzeLiaison(
                ticker, userProfile,
                sentimentReport, technicalReport, fundamentalReport,
                portfolioReport, riskReport);

        // STEP 6 — Determine pipeline status across the five analytical agents
        // User Liaison NULL does NOT count as pipeline failure (it is cosmetic)
        String pipelineStatus = determinePipelineStatus(
                sentimentReport, technicalReport, fundamentalReport, portfolioReport, riskReport);

        // STEP 7 — Build and return response
        return CombinedAnalysisResponse.builder()
                .ticker(ticker)
                .sentimentReport(sentimentReport)
                .technicalReport(technicalReport)
                .fundamentalReport(fundamentalReport)
                .portfolioReport(portfolioReport)
                .riskReport(riskReport)
                .liaisonReport(liaisonReport)
                .pipelineStatus(pipelineStatus)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .build();
    }

    private String determinePipelineStatus(
            SentimentResponse sentiment,
            TechnicalReport technical,
            FundamentalReport fundamental,
            PortfolioReport portfolio,
            RiskReport risk) {

        long okCount = Stream.of(
                sentiment != null ? sentiment.getStatus() : null,
                technical != null ? technical.getStatus() : null,
                fundamental != null ? fundamental.getStatus() : null,
                portfolio != null ? portfolio.getStatus() : null,
                risk != null ? risk.getStatus() : null
        ).filter(s -> "OK".equals(s)).count();

        if (okCount == 5) return "OK";
        if (okCount == 0) return "FAILED";
        return "PARTIAL";
    }
}
