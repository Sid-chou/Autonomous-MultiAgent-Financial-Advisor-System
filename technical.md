# Technical Analyst Agent — Build Prompt
## Fine-Tuned Autonomous Multi-Model Financial Advisor

---

## Context

This is one agent in a 6-agent financial advisor pipeline. The overall system has:
- A Spring Boot backend (Port 8080) acting as orchestrator
- Multiple Python ML agents running as separate Flask services
- The Sentiment Analyst is already built and running on Port 5000

The Technical Analyst is the second Python agent. It follows the exact same Flask service pattern as the Sentiment Analyst.

---

## Your Job

Build a standalone Python Flask service that:
1. Accepts a stock ticker symbol
2. Fetches OHLCV price data
3. Computes technical indicators
4. Calculates and emits a `regime_flag`
5. Returns a structured JSON response

This service will be called by Spring Boot via HTTP POST, exactly like the Sentiment Analyst.

---

## Service Specification

### Endpoint
```
POST /api/v1/analyze-technical
Port: 5001
```

### Request Body
```json
{
  "ticker": "INFY.NS"
}
```

### Response Body — Success
```json
{
  "ticker": "INFY.NS",
  "rsi": 58.4,
  "macd_signal": "BUY",
  "macd_value": 12.3,
  "macd_histogram": 4.1,
  "bollinger_position": "MIDDLE",
  "atr": 45.2,
  "atr_zscore": 0.4,
  "regime_flag": 0,
  "regime_label": "STABLE",
  "trend": "BULLISH",
  "technical_score": 0.65,
  "status": "OK",
  "error": null
}
```

### Response Body — Failure
```json
{
  "ticker": "INFY.NS",
  "rsi": null,
  "macd_signal": null,
  "macd_value": null,
  "macd_histogram": null,
  "bollinger_position": null,
  "atr": null,
  "atr_zscore": null,
  "regime_flag": null,
  "regime_label": null,
  "trend": null,
  "technical_score": null,
  "status": "NULL",
  "error": "Price API timeout"
}
```

---

## Indicators to Compute

### 1. RSI — Relative Strength Index
- Period: 14
- Library: `ta` (pandas-ta) or `ta-lib`
- Interpretation:
  - RSI > 70 → Overbought → signal: SELL
  - RSI < 30 → Oversold → signal: BUY
  - 30–70 → Neutral → signal: HOLD

### 2. MACD — Moving Average Convergence Divergence
- Fast period: 12, Slow period: 26, Signal period: 9
- Compute: MACD line, Signal line, Histogram
- Interpretation:
  - MACD line crosses above signal line → BUY
  - MACD line crosses below signal line → SELL
  - No crossover → HOLD

### 3. Bollinger Bands
- Period: 20, Standard deviation: 2
- Compute upper band, middle band, lower band
- Interpretation:
  - Price near upper band → OVERBOUGHT
  - Price near lower band → OVERSOLD
  - Price near middle → MIDDLE

### 4. ATR — Average True Range
- Period: 14
- This is the most critical indicator in this agent
- Used to compute the `regime_flag`

---

## Regime Flag — Most Important Output

The `regime_flag` is what the Portfolio Manager uses to select its weight set. It must be computed correctly.

### How to compute it

**Step 1** — Compute ATR for the last 14 days using the standard ATR formula

**Step 2** — Compute the 14-day rolling mean of ATR

**Step 3** — Compute the 14-day rolling standard deviation of ATR

**Step 4** — Compute ATR z-score:
```
atr_zscore = (current_ATR - mean_ATR) / std_ATR
```

**Step 5** — Assign regime_flag based on z-score AND price drop check:
```python
# Check for single session 5% drop
latest_close = df['Close'].iloc[-1]
prev_close = df['Close'].iloc[-2]
session_drop = (prev_close - latest_close) / prev_close

if session_drop >= 0.05 or atr_zscore >= 2.0:
    regime_flag = 2   # PANIC
    regime_label = "PANIC"
elif atr_zscore >= 1.0:
    regime_flag = 1   # BEARISH
    regime_label = "BEARISH"
else:
    regime_flag = 0   # STABLE
    regime_label = "STABLE"
```

---

## Technical Score

Compute a single `technical_score` between -1.0 and 1.0 that summarises all signals. The Portfolio Manager uses this as the `Technical` input in its formula.

```python
score = 0.0

# RSI contribution
if rsi < 30:
    score += 0.4     # strong buy signal
elif rsi > 70:
    score -= 0.4     # strong sell signal
else:
    score += (50 - rsi) / 50 * 0.2   # mild signal

# MACD contribution
if macd_signal == "BUY":
    score += 0.4
elif macd_signal == "SELL":
    score -= 0.4

# Bollinger contribution
if bollinger_position == "OVERSOLD":
    score += 0.2
elif bollinger_position == "OVERBOUGHT":
    score -= 0.2

# Clamp to [-1, 1]
technical_score = max(-1.0, min(1.0, score))
```

---

## Data Fetching

Use `yfinance` to fetch OHLCV data.

```python
import yfinance as yf

def fetch_price_data(ticker: str, period: str = "3mo"):
    try:
        df = yf.download(ticker, period=period, auto_adjust=True)
        if df.empty:
            raise ValueError("No data returned")
        return df
    except Exception as e:
        raise RuntimeError(f"Price fetch failed: {str(e)}")
```

- Use `.NS` suffix for NSE Indian stocks (e.g., `INFY.NS`, `TCS.NS`)
- Fetch at least 3 months of data to have enough rows for all indicator periods
- If fetch fails or returns empty → catch the exception and return NULL status response

---

## Failure Handling

Wrap the entire computation in a try/except. If anything fails — API timeout, empty data, computation error — return the NULL response, never crash the service.

```python
try:
    # all computation here
    return success_response
except Exception as e:
    return null_response(ticker, str(e))
```

Specific cases to handle:
- `yfinance` returns empty dataframe → return NULL
- Ticker not found → return NULL
- Any indicator computation fails → return NULL
- Request timeout (set a 10 second timeout on yfinance fetch) → return NULL

---

## File Structure

```
/technical-agent
  app.py              ← Flask app, route definition
  indicators.py       ← all indicator computation functions
  regime.py           ← regime_flag computation logic
  data_fetcher.py     ← yfinance wrapper with error handling
  requirements.txt
```

---

## Requirements.txt

```
flask==3.0.0
yfinance==0.2.36
pandas==2.1.4
numpy==1.26.2
pandas-ta==0.3.14b
requests==2.31.0
```

> Note: Use `pandas-ta` instead of `TA-Lib` to avoid the C dependency installation complexity. `pandas-ta` is pure Python and pip installable with no system dependencies.

---


## How Spring Boot Will Call This

Spring Boot will send:
```
POST http://localhost:5001/api/v1/analyze-technical
Content-Type: application/json
Body: { "ticker": "INFY.NS" }
```

And expect back the JSON response defined above. Make sure Flask returns `Content-Type: application/json` and proper HTTP status codes:
- 200 for both OK and NULL responses (NULL is a valid handled state, not an error)
- 500 only if Flask itself crashes (should never happen with proper try/except)

---

## What NOT to Build

- No authentication or API keys needed on this service
- No database — stateless, compute on every request
- No caching — fresh data on every call
- No frontend
- No connection to other Python agents — this service only talks to Spring Boot

---

## Acceptance Criteria

The agent is complete when:
- [ ] `POST /api/v1/analyze-technical` with `{"ticker": "INFY.NS"}` returns a valid JSON response
- [ ] RSI, MACD, Bollinger, ATR values are present and numerically correct
- [ ] `regime_flag` is 0, 1, or 2 based on ATR z-score logic
- [ ] `technical_score` is between -1.0 and 1.0
- [ ] Invalid ticker returns `status: NULL` without crashing
- [ ] API timeout returns `status: NULL` without crashing
- [ ] Service runs on Port 5001

---

*Technical Analyst Agent | Fine-Tuned Autonomous Multi-Model Financial Advisor | v1.0*