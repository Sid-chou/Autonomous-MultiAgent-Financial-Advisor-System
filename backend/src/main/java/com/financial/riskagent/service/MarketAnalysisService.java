package com.financial.riskagent.service;

import com.financial.riskagent.model.MarketAnalysisResponse;
import com.financial.riskagent.model.MarketAnalysisResponse.IndexData;
import com.financial.riskagent.model.MarketAnalysisResponse.SectorPerformance;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;

import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.nio.file.StandardOpenOption;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.*;

/**
 * Market Analysis Agent
 * Autonomous agent that monitors Indian market conditions
 * Provides real-time market sentiment and trend analysis
 */
@Service
public class MarketAnalysisService {

    @Autowired
    private AIRouterService aiRouter;

    @org.springframework.beans.factory.annotation.Value("${alphavantage.api.key}")
    private String alphaVantageApiKey;

    @org.springframework.beans.factory.annotation.Value("${alphavantage.api.url}")
    private String alphaVantageApiUrl;

    // Cached market data (refreshed periodically)
    private MarketAnalysisResponse cachedAnalysis;
    private LocalDateTime lastUpdate;

    /**
     * Get current market analysis
     */
    public MarketAnalysisResponse analyzeMarket() {
        // Return cached data if recent (< 15 minutes old)
        if (cachedAnalysis != null && lastUpdate != null) {
            if (LocalDateTime.now().minusMinutes(15).isBefore(lastUpdate)) {
                return cachedAnalysis;
            }
        }

        // Fetch fresh market data
        cachedAnalysis = performMarketAnalysis();
        lastUpdate = LocalDateTime.now();
        return cachedAnalysis;
    }

    /**
     * Perform market analysis (using demo data for free tier)
     */
    private MarketAnalysisResponse performMarketAnalysis() {

        // Get Indian market indices (demo data)
        Map<String, IndexData> indices = fetchIndianMarketIndices();

        // Calculate market volatility
        double volatilityIndex = calculateVolatilityIndex(indices);

        // Determine market trend
        String trend = determineMarketTrend(indices);

        // Analyze sectors
        List<SectorPerformance> sectors = analyzeSectors();

        // Determine sentiment
        String sentiment = determineMarketSentiment(indices, volatilityIndex);

        // Generate AI insight
        String aiPrompt = buildMarketPrompt(indices, trend, volatilityIndex, sentiment);
        String aiInsight = aiRouter.generateInsight(
                aiPrompt,
                AIRouterService.InsightComplexity.MEDIUM);

        return MarketAnalysisResponse.builder()
                .indices(indices)
                .trend(trend)
                .volatilityIndex(volatilityIndex)
                .sentiment(sentiment)
                .sectors(sectors)
                .aiInsight(aiInsight)
                .timestamp(LocalDateTime.now().format(DateTimeFormatter.ISO_LOCAL_DATE_TIME))
                .agentStatus("MARKET_ANALYSIS_COMPLETE")
                .build();
    }

    /**
     * Fetch Indian market indices data from Alpha Vantage API
     */
    private Map<String, IndexData> fetchIndianMarketIndices() {
        Map<String, IndexData> indices = new HashMap<>();

        try {
            // Fetch NIFTY 50 (^NSEI on Yahoo Finance / NSE:NIFTY on Alpha Vantage)
            IndexData nifty = fetchRealTimeIndexData("NIFTY", "^NSEI");
            if (nifty != null) {
                indices.put("NIFTY50", nifty);
            }

            // Fetch BSE SENSEX (^BSESN on Yahoo Finance)
            IndexData sensex = fetchRealTimeIndexData("BSE SENSEX", "^BSESN");
            if (sensex != null) {
                indices.put("SENSEX", sensex);
            }

            // Fetch BANK NIFTY (^NSEBANK on Yahoo Finance)
            IndexData bankNifty = fetchRealTimeIndexData("BANK NIFTY", "^NSEBANK");
            if (bankNifty != null) {
                indices.put("BANKNIFTY", bankNifty);
            }

            // If all fetches failed, use fallback demo data
            if (indices.isEmpty()) {
                System.err.println("All API calls failed, using fallback demo data");
                return getFallbackDemoData();
            }

        } catch (Exception e) {
            System.err.println("Error fetching market data: " + e.getMessage());
            return getFallbackDemoData();
        }

        return indices;
    }

    /**
     * Fetch real-time data for a specific index using Alpha Vantage API
     */
    private IndexData fetchRealTimeIndexData(String indexName, String symbol) {
        try {
            // #region agent log
            try {
                String d = "{\"alphaKeyNull\":" + (alphaVantageApiKey == null) + ",\"alphaKeyEmpty\":"
                        + (alphaVantageApiKey != null && alphaVantageApiKey.isEmpty()) + ",\"alphaKeyLength\":"
                        + (alphaVantageApiKey == null ? 0 : alphaVantageApiKey.length()) + ",\"symbol\":\"" + symbol
                        + "\"}";
                String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H1\",\"hypothesisId2\":\"H5\",\"location\":\"MarketAnalysisService.java:fetchRealTimeIndexData\",\"message\":\"Alpha Vantage fetch entry\",\"data\":"
                        + d + ",\"timestamp\":" + System.currentTimeMillis() + "}\n";
                Files.write(Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log"),
                        line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            } catch (Exception _e) {
            }
            // #endregion
            // Note: Alpha Vantage's free tier doesn't support Indian indices directly
            // We'll use GLOBAL_QUOTE endpoint as a workaround
            // URL-encode the symbol to handle special characters like ^
            String encodedSymbol = java.net.URLEncoder.encode(symbol, StandardCharsets.UTF_8);
            String url = String.format("%s?function=GLOBAL_QUOTE&symbol=%s&apikey=%s",
                    alphaVantageApiUrl, encodedSymbol, alphaVantageApiKey);

            // Make HTTP request
            java.net.http.HttpClient client = java.net.http.HttpClient.newHttpClient();
            java.net.http.HttpRequest request = java.net.http.HttpRequest.newBuilder()
                    .uri(java.net.URI.create(url))
                    .GET()
                    .build();

            java.net.http.HttpResponse<String> response = client.send(request,
                    java.net.http.HttpResponse.BodyHandlers.ofString());

            // #region agent log
            try {
                int code = response.statusCode();
                String bodyPreview = response.body().length() > 150
                        ? response.body().substring(0, 150).replace("\\", "\\\\").replace("\"", "'").replace("\n", " ")
                        : response.body().replace("\\", "\\\\").replace("\"", "'").replace("\n", " ");
                String line = "{\"sessionId\":\"debug-session\",\"hypothesisId\":\"H5\",\"location\":\"MarketAnalysisService.java:alphaResponse\",\"message\":\"Alpha Vantage response\",\"data\":{\"statusCode\":"
                        + code + ",\"bodyPreview\":\"" + bodyPreview + "\"},\"timestamp\":" + System.currentTimeMillis()
                        + "}\n";
                Files.write(Paths.get(System.getProperty("user.dir")).resolve("target").resolve("debug.log"),
                        line.getBytes(StandardCharsets.UTF_8), StandardOpenOption.CREATE, StandardOpenOption.APPEND);
            } catch (Exception _e) {
            }
            // #endregion

            // Parse JSON response
            com.google.gson.JsonObject jsonResponse = com.google.gson.JsonParser
                    .parseString(response.body()).getAsJsonObject();

            if (jsonResponse.has("Global Quote")) {
                com.google.gson.JsonObject quote = jsonResponse.getAsJsonObject("Global Quote");

                if (quote.has("05. price") && quote.has("10. change percent")) {
                    double price = Double.parseDouble(quote.get("05. price").getAsString());
                    String changePercentStr = quote.get("10. change percent").getAsString()
                            .replace("%", "");
                    double changePercent = Double.parseDouble(changePercentStr);

                    String direction = changePercent > 0.1 ? "UP" : changePercent < -0.1 ? "DOWN" : "FLAT";

                    return IndexData.builder()
                            .name(indexName)
                            .currentValue(price)
                            .changePercent(changePercent)
                            .direction(direction)
                            .build();
                }
            }

            System.err.println("Invalid response for " + indexName + ": " + response.body());
            return null;

        } catch (Exception e) {
            System.err.println("Error fetching " + indexName + ": " + e.getMessage());
            return null;
        }
    }

    /**
     * Fallback demo data when API calls fail
     */
    private Map<String, IndexData> getFallbackDemoData() {
        Map<String, IndexData> indices = new HashMap<>();
        Random random = new Random();

        // NIFTY 50 - using realistic current ranges
        double niftyBase = 24700 + (random.nextDouble() * 200);
        double niftyChange = -1.5 + (random.nextDouble() * 3);
        indices.put("NIFTY50", IndexData.builder()
                .name("NIFTY 50")
                .currentValue(niftyBase)
                .changePercent(niftyChange)
                .direction(niftyChange > 0.1 ? "UP" : niftyChange < -0.1 ? "DOWN" : "FLAT")
                .build());

        // SENSEX - using realistic current ranges
        double sensexBase = 80500 + (random.nextDouble() * 500);
        double sensexChange = -1.5 + (random.nextDouble() * 3);
        indices.put("SENSEX", IndexData.builder()
                .name("BSE SENSEX")
                .currentValue(sensexBase)
                .changePercent(sensexChange)
                .direction(sensexChange > 0.1 ? "UP" : sensexChange < -0.1 ? "DOWN" : "FLAT")
                .build());

        // BANK NIFTY - using realistic current ranges
        double bankNiftyBase = 58300 + (random.nextDouble() * 300);
        double bankNiftyChange = -2.0 + (random.nextDouble() * 4);
        indices.put("BANKNIFTY", IndexData.builder()
                .name("BANK NIFTY")
                .currentValue(bankNiftyBase)
                .changePercent(bankNiftyChange)
                .direction(bankNiftyChange > 0.1 ? "UP" : bankNiftyChange < -0.1 ? "DOWN" : "FLAT")
                .build());

        return indices;
    }

    /**
     * Calculate market volatility index
     */
    private double calculateVolatilityIndex(Map<String, IndexData> indices) {
        // Calculate average absolute change
        double totalChange = indices.values().stream()
                .mapToDouble(idx -> Math.abs(idx.getChangePercent()))
                .average()
                .orElse(0);

        return totalChange * 10; // Scale to VIX-like index
    }

    /**
     * Determine overall market trend
     */
    private String determineMarketTrend(Map<String, IndexData> indices) {
        double avgChange = indices.values().stream()
                .mapToDouble(IndexData::getChangePercent)
                .average()
                .orElse(0);

        if (avgChange > 0.5)
            return "BULLISH";
        if (avgChange < -0.5)
            return "BEARISH";
        return "NEUTRAL";
    }

    /**
     * Analyze sector performance (demo data)
     */
    private List<SectorPerformance> analyzeSectors() {
        List<SectorPerformance> sectors = new ArrayList<>();
        Random random = new Random();

        String[] sectorNames = { "IT", "Banking", "Auto", "Pharma", "FMCG", "Energy" };

        for (String sector : sectorNames) {
            double performance = -2.0 + (random.nextDouble() * 4);
            String status;

            if (performance > 1.0)
                status = "LEADING";
            else if (performance < -1.0)
                status = "LAGGING";
            else
                status = "NEUTRAL";

            sectors.add(SectorPerformance.builder()
                    .sector(sector)
                    .performance(performance)
                    .status(status)
                    .build());
        }

        return sectors;
    }

    /**
     * Determine market sentiment
     */
    private String determineMarketSentiment(Map<String, IndexData> indices, double volatilityIndex) {
        long positiveIndices = indices.values().stream()
                .filter(idx -> idx.getChangePercent() > 0)
                .count();

        long totalIndices = indices.size();

        if (positiveIndices == totalIndices && volatilityIndex < 15) {
            return "POSITIVE";
        } else if (positiveIndices == 0 && volatilityIndex > 20) {
            return "NEGATIVE";
        } else {
            return "MIXED";
        }
    }

    /**
     * Build AI prompt for market insight
     */
    private String buildMarketPrompt(
            Map<String, IndexData> indices,
            String trend,
            double volatilityIndex,
            String sentiment) {
        IndexData nifty = indices.get("NIFTY50");
        IndexData sensex = indices.get("SENSEX");

        return String.format(
                "Indian market analysis: NIFTY 50 at %.2f (%+.2f%%), SENSEX at %.2f (%+.2f%%). " +
                        "Trend is %s, volatility index at %.1f. Market sentiment is %s. " +
                        "Provide brief (2-3 sentences) insight on what this means for Indian retail investors.",
                nifty.getCurrentValue(),
                nifty.getChangePercent(),
                sensex.getCurrentValue(),
                sensex.getChangePercent(),
                trend,
                volatilityIndex,
                sentiment);
    }

    /**
     * Force refresh market data
     */
    public MarketAnalysisResponse refresh() {
        cachedAnalysis = null;
        return analyzeMarket();
    }
}
