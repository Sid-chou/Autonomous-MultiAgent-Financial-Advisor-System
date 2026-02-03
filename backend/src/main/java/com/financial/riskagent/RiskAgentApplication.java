package com.financial.riskagent;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.boot.ApplicationRunner;
import org.springframework.context.annotation.Bean;

@SpringBootApplication
public class RiskAgentApplication {
    public static void main(String[] args) {
        SpringApplication.run(RiskAgentApplication.class, args);
        System.out.println("\n🚀 Risk Agent Backend is running on http://localhost:8080");
        System.out.println("📊 API Endpoints:");
        System.out.println("   POST /api/risk/analyze - Analyze portfolio risk");
        System.out.println("   GET  /api/risk/health  - Health check\n");
    }

    @Bean
    ApplicationRunner debugLogStartup() {
        return args -> {
            try {
                var logPath = java.nio.file.Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log");
                java.nio.file.Files.createDirectories(logPath.getParent());
                String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H0\",\"location\":\"RiskAgentApplication:startup\",\"message\":\"Backend started\",\"timestamp\":" + System.currentTimeMillis() + "}\n";
                java.nio.file.Files.write(logPath, line.getBytes(java.nio.charset.StandardCharsets.UTF_8), java.nio.file.StandardOpenOption.CREATE, java.nio.file.StandardOpenOption.APPEND);
            } catch (Exception e) { System.err.println("Debug log write failed: " + e.getMessage()); }
        };
    }
}
