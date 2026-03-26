# Fine-Tuned Autonomous Multi-Model Financial Advisor

A hierarchical multi-agent AI system for grounded, risk-aware stock recommendations on Indian markets. Six specialized agents — sentiment, technical, fundamental, risk, portfolio, and liaison — operate in a structured pipeline coordinated by a Spring Boot backend.

---

## Architecture

```
Layer 0   Data Sources
          News API | Price API (Yahoo Finance) | Vector DB | User Profile JSON

Layer 1   Parallel Agents
          Sentiment Analyst (Port 5000)
          Technical Analyst (Port 5001)
          Fundamental Analyst (Port 5002)

Layer 2   Safety Gate
          Risk Manager (Port 5003) — deterministic Python rule engine

Layer 3   Decision Engine
          Portfolio Manager (Port 5004) — regime-aware weighted formula
          Decision_Score = (w1 x Sentiment) + (w2 x Technical) + (w3 x Fundamental)

Layer 4   Communication
          User Liaison (Port 5005) — confidence-calibrated natural language output

Orchestration
          Spring Boot (Port 8080) — calls Layer 1 agents in parallel via CompletableFuture
          React Frontend — user interface
```

Weights w1, w2, w3 shift dynamically based on the `regime_flag` emitted by the Technical Analyst:

| Regime | Trigger | w1 Sentiment | w2 Technical | w3 Fundamental |
|---|---|---|---|---|
| 0 — Stable | ATR z-score below 1.0 | 0.40 | 0.30 | 0.30 |
| 1 — Bearish | ATR z-score between 1.0 and 2.0 | 0.25 | 0.50 | 0.25 |
| 2 — Panic | ATR z-score above 2.0 or 5% single-session drop | 0.10 | 0.80 | 0.10 |

---

## Installation

### Requirements

- Python 3.11
- Java 17
- Node.js 18+
- Maven 3.8+

### Python Services

```bash
cd sentiment-service
pip install -r requirements.txt

cd technical-agent
pip install -r requirements.txt
```

### Spring Boot Backend

```bash
cd spring-boot-backend
mvn clean install
```

### React Frontend

```bash
cd frontend
npm install
```

---

## Usage

Start each service in a separate terminal in this order:

```bash
# Terminal 1
cd sentiment-service && python app.py

# Terminal 2
cd technical-agent && python app.py

# Terminal 3
cd spring-boot-backend && mvn spring-boot:run

# Terminal 4
cd frontend && npm start
```

Run a combined analysis:

```bash
curl -X POST http://localhost:8080/api/v1/analyze \
  -H "Content-Type: application/json" \
  -d '{"ticker": "INFY.NS"}'
```

---

## Configuration

### Sentiment Service — `sentiment-service/config.py`

```python
PORT = 5000
MAX_NEWS_ARTICLES = 20
NEWS_WEIGHT = 0.7
SOCIAL_WEIGHT = 0.3
BULLISH_THRESHOLD = 0.55
BEARISH_THRESHOLD = 0.45
```

### Ticker Mappings

Add NSE-listed tickers in `config.py` under `TICKER_MAPPINGS`:

```python
TICKER_MAPPINGS = {
    "INFY": "Infosys",
    "TCS": "Tata Consultancy Services",
    "RELIANCE": "Reliance Industries"
}
```
activate the virtual environment .venv\Scripts\Activate.ps1

All tickers must use the `.NS` suffix when calling the API (e.g. `INFY.NS`).

---

## Dependencies

### Python

| Package | Version | Purpose |
|---|---|---|
| transformers | 4.40.0 | FinBERT model loading |
| torch | 2.1.0 | Model inference |
| flask | 3.0.0 | HTTP service |
| pandas-ta | 0.3.14b | Technical indicators |
| yfinance | 0.2.36 | Price data |
| langchain | latest | RAG pipeline |
| faiss-cpu | latest | Vector similarity search |
| feedparser | latest | RSS news collection |

### Java

| Dependency | Purpose |
|---|---|
| Spring Boot 3.x | Backend orchestration |
| spring-web | RestTemplate HTTP client |
| httpclient | Timeout configuration |
| lombok | DTO boilerplate |
| jackson | JSON serialization |

---

## API Reference

| Method | Endpoint | Service | Description |
|---|---|---|---|
| POST | `/api/v1/analyze` | Spring Boot :8080 | Combined parallel analysis |
| POST | `/api/v1/analyze-sentiment` | Flask :5000 | Sentiment only |
| POST | `/api/v1/analyze-technical` | Flask :5001 | Technical only |
| GET | `/health` | Flask :5000 / :5001 | Service health check |

---

## Contributing

1. Fork the repository
2. Create a feature branch — `git checkout -b feature/your-feature`
3. Keep each agent self-contained — do not introduce cross-agent imports
4. Do not change the inter-agent JSON contract without updating all downstream agents
5. Submit a pull request with a clear description of changes

---

## License

Academic project. Not licensed for commercial use.

This system is for demonstration purposes only and does not constitute financial advice.
