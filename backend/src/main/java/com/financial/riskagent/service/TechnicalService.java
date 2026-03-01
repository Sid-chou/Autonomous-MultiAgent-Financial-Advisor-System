package com.financial.riskagent.service;

import com.financial.riskagent.model.TechnicalReport;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.*;
import org.springframework.stereotype.Service;
import org.springframework.web.client.RestTemplate;

import java.util.HashMap;
import java.util.Map;

@Service
public class TechnicalService {

    private static final String TECHNICAL_SERVICE_URL = "http://localhost:5001/api/v1/analyze-technical";

    @Autowired
    private RestTemplate restTemplate;

    public TechnicalReport analyzeTechnical(String ticker) {
        try {
            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.APPLICATION_JSON);

            Map<String, String> body = new HashMap<>();
            body.put("ticker", ticker);

            HttpEntity<Map<String, String>> request = new HttpEntity<>(body, headers);

            ResponseEntity<TechnicalReport> response = restTemplate.postForEntity(
                    TECHNICAL_SERVICE_URL,
                    request,
                    TechnicalReport.class);

            return response.getBody();

        } catch (Exception e) {
            System.err.println("Technical agent error: " + e.getMessage());
            return TechnicalReport.nullReport(ticker, e.getMessage());
        }
    }

    public boolean isServiceHealthy() {
        try {
            restTemplate.getForEntity(
                    "http://localhost:5001/health",
                    String.class);
            return true;
        } catch (Exception e) {
            return false;
        }
    }
}
