package com.financial.riskagent.service;

import com.financial.riskagent.model.*;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class RiskManagerService {

    private static final String RISK_SERVICE_URL = "http://localhost:5003/api/v1/analyze-risk";

    private final RestTemplate restTemplate;

    public RiskManagerService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(15000);
        this.restTemplate = new RestTemplate(factory);
    }

    public RiskReport analyzeRisk(
            String ticker,
            UserProfile userProfile,
            SentimentResponse sentimentReport,
            TechnicalReport technicalReport,
            FundamentalReport fundamentalReport) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build agent_reports nested map
            Map<String, Object> agentReports = new HashMap<>();
            agentReports.put("sentiment_report", sentimentReport);
            agentReports.put("technical_report", technicalReport);
            agentReports.put("fundamental_report", fundamentalReport);

            // Build top-level request body
            Map<String, Object> body = new HashMap<>();
            body.put("ticker", ticker);
            body.put("user_profile", userProfile);
            body.put("agent_reports", agentReports);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<RiskReport> response = restTemplate.postForEntity(
                    RISK_SERVICE_URL,
                    request,
                    RiskReport.class);

            return response.getBody();

        } catch (Exception e) {
            System.err.println("Risk manager error: " + e.getMessage());
            return RiskReport.nullReport(ticker, e.getMessage());
        }
    }

    public boolean isServiceHealthy() {
        try {
            restTemplate.getForEntity("http://localhost:5003/health", String.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
