package com.financial.riskagent.service;

import com.financial.riskagent.model.FundamentalReport;
import org.springframework.http.*;
import org.springframework.http.client.SimpleClientHttpRequestFactory;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class FundamentalService {

    private static final String FUNDAMENTAL_SERVICE_URL = "http://localhost:5002/api/v1/analyze-fundamental";

    private final RestTemplate restTemplate;

    public FundamentalService() {
        SimpleClientHttpRequestFactory factory = new SimpleClientHttpRequestFactory();
        factory.setConnectTimeout(5000);
        factory.setReadTimeout(30000);
        this.restTemplate = new RestTemplate(factory);
    }

    public FundamentalReport analyzeFundamental(String ticker) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("ticker", ticker);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<FundamentalReport> response = restTemplate.postForEntity(
                    FUNDAMENTAL_SERVICE_URL,
                    request,
                    FundamentalReport.class);

            return response.getBody();

        } catch (Exception e) {
            System.err.println("Fundamental agent error: " + e.getMessage());
            return FundamentalReport.nullReport(ticker, e.getMessage());
        }
    }

    public boolean isServiceHealthy() {
        try {
            restTemplate.getForEntity("http://localhost:5002/health", String.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
