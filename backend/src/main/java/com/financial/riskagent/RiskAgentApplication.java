package com.financial.riskagent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

@SpringBootApplication
public class RiskAgentApplication {
    public static void main(String[] args) {
        SpringApplication.run(RiskAgentApplication.class, args);
        System.out.println("\n🚀 Risk Agent Backend is running on http://localhost:8080");
        System.out.println("📊 API Endpoints:");
        System.out.println("   POST /api/risk/analyze - Analyze portfolio risk");
        System.out.println("   GET  /api/risk/health  - Health check\n");
    }
}
