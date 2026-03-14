package com.financial.riskagent.service;

import com.financial.riskagent.model.*;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class UserLiaisonService {

    private static final String LIAISON_SERVICE_URL = "http://localhost:5005/api/v1/analyze-liaison";

    /**
     * Ticker suffix → human-readable company name.
     * Used to populate "company_name" in the request to User Liaison.
     */
    private static final Map<String, String> TICKER_TO_COMPANY = Map.of(
            "INFY.NS",      "Infosys",
            "TCS.NS",       "Tata Consultancy Services",
            "RELIANCE.NS",  "Reliance Industries",
            "HDFCBANK.NS",  "HDFC Bank",
            "WIPRO.NS",     "Wipro",
            "ICICIBANK.NS", "ICICI Bank",
            "SBIN.NS",      "State Bank of India",
            "ITC.NS",       "ITC Limited",
            "BHARTIARTL.NS","Bharti Airtel",
            "KOTAKBANK.NS", "Kotak Mahindra Bank"
    );

    private final RestTemplate restTemplate;

    public UserLiaisonService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);   // 5 seconds
        factory.setReadTimeout(30000);     // 30 seconds (Groq can be slow)
        this.restTemplate = new RestTemplate(factory);
    }

    /**
     * Calls User Liaison (Port 5005) with all agent reports + user profile.
     * Never throws — returns a null-safe LiaisonReport on any failure.
     */
    public LiaisonReport analyzeLiaison(
            String ticker,
            UserProfile userProfile,
            SentimentResponse sentimentReport,
            TechnicalReport technicalReport,
            FundamentalReport fundamentalReport,
            PortfolioReport portfolioReport,
            RiskReport riskReport) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            // Build user_profile subset (liaison only needs budget + risk level)
            Map<String, Object> userProfileMap = new HashMap<>();
            userProfileMap.put("total_budget", userProfile.getTotalBudget());
            userProfileMap.put("risk_level", userProfile.getRiskLevel());

            // Build top-level request body
            Map<String, Object> body = new HashMap<>();
            body.put("ticker", ticker);
            body.put("company_name", resolveCompanyName(ticker));
            body.put("current_price", null);
            body.put("sentiment_report", sentimentReport);
            body.put("technical_report", technicalReport);
            body.put("fundamental_report", fundamentalReport);
            body.put("portfolio_report", portfolioReport);
            body.put("risk_report", riskReport);
            body.put("user_profile", userProfileMap);

            HttpEntity<Map<String, Object>> request = new HttpEntity<>(body, headers);

            ResponseEntity<LiaisonReport> response = restTemplate.postForEntity(
                    LIAISON_SERVICE_URL,
                    request,
                    LiaisonReport.class);

            return response.getBody();

        } catch (Exception e) {
            System.err.println("User Liaison error: " + e.getMessage());
            // Preserve the portfolio decision even if liaison fails
            String fallbackAction = (portfolioReport != null)
                    ? portfolioReport.getDecision()
                    : null;
            return LiaisonReport.nullReport(ticker, fallbackAction, e.getMessage());
        }
    }

    /**
     * Resolves a ticker string to a human-readable company name.
     * Falls back to the ticker itself if not found in the map.
     */
    private String resolveCompanyName(String ticker) {
        return TICKER_TO_COMPANY.getOrDefault(ticker, ticker);
    }

    public boolean isServiceHealthy() {
        try {
            restTemplate.getForEntity("http://localhost:5005/health", String.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
