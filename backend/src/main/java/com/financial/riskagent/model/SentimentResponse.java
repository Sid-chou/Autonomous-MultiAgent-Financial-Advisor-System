package com.financial.riskagent.model;

import java.util.List;
import java.util.Map;

public class SentimentResponse {
    private String ticker;
    private String companyName;
    private String overallSentiment; // BULLISH, BEARISH, NEUTRAL
    private Double positiveScore;
    private Double negativeScore;
    private Double neutralScore;
    private Double confidenceScore;
    private Integer newsCount;
    private Integer socialCount;
    private Map<String, List<SentimentSource>> sources;
    private String timestamp;
    private String cachedAt;
    private String message;
    private String status;
    private String error;
    private String label;
    private Double sentiment_score;

    // Nested class for individual sources
    public static class SentimentSource {
        private String title;
        private String source;
        private String sentiment;
        private Double score;
        private String url;
        private Integer upvotes;

        // Getters and Setters
        public String getTitle() {
            return title;
        }

        public void setTitle(String title) {
            this.title = title;
        }

        public String getSource() {
            return source;
        }

        public void setSource(String source) {
            this.source = source;
        }

        public String getSentiment() {
            return sentiment;
        }

        public void setSentiment(String sentiment) {
            this.sentiment = sentiment;
        }

        public Double getScore() {
            return score;
        }

        public void setScore(Double score) {
            this.score = score;
        }

        public String getUrl() {
            return url;
        }

        public void setUrl(String url) {
            this.url = url;
        }

        public Integer getUpvotes() {
            return upvotes;
        }

        public void setUpvotes(Integer upvotes) {
            this.upvotes = upvotes;
        }
    }

    // Getters and Setters
    public String getTicker() {
        return ticker;
    }

    public void setTicker(String ticker) {
        this.ticker = ticker;
    }

    public String getCompanyName() {
        return companyName;
    }

    public void setCompanyName(String companyName) {
        this.companyName = companyName;
    }

    public String getOverallSentiment() {
        return overallSentiment;
    }

    public void setOverallSentiment(String overallSentiment) {
        this.overallSentiment = overallSentiment;
    }

    public Double getPositiveScore() {
        return positiveScore;
    }

    public void setPositiveScore(Double positiveScore) {
        this.positiveScore = positiveScore;
    }

    public Double getNegativeScore() {
        return negativeScore;
    }

    public void setNegativeScore(Double negativeScore) {
        this.negativeScore = negativeScore;
    }

    public Double getNeutralScore() {
        return neutralScore;
    }

    public void setNeutralScore(Double neutralScore) {
        this.neutralScore = neutralScore;
    }

    public Double getConfidenceScore() {
        return confidenceScore;
    }

    public void setConfidenceScore(Double confidenceScore) {
        this.confidenceScore = confidenceScore;
    }

    public Integer getNewsCount() {
        return newsCount;
    }

    public void setNewsCount(Integer newsCount) {
        this.newsCount = newsCount;
    }

    public Integer getSocialCount() {
        return socialCount;
    }

    public void setSocialCount(Integer socialCount) {
        this.socialCount = socialCount;
    }

    public Map<String, List<SentimentSource>> getSources() {
        return sources;
    }

    public void setSources(Map<String, List<SentimentSource>> sources) {
        this.sources = sources;
    }

    public String getTimestamp() {
        return timestamp;
    }

    public void setTimestamp(String timestamp) {
        this.timestamp = timestamp;
    }

    public String getCachedAt() {
        return cachedAt;
    }

    public void setCachedAt(String cachedAt) {
        this.cachedAt = cachedAt;
    }

    public String getMessage() {
        return message;
    }

    public void setMessage(String message) {
        this.message = message;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getError() {
        return error;
    }

    public void setError(String error) {
        this.error = error;
    }

    public String getLabel() {
        return label;
    }

    public void setLabel(String label) {
        this.label = label;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("sentiment_score")
    public Double getSentimentScore() {
        return sentiment_score;
    }

    @com.fasterxml.jackson.annotation.JsonProperty("sentiment_score")
    public void setSentimentScore(Double sentiment_score) {
        this.sentiment_score = sentiment_score;
    }
}
