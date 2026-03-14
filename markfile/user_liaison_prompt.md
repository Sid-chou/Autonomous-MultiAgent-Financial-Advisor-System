# User Liaison Agent — Build Prompt
## Fine-Tuned Autonomous Multi-Model Financial Advisor

---

## Context

This is the sixth and final Python agent in the pipeline. It runs on Port 5005.

Its only job is to translate the entire system output into plain English
that a first-time Indian retail investor can read and act on immediately.

No data fetching. No calculations. No training.
Input: all five agent reports + user profile.
Output: structured natural language response.

LLM: Groq Llama 3.3 70B — untrained, prompt engineering only.

Spring Boot calls this agent last, after all other agents have completed.

---

## Critical Output Rules

These rules apply to every single response without exception:

1. Never use these words: RSI, MACD, ATR, regime, z-score, CompletableFuture,
   sentiment score, technical score, fundamental score, w1, w2, w3,
   weighted formula, basis points, alpha, beta (financial context)
2. Always lead with the action — HOLD, BUY, or SELL — in the headline
3. Keep explanation under 4 sentences
4. Always use ₹ symbol for currency amounts
5. If data was missing, mention it calmly — never alarmist language
6. Tone: clear, calm, reassuring — like a knowledgeable friend, not a robot

---

## Service Specification

### Endpoint
```
POST /api/v1/analyze-liaison
Port: 5005
```

### Request Body
```json
{
  "ticker": "INFY.NS",
  "company_name": "Infosys",
  "current_price": 1295.6,
  "sentiment_report": {
    "sentiment_score": 0.0,
    "label": "neutral",
    "confidence": 0.66,
    "status": "OK"
  },
  "technical_report": {
    "rsi": 21.8,
    "macd_signal": "SELL",
    "regime_label": "STABLE",
    "technical_score": 0.0,
    "status": "OK"
  },
  "fundamental_report": {
    "valuation_signal": "UNDERVALUED",
    "pe_ratio": 18.74,
    "revenue_growth": 0.0518,
    "profit_margins": 0.1576,
    "fundamental_score": 0.79,
    "status": "OK"
  },
  "portfolio_report": {
    "decision": "HOLD",
    "decision_score": 0.237,
    "confidence": 0.55,
    "regime_label": "STABLE",
    "reasoning": "...",
    "status": "OK"
  },
  "risk_report": {
    "approved": true,
    "adjusted_size": 0.07,
    "adjusted_amount": 7000,
    "block_reason": null,
    "warnings": [],
    "status": "OK"
  },
  "user_profile": {
    "total_budget": 100000,
    "risk_level": "moderate"
  }
}
```

### Response Body — Normal
```json
{
  "ticker": "INFY.NS",
  "headline": "Infosys looks financially healthy — wait for a better entry point before buying.",
  "explanation": "Infosys is currently trading below what analysts consider fair value based on its earnings, which is a positive sign. However the price trend is still moving downward and recent news has been neutral. Waiting for the price to stabilize before entering is the safer approach.",
  "action": "HOLD",
  "risk_note": "Based on your profile, your suggested maximum investment is ₹7,000 if you do decide to buy.",
  "data_quality_note": null,
  "warnings": [],
  "status": "OK",
  "error": null
}
```

### Response Body — Trade Blocked
```json
{
  "ticker": "INFY.NS",
  "headline": "Infosys shows a buying opportunity — but you have reached your loss limit for today.",
  "explanation": "The analysis indicates Infosys may be worth buying at current prices based on its financial health. However your daily loss limit has been reached. Taking any new positions today is not recommended.",
  "action": "BLOCKED",
  "risk_note": "You have reached your daily loss limit of 5%. Consider revisiting this analysis tomorrow.",
  "data_quality_note": null,
  "warnings": ["Daily loss limit reached"],
  "status": "OK",
  "error": null
}
```

### Response Body — Partial Data
```json
{
  "ticker": "INFY.NS",
  "headline": "Infosys analysis completed with limited data — treat this with caution.",
  "explanation": "...",
  "action": "HOLD",
  "risk_note": "...",
  "data_quality_note": "News data was unavailable for this analysis. The recommendation is based on price and financial data only and carries reduced confidence.",
  "warnings": [],
  "status": "OK",
  "error": null
}
```

### Response Body — Complete Failure
```json
{
  "ticker": "INFY.NS",
  "headline": "Analysis could not be completed at this time.",
  "explanation": "Data from our analysis services is currently unavailable. Please try again in a few minutes.",
  "action": null,
  "risk_note": null,
  "data_quality_note": "All analysis services were unavailable.",
  "warnings": [],
  "status": "NULL",
  "error": null
}
```

---

## Edge Cases — Handle All Six

### Edge Case 1 — Risk Manager BLOCKED trade
Condition: `risk_report.approved == false`

Behavior:
- Set action to "BLOCKED" not the portfolio decision
- Headline acknowledges the market signal but leads with the block
- risk_note explains exactly why it was blocked using block_reason
- Do not reference the portfolio decision score or weights

Example headline: "Infosys shows a buying opportunity — but [block reason in plain English]."

---

### Edge Case 2 — PANIC regime
Condition: `technical_report.regime_label == "PANIC"`

Behavior:
- Mention market volatility in plain language — never the word "regime"
- Mention trade size was automatically reduced as a safety measure
- Tone must be calm — not alarming

Example: "Markets are experiencing unusual volatility today. The suggested
investment amount has been reduced to ₹3,500 as a precaution."

---

### Edge Case 3 — One agent NULL
Condition: one of sentiment, technical, or fundamental status is "NULL"

Behavior:
- Set data_quality_note explaining which data was missing
- Mention confidence is reduced
- Do not mention agent names — translate to human terms:
  - sentiment NULL → "News data was unavailable"
  - technical NULL → "Price trend data was unavailable"
  - fundamental NULL → "Financial report data was unavailable"

---

### Edge Case 4 — Conflicting signals
Condition: portfolio_report.decision == "HOLD" with mixed contributions

Behavior:
- Explain the conflict in plain language
- Never say "mixed signals" — too technical
- Say "the positive financial picture is not yet confirmed by recent price movement"

---

### Edge Case 5 — Risk Manager warnings present
Condition: `risk_report.warnings` is non-empty

Behavior:
- Include warnings in plain English in the risk_note
- Map warning strings to human language:
  - "Trade size reduced to match available cash" → "Investment reduced to match your available funds"
  - "PANIC regime detected. Trade size automatically reduced by 50%" → "Investment halved due to market volatility"
  - "Trade size reduced to fit within max exposure limit" → "Investment reduced to keep your holdings balanced"

---

### Edge Case 6 — All agents NULL
Condition: portfolio_report.status == "NULL"

Behavior:
- Return complete failure response immediately
- Do not call Groq — return hardcoded response
- action: null
- No hallucinated analysis

---

## Jargon Translation Reference

Use this table when building the prompt for Groq:

| Technical term | Plain English |
|---|---|
| RSI oversold (below 30) | The stock has fallen more than recent trends justify |
| RSI overbought (above 70) | The stock has risen quickly and may slow down |
| MACD BUY signal | Price momentum is turning upward |
| MACD SELL signal | Price momentum is still moving downward |
| UNDERVALUED | Trading below what its earnings suggest it is worth |
| OVERVALUED | Trading above what its earnings suggest it is worth |
| FAIR | Trading at a reasonable price based on its earnings |
| Positive sentiment | Recent news has been favourable |
| Negative sentiment | Recent news has raised concerns |
| Neutral sentiment | Recent news has been mixed or quiet |
| STABLE regime | Markets are behaving normally |
| BEARISH regime | Markets are under pressure |
| PANIC regime | Markets are experiencing unusual volatility |
| Decision score | Overall signal strength |
| Confidence | How strongly the signals agree |

---

## File Structure

```
/user-liaison
  app.py           ← Flask app, route definition
  translator.py    ← Groq prompt builder and caller
  edge_handler.py  ← handles all six edge cases before calling Groq
  requirements.txt
  .env
```

---

## edge_handler.py — Pre-processing Logic

```python
def detect_edge_cases(data):
    """
    Inspect all reports and return edge case flags.
    Called before building the Groq prompt.
    """
    flags = {
        "is_blocked":        False,
        "is_panic":          False,
        "is_complete_failure": False,
        "null_agents":       [],
        "has_warnings":      False,
        "is_partial":        False,
    }

    portfolio = data.get("portfolio_report", {})
    risk      = data.get("risk_report", {})
    technical = data.get("technical_report", {})
    sentiment = data.get("sentiment_report", {})
    fundamental = data.get("fundamental_report", {})

    # Complete failure
    if portfolio.get("status") == "NULL":
        flags["is_complete_failure"] = True
        return flags

    # Risk blocked
    if risk.get("approved") == False:
        flags["is_blocked"] = True

    # Panic regime
    if technical.get("regime_label") == "PANIC":
        flags["is_panic"] = True

    # NULL agents
    if sentiment.get("status") == "NULL":
        flags["null_agents"].append("news")
    if technical.get("status") == "NULL":
        flags["null_agents"].append("price trend")
    if fundamental.get("status") == "NULL":
        flags["null_agents"].append("financial report")

    flags["is_partial"] = len(flags["null_agents"]) > 0

    # Warnings
    if risk.get("warnings"):
        flags["has_warnings"] = True

    return flags
```

---

## translator.py — Groq Call

```python
import json
import logging
import os

from groq import Groq

logger = logging.getLogger(__name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


def build_prompt(data, flags):
    portfolio   = data.get("portfolio_report", {})
    risk        = data.get("risk_report", {})
    technical   = data.get("technical_report", {})
    fundamental = data.get("fundamental_report", {})
    sentiment   = data.get("sentiment_report", {})
    user_profile = data.get("user_profile", {})

    company     = data.get("company_name", data.get("ticker"))
    decision    = "BLOCKED" if flags["is_blocked"] else portfolio.get("decision")
    adjusted_amount = risk.get("adjusted_amount")
    block_reason = risk.get("block_reason")
    warnings    = risk.get("warnings", [])

    # Translate warning strings to plain English
    translated_warnings = []
    for w in warnings:
        if "available cash" in w.lower():
            translated_warnings.append("Investment reduced to match your available funds.")
        elif "panic" in w.lower():
            translated_warnings.append("Investment halved due to market volatility.")
        elif "exposure" in w.lower():
            translated_warnings.append("Investment reduced to keep your holdings balanced.")
        else:
            translated_warnings.append(w)

    # Build data quality note
    data_quality = None
    if flags["is_partial"]:
        missing = " and ".join(flags["null_agents"])
        data_quality = f"{missing.capitalize()} data was unavailable. Confidence is reduced."

    prompt = f"""
You are a friendly financial assistant for Indian retail investors.
Explain the following stock analysis for {company} in plain English.

DECISION: {decision}
CONFIDENCE: {portfolio.get('confidence', 'N/A')}
MARKET CONDITIONS: {technical.get('regime_label', 'STABLE')}

What the analysis found:
- News and sentiment: {sentiment.get('label', 'N/A')} (confidence: {sentiment.get('confidence', 'N/A')})
- Price trend: RSI is {technical.get('rsi', 'N/A')}, momentum is {technical.get('macd_signal', 'N/A')}
- Financial health: Company is {fundamental.get('valuation_signal', 'N/A')} with PE ratio {fundamental.get('pe_ratio', 'N/A')}
- Revenue growth: {fundamental.get('revenue_growth', 'N/A')}
- Profit margins: {fundamental.get('profit_margins', 'N/A')}

Risk check result:
- Trade approved: {risk.get('approved')}
- Block reason: {block_reason if block_reason else 'None'}
- Suggested investment: ₹{adjusted_amount if adjusted_amount else 'N/A'}
- Warnings: {translated_warnings if translated_warnings else 'None'}

Data quality: {'PARTIAL — ' + str(flags['null_agents']) + ' data missing' if flags['is_partial'] else 'COMPLETE'}

STRICT RULES:
1. Never use these words: RSI, MACD, ATR, regime, z-score, sentiment score,
   technical score, fundamental score, weighted, basis points, beta, alpha
2. Lead the headline with the action word: HOLD, BUY, SELL, or BLOCKED
3. Explanation must be 2 to 3 sentences maximum
4. Use ₹ symbol for all money amounts
5. Tone: calm, clear, helpful — like a knowledgeable friend
6. If trade is BLOCKED — explain why in plain language using block_reason
7. If market conditions are PANIC — mention unusual volatility calmly
8. If data is partial — mention which data was missing in plain language

Return valid JSON only. No markdown. No preamble.

{{
  "headline": "one sentence starting with action",
  "explanation": "2 to 3 sentences in plain English",
  "action": "{decision}",
  "risk_note": "one sentence about investment amount or block reason",
  "warnings": {json.dumps(translated_warnings)}
}}
"""
    return prompt, data_quality


def generate_explanation(data, flags):
    """
    Call Groq to generate plain English explanation.
    Falls back to hardcoded response if Groq fails.
    """
    if flags["is_complete_failure"]:
        return complete_failure_response(data.get("ticker"))

    prompt, data_quality = build_prompt(data, flags)

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a financial assistant. Always respond with valid JSON only. No markdown. No extra text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.3,
            max_tokens=400
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        return {
            "ticker":            data.get("ticker"),
            "headline":          result.get("headline"),
            "explanation":       result.get("explanation"),
            "action":            result.get("action"),
            "risk_note":         result.get("risk_note"),
            "data_quality_note": data_quality,
            "warnings":          result.get("warnings", []),
            "status":            "OK",
            "error":             None
        }

    except Exception as e:
        logger.warning(f"Groq failed for User Liaison: {e}")
        return fallback_response(data, flags)


def fallback_response(data, flags):
    """
    Pure Python fallback when Groq is unavailable.
    Builds a basic but correct response from the data.
    """
    portfolio = data.get("portfolio_report", {})
    risk      = data.get("risk_report", {})
    decision  = "BLOCKED" if not risk.get("approved") else portfolio.get("decision", "HOLD")
    company   = data.get("company_name", data.get("ticker"))
    amount    = risk.get("adjusted_amount")

    headline = f"{company} — {decision} based on current analysis."

    if decision == "BLOCKED":
        explanation = f"The analysis was completed but the trade was blocked. Reason: {risk.get('block_reason', 'Risk limit reached')}."
    elif decision == "BUY":
        explanation = f"{company} shows positive signals across news, price, and financial health. Consider entering a position."
    elif decision == "SELL":
        explanation = f"{company} shows negative signals. Consider reducing or exiting your position."
    else:
        explanation = f"{company} signals are mixed. Holding your current position is recommended until conditions clarify."

    risk_note = f"Suggested maximum investment: ₹{amount}." if amount else None

    return {
        "ticker":            data.get("ticker"),
        "headline":          headline,
        "explanation":       explanation,
        "action":            decision,
        "risk_note":         risk_note,
        "data_quality_note": "Analysis explanation service temporarily unavailable.",
        "warnings":          [],
        "status":            "OK",
        "error":             None
    }


def complete_failure_response(ticker):
    return {
        "ticker":            ticker,
        "headline":          "Analysis could not be completed at this time.",
        "explanation":       "Data from our analysis services is currently unavailable. Please try again in a few minutes.",
        "action":            None,
        "risk_note":         None,
        "data_quality_note": "All analysis services were unavailable.",
        "warnings":          [],
        "status":            "NULL",
        "error":             None
    }
```

---

## app.py — Full Structure

```python
import logging
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from edge_handler import detect_edge_cases
from translator import generate_explanation

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "user-liaison",
        "port": 5005
    })


@app.route('/api/v1/analyze-liaison', methods=['POST'])
def analyze_liaison():
    ticker = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        ticker = data.get("ticker", "").strip()
        if not ticker:
            return jsonify({"error": "ticker is required"}), 400

        logger.info(f"User Liaison processing {ticker}")

        # Detect edge cases before calling Groq
        flags = detect_edge_cases(data)
        logger.info(f"Edge case flags for {ticker}: {flags}")

        # Generate plain English explanation
        result = generate_explanation(data, flags)

        return jsonify(result)

    except Exception as e:
        logger.error(f"User Liaison error for {ticker}: {e}")
        return jsonify({
            "ticker":            ticker,
            "headline":          "Analysis could not be completed at this time.",
            "explanation":       "An unexpected error occurred. Please try again.",
            "action":            None,
            "risk_note":         None,
            "data_quality_note": None,
            "warnings":          [],
            "status":            "NULL",
            "error":             str(e)
        })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5005, debug=True)
```

---

## Requirements.txt

```
flask==3.0.0
flask-cors==4.0.0
groq==0.9.0
httpx==0.27.2
python-dotenv==1.0.0
```

---

## Test via Postman

```
POST http://localhost:5005/api/v1/analyze-liaison
Content-Type: application/json

{
  "ticker": "INFY.NS",
  "company_name": "Infosys",
  "current_price": 1295.6,
  "sentiment_report": {
    "sentiment_score": 0.0,
    "label": "neutral",
    "confidence": 0.66,
    "status": "OK"
  },
  "technical_report": {
    "rsi": 21.8,
    "macd_signal": "SELL",
    "regime_label": "STABLE",
    "technical_score": 0.0,
    "status": "OK"
  },
  "fundamental_report": {
    "valuation_signal": "UNDERVALUED",
    "pe_ratio": 18.74,
    "revenue_growth": 0.0518,
    "profit_margins": 0.1576,
    "fundamental_score": 0.79,
    "status": "OK"
  },
  "portfolio_report": {
    "decision": "HOLD",
    "decision_score": 0.237,
    "confidence": 0.55,
    "regime_label": "STABLE",
    "reasoning": "Fundamentals attractive but momentum weak.",
    "status": "OK"
  },
  "risk_report": {
    "approved": true,
    "adjusted_size": 0.07,
    "adjusted_amount": 7000,
    "block_reason": null,
    "warnings": [],
    "status": "OK"
  },
  "user_profile": {
    "total_budget": 100000,
    "risk_level": "moderate"
  }
}
```

---

## Acceptance Criteria

- [ ] Response contains headline, explanation, action, risk_note
- [ ] No technical jargon in any output field
- [ ] action is BLOCKED when risk_report.approved is false
- [ ] data_quality_note appears when any agent is NULL
- [ ] PANIC regime triggers volatility warning in plain English
- [ ] Groq failure falls back to Python-generated response
- [ ] Complete pipeline failure returns clean message without crashing
- [ ] Service runs on Port 5005
- [ ] /health returns healthy status

---

*User Liaison Agent | Fine-Tuned Autonomous Multi-Model Financial Advisor | v1.0*
