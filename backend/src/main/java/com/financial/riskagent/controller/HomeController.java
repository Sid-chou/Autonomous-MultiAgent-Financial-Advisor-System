package com.financial.riskagent.controller;

import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RestController;

import java.util.HashMap;
import java.util.Map;

@RestController
public class HomeController {

    @GetMapping("/")
    public Map<String, Object> home() {
        Map<String, Object> response = new HashMap<>();
        response.put("message", "🤖 Risk Assessment Agent API");
        response.put("status", "RUNNING");
        response.put("version", "1.0.0");
        response.put("description", "Autonomous Multi-Agent Financial Advisor System");

        Map<String, String> endpoints = new HashMap<>();
        endpoints.put("Health Check", "GET  /api/risk/health");
        endpoints.put("Risk Analysis", "POST /api/risk/analyze");
        endpoints.put("Frontend", "http://localhost:3000");

        response.put("endpoints", endpoints);
        response.put("documentation", "See README.md for usage instructions");

        return response;
    }
}
