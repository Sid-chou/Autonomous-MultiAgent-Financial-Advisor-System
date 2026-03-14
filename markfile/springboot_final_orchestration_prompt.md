# Spring Boot Final Orchestration Update — User Liaison
## Fine-Tuned Autonomous Multi-Model Financial Advisor

---

## Context

This prompt adds the final agent — User Liaison (Port 5005) — to the
existing Spring Boot orchestration layer.

The previous orchestration prompt already added:
- Fundamental Analyst (Port 5002) — parallel
- Portfolio Manager (Port 5004) — sequential
- Risk Manager (Port 5003) — sequential

This prompt only adds User Liaison as the last sequential step.
Do NOT touch any other files. Only the files listed below change.

---

## Updated Execution Order

```
Spring Boot receives POST /api/v1/analyze
        ↓
STEP 1 — PARALLEL
    Sentiment (5000) + Technical (5001) + Fundamental (5002)
        ↓
STEP 2 — SEQUENTIAL
    Portfolio Manager (5004)
        ↓
STEP 3 — SEQUENTIAL
    Risk Manager (5003)
        ↓
STEP 4 — SEQUENTIAL  ← NEW
    User Liaison (5005)
        ↓
Return CombinedAnalysisResponse
```

---

## File 1 — CREATE: LiaisonReport.java

Location: `com.financial.riskagent.model`

Maps the JSON response from Port 5005.

Fields:
```java
private String ticker;
private String headline;
private String explanation;
private String action;
private String riskNote;
private String dataQualityNote;
private List<String> warnings;
private String status;
private String error;
```

JSON property mappings:
```
risk_note          → riskNote
data_quality_note  → dataQualityNote
```

Use @Data and @JsonProperty for all snake_case mappings.

---

## File 2 — UPDATE: CombinedAnalysisResponse.java

Add one new field to the existing response:

```java
private LiaisonReport liaisonReport;
```

Keep all existing fields untouched:
- ticker
- sentimentReport
- technicalReport
- fundamentalReport
- portfolioReport
- riskReport
- pipelineStatus
- timestamp

---

## File 3 — CREATE: UserLiaisonService.java

Location: `com.financial.riskagent.service`

Responsibility: HTTP POST to Port 5005, return LiaisonReport.

Endpoint to call:
```
POST http://localhost:5005/api/v1/analyze-liaison
```

Request body to send — build as Map<String, Object>:
```json
{
  "ticker": "INFY.NS",
  "company_name": "Infosys",
  "current_price": null,
  "sentiment_report": { ...SentimentResponse... },
  "technical_report": { ...TechnicalReport... },
  "fundamental_report": { ...FundamentalReport... },
  "portfolio_report": { ...PortfolioReport... },
  "risk_report": { ...RiskReport... },
  "user_profile": {
    "total_budget": userProfile.getTotalBudget(),
    "risk_level": userProfile.getRiskLevel()
  }
}
```

Notes:
- company_name: use a TICKER_TO_COMPANY map defined in this service
  to resolve ticker to company name. Include at minimum:
  INFY → Infosys, TCS → Tata Consultancy Services,
  RELIANCE → Reliance Industries, HDFCBANK → HDFC Bank
- current_price: pass null — Technical Agent handles price data
- user_profile: only send total_budget and risk_level —
  User Liaison only needs these two for plain English output

Timeout configuration:
- Connection timeout: 5 seconds
- Read timeout: 30 seconds (Groq can be slow)

On any exception, return a LiaisonReport with:
```java
headline = "Analysis summary temporarily unavailable."
explanation = "Please review the detailed agent reports above."
action = portfolioReport.getDecision()  // preserve decision even if liaison fails
status = "NULL"
error = exception message
all other fields = null
```

Never throw an exception out of this service.

---

## File 4 — UPDATE: AnalysisOrchestrationService.java

Add User Liaison as Step 4 after Risk Manager.

Add new autowired service:
```java
@Autowired
private UserLiaisonService userLiaisonService;
```

Add Step 4 after Risk Manager call:
```java
// STEP 4 — User Liaison (sequential, last)
LiaisonReport liaisonReport = userLiaisonService.analyzeLiaison(
    ticker,
    userProfile,
    sentimentReport,
    technicalReport,
    fundamentalReport,
    portfolioReport,
    riskReport
);
```

Update determinePipelineStatus to include liaison:
```java
private String determinePipelineStatus(
    SentimentResponse sentiment,
    TechnicalReport technical,
    FundamentalReport fundamental,
    PortfolioReport portfolio,
    RiskReport risk,
    LiaisonReport liaison
) {
    // User Liaison NULL does not count as pipeline failure
    // It is cosmetic — the decision and risk data are still valid
    // Only count the five analytical agents
    long okCount = Stream.of(
        sentiment.getStatus(),
        technical.getStatus(),
        fundamental.getStatus(),
        portfolio.getStatus(),
        risk.getStatus()
    ).filter(s -> "OK".equals(s)).count();

    if (okCount == 5) return "OK";
    if (okCount == 0) return "FAILED";
    return "PARTIAL";
}
```

Update CombinedAnalysisResponse builder to include liaisonReport.

---

## Complete Request Flow After This Update

### Request sent by frontend or Postman:
```
POST http://localhost:8080/api/v1/analyze
Content-Type: application/json

{
  "ticker": "INFY.NS",
  "userProfile": {
    "totalBudget": 100000,
    "cashAvailable": 15000,
    "maxTradeSize": 0.10,
    "dailyLossLimit": 0.05,
    "maxExposurePerStock": 0.15,
    "riskLevel": "moderate",
    "currentDailyLoss": 0.02,
    "currentExposure": {
      "INFY.NS": 0.08
    }
  }
}
```

### Complete response returned:
```json
{
  "ticker": "INFY.NS",
  "sentimentReport": {
    "sentimentScore": 0.0,
    "label": "neutral",
    "confidence": 0.66,
    "status": "OK"
  },
  "technicalReport": {
    "rsi": 21.8,
    "macdSignal": "SELL",
    "regimeFlag": 0,
    "regimeLabel": "STABLE",
    "technicalScore": 0.0,
    "status": "OK"
  },
  "fundamentalReport": {
    "valuationSignal": "UNDERVALUED",
    "peRatio": 18.74,
    "revenueGrowth": 0.0518,
    "profitMargins": 0.1576,
    "fundamentalScore": 0.79,
    "status": "OK"
  },
  "portfolioReport": {
    "decision": "HOLD",
    "decisionScore": 0.237,
    "confidence": 0.55,
    "regimeLabel": "STABLE",
    "reasoning": "Fundamentals attractive but momentum weak.",
    "status": "OK"
  },
  "riskReport": {
    "approved": true,
    "adjustedSize": 0.07,
    "adjustedAmount": 7000.0,
    "blockReason": null,
    "warnings": [],
    "status": "OK"
  },
  "liaisonReport": {
    "headline": "Infosys looks financially healthy — wait for a better entry point before buying.",
    "explanation": "Infosys is currently trading below what analysts consider fair value based on its earnings. However the price trend is still moving downward and recent news has been quiet. Waiting for conditions to stabilize before entering is the safer approach.",
    "action": "HOLD",
    "riskNote": "Based on your profile, your suggested maximum investment is ₹7,000 if you do decide to buy.",
    "dataQualityNote": null,
    "warnings": [],
    "status": "OK"
  },
  "pipelineStatus": "OK",
  "timestamp": "2026-03-11T17:43:06"
}
```

---

## Acceptance Criteria

- [ ] POST /api/v1/analyze calls all six agents
- [ ] User Liaison runs last, after Risk Manager
- [ ] liaisonReport appears in the combined response
- [ ] User Liaison NULL does not change pipelineStatus
- [ ] liaisonReport.action matches portfolioReport.decision
  unless risk_report.approved is false — then action is BLOCKED
- [ ] liaisonReport contains no technical jargon
- [ ] Existing five-agent behavior is unchanged

---

## Services Running — Full Pipeline

Start all six services before testing:

```powershell
# Terminal 1
cd sentiment-service && python app.py        # Port 5000

# Terminal 2
cd technical-agent && python app.py          # Port 5001

# Terminal 3
cd fundamental-agent && python app.py        # Port 5002

# Terminal 4
cd risk-manager && python app.py             # Port 5003

# Terminal 5
cd portfolio-manager && python app.py        # Port 5004

# Terminal 6
cd user-liaison && python app.py             # Port 5005

# Terminal 7
cd spring-boot-backend && mvn spring-boot:run  # Port 8080
```

Then send one request to Port 8080 and verify all six agent reports
appear in the response.

---

*Spring Boot Final Orchestration | Fine-Tuned Autonomous Multi-Model Financial Advisor | v3.0*
