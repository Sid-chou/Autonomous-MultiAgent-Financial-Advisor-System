package com.financial.riskagent.service;

import com.financial.riskagent.model.FundamentalReport;
import com.financial.riskagent.model.PortfolioReport;
import com.financial.riskagent.model.SentimentResponse;
import com.financial.riskagent.model.TechnicalReport;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class PortfolioService {

    private static final String PORTFOLIO_SERVICE_URL = "http://localhost:5004/api/v1/analyze-portfolio";

    private final RestTemplate restTemplate;

    public PortfolioService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(factory);
    }

    public PortfolioReport analyzePortfolio(
            String ticker,
            SentimentResponse sentimentReport,
            TechnicalReport technicalReport,
            FundamentalReport fundamentalReport) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, Object> body = new HashMap<>();
            body.put("ticker", ticker);
            body.put("sentiment_report", sentimentReport);
            body.put("technical_report", technicalReport);
            body.put("fundamental_report", fundamentalReport);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<PortfolioReport> response = restTemplate.postForEntity(
                    PORTFOLIO_SERVICE_URL,
                    request,
                    PortfolioReport.class);

            return response.getBody();

        } catch (Exception e) {
            System.err.println("Portfolio manager error: " + e.getMessage());
            return PortfolioReport.nullReport(ticker, e.getMessage());
        }
    }

    public boolean isServiceHealthy() {
        try {
            restTemplate.getForEntity("http://localhost:5004/health", String.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
