# 🏦 Autonomous Multi-Agent Financial Advisor System

An AI-powered multi-agent system that simulates hedge fund decision-making for Indian stock market analysis. Instead of a single model, it deploys **specialized autonomous agents** — each an expert in one domain — coordinated through a hierarchical pipeline with parallel execution.

---

## 🏗️ System Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                      React Dashboard (Frontend)                     │
│   Portfolio · Risk · Optimization · Market · Sentiment · Execution  │
└───────────────────────────────┬─────────────────────────────────────┘
                                │ REST APIs
┌───────────────────────────────▼─────────────────────────────────────┐
│                 Spring Boot Orchestrator (Port 8080)                 │
│  ┌──────────────┐  ┌───────────────┐  ┌────────────────────────┐   │
│  │  Risk Agent   │  │ Market Agent  │  │ Optimization Agent     │   │
│  │  Alert Agent  │  │ Planning Agent│  │ Execution Agent        │   │
│  └──────────────┘  └───────────────┘  └────────────────────────┘   │
│                                                                     │
│  ┌──────────────────────────────────────────────────────────────┐   │
│  │     Analysis Orchestration Service (CompletableFuture)       │   │
│  │     Fires Sentiment + Technical agents IN PARALLEL           │   │
│  └──────────┬─────────────────────────────┬─────────────────────┘   │
└─────────────┼─────────────────────────────┼─────────────────────────┘
              │                             │
    ┌─────────▼──────────┐       ┌──────────▼──────────┐
    │  Sentiment Agent   │       │  Technical Agent     │
    │  Flask (Port 5000) │       │  Flask (Port 5001)   │
    │  FinBERT Fine-Tuned│       │  RSI·MACD·BB·ATR     │
    │  77% Accuracy      │       │  Regime Detection    │
    └────────────────────┘       └──────────────────────┘
```

### Agent Pipeline Flow

| Layer | Component | Role |
|---|---|---|
| **Layer 0** | Data Sources | News RSS feeds, Yahoo Finance OHLCV, User portfolio |
| **Layer 1** | Sentiment + Technical Agents | Run in parallel via `CompletableFuture`, return structured JSON |
| **Layer 2** | Risk Manager | Deterministic rules — blocks trades if limits exceeded |
| **Layer 3** | Portfolio Manager | Weighted scoring: `Score = w1×Sentiment + w2×Technical + w3×Fundamental` |
| **Layer 4** | AI Router (Groq/Gemini) | Generates natural language insights with confidence-calibrated tone |

---

## 🤖 Agents Overview

### Sentiment Analysis Agent ✅ (Completed)
- **Model**: FinBERT fine-tuned on 5,000+ Indian financial headlines — **77% accuracy**
- **Data Sources**: Economic Times, Financial Express, Hindu Business Line, LiveMint (RSS feeds), Reddit (optional)
- **Output**: Sentiment score (−1 to +1), confidence, bullish/bearish/neutral label
- **Fallback**: Ollama fine-tuned model → FinBERT → graceful NULL status
- **Stack**: Flask, HuggingFace Transformers, PyTorch, feedparser, BeautifulSoup

### Technical Analysis Agent ✅ (Completed)
- **Indicators**: RSI (momentum), MACD (trend), Bollinger Bands (range), ATR (volatility)
- **Regime Detection**: ATR z-score based regime classification
  - `Flag 0` — Stable/Bull (ATR below 14-day MA)
  - `Flag 1` — Bearish (ATR 1 SD above mean)
  - `Flag 2` — Panic (ATR 2 SD above mean OR 5% single-session drop)
- **Output**: Technical score (−1 to +1), regime flag, trend signal (BUY/SELL/HOLD)
- **Stack**: Flask, yfinance, pandas, `ta` library (technical analysis)

### Risk Analysis Agent ✅
- AI-powered risk scoring (0–100) with volatility, drawdown, and Sharpe ratio analysis
- Diversification scoring across Indian market sectors
- Configurable risk tolerance: Conservative / Moderate / Aggressive

### Portfolio Optimization Agent ✅
- AI-generated rebalancing recommendations with specific buy/sell trades
- Target allocation vs current allocation gap analysis
- Projected risk reduction calculations

### Market Analysis Agent ✅
- Real-time Indian market monitoring (NSE/BSE)
- Sector performance tracking with leading/lagging sectors
- Market trend and sentiment indicators

### Alert Agent ✅
- Intelligent portfolio alerts with severity levels (INFO → CRITICAL)
- Concentration risk, volatility spikes, and rebalancing triggers
- Real-time feed in dashboard

### Financial Planning Agent ✅
- Goal-based financial planning (retirement, education, home purchase)
- SIP calculator with inflation-adjusted projections
- Retirement planning with corpus estimation

### Execution Agent ✅
- Trade execution simulation with 95% success rate modeling
- Order management (pending, executed, failed)
- Portfolio rebalancing automation with execution statistics

---

## 🛠️ Technology Stack

| Layer | Technology | Purpose |
|---|---|---|
| **Frontend** | React 18, Tailwind CSS, Recharts, MUI, Lucide | SaaS dashboard with visualizations |
| **Backend** | Spring Boot 3 (Java 17), Maven | API orchestration, agent coordination |
| **Sentiment Agent** | Flask, HuggingFace Transformers, PyTorch | FinBERT-based sentiment classification |
| **Technical Agent** | Flask, yfinance, pandas, ta | Price indicators and regime detection |
| **AI Models** | Groq (LLaMA 3.3 70B) + Gemini (fallback) | Natural language insight generation |
| **Market Data** | Alpha Vantage API, Yahoo Finance | Real-time OHLCV and market data |
| **Build Tools** | Maven (backend), npm (frontend), pip (Python agents) | Dependency management |

---

## 🔑 API Keys Setup (REQUIRED)

### 1. Backend Configuration
```bash
cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
```

### 2. Get Your API Keys

| API | Purpose | Get Key |
|---|---|---|
| **Groq** | Primary AI (LLaMA 3.3 70B) | [console.groq.com/keys](https://console.groq.com/keys) |
| **Gemini** | Backup AI | [aistudio.google.com](https://aistudio.google.com/app/apikey) |
| **Alpha Vantage** | Market data | [alphavantage.co](https://www.alphavantage.co/support/#api-key) |

### 3. Update `application.properties`
Replace the placeholder values:
- `YOUR_GROQ_API_KEY_HERE` → your Groq API key
- `YOUR_GEMINI_API_KEY_HERE` → your Gemini API key
- `YOUR_ALPHAVANTAGE_API_KEY_HERE` → your Alpha Vantage API key

> ⚠️ **NEVER commit `application.properties` to Git!** It is already in `.gitignore`.

---

## 🚀 Quick Start

### Prerequisites
- Java 17+ & Maven
- Node.js 18+ & npm
- Python 3.11+

### Start All Services

**Option 1: Using batch scripts (Windows)**
```bash
# Terminal 1 — Spring Boot Backend
start-backend.bat

# Terminal 2 — React Frontend
start-frontend.bat

# Terminal 3 — Sentiment Agent
cd backend/sentiment-service
pip install -r requirements.txt
python app.py

# Terminal 4 — Technical Agent
cd technical-agent
pip install -r requirements.txt
python app.py
```

**Option 2: Manual startup**
```bash
# Terminal 1 — Backend (Port 8080)
cd backend
mvn spring-boot:run

# Terminal 2 — Frontend (Port 3000)
cd frontend
npm install
npm start

# Terminal 3 — Sentiment Agent (Port 5000)
cd backend/sentiment-service
pip install -r requirements.txt
python app.py

# Terminal 4 — Technical Agent (Port 5001)
cd technical-agent
pip install -r requirements.txt
python app.py
```

### Service Ports

| Service | Port | URL |
|---|---|---|
| React Dashboard | 3000 | http://localhost:3000 |
| Spring Boot API | 8080 | http://localhost:8080 |
| Sentiment Agent | 5000 | http://localhost:5000 |
| Technical Agent | 5001 | http://localhost:5001 |

---

## 📊 Dashboard Features

### Modern SaaS Interface
- **Light Theme** — Professional grayish-blue background (#E8ECF4)
- **Collapsible Sidebar** — Dark navy sidebar with smooth animations
- **Royal Blue Accents** — Consistent #4A6CF7 color scheme
- **White Cards** — Clean cards with soft shadows
- **Toast Notifications** — Real-time feedback via react-toastify
- **Responsive Design** — Desktop, tablet, and mobile support
- **Inter Font** — Professional typography

### Panels
- **Risk Panel** — Risk score gauge, volatility metrics, sector breakdown
- **Optimization Panel** — Target vs current allocation, rebalancing trades
- **Market Panel** — Indian market overview, sector performance, trend analysis
- **Sentiment Panel** — AI sentiment analysis results from news and social media
- **Alerts Panel** — Active alerts with severity indicators
- **Planning Panel** — SIP calculator, retirement planning, goal tracker
- **Execution Panel** — Trade simulation, order history, execution statistics

---

## 🔒 Security & Privacy

- **Local Storage Only** — Portfolio data stored in browser localStorage, no external database
- **API Key Protection** — Sensitive keys in `.gitignore`-protected configuration
- **Error Boundaries** — Prevents crashes and data loss
- **Template Configuration** — Safe `.example` files for easy setup

---

## 📂 Project Structure

```
├── backend/                          # Spring Boot 3 Backend
│   ├── src/main/java/.../
│   │   ├── controller/               # 10 REST controllers
│   │   ├── model/                    # 20 DTOs and models
│   │   ├── service/                  # 17 services (agents + AI router)
│   │   └── config/                   # CORS and app configuration
│   ├── sentiment-service/            # Python Sentiment Agent
│   │   ├── app.py                    # Flask server (port 5000)
│   │   ├── config.py                 # Model and API configuration
│   │   ├── models/                   # FinBERT model + analyzers
│   │   ├── collectors/               # News (RSS) + Reddit collectors
│   │   ├── training/                 # Fine-tuning notebooks + datasets
│   │   └── cache/                    # Response caching layer
│   └── pom.xml
├── technical-agent/                  # Python Technical Agent
│   ├── app.py                        # Flask server (port 5001)
│   ├── data_fetcher.py               # Yahoo Finance data retrieval
│   ├── indicators.py                 # RSI, MACD, Bollinger, ATR
│   ├── regime.py                     # ATR z-score regime detection
│   └── requirements.txt
├── frontend/                         # React 18 Dashboard
│   ├── src/
│   │   ├── App.js                    # Main app with routing
│   │   ├── components/               # 11 panel components
│   │   ├── context/                  # React context providers
│   │   └── utils/                    # Utility functions
│   ├── package.json
│   └── tailwind.config.js
├── project.md                        # Product Requirements Document
├── technical.md                      # Technical documentation
├── start-backend.bat                 # Windows backend launcher
├── start-frontend.bat                # Windows frontend launcher
└── README.md
```

---

## 📡 Key API Endpoints

### Spring Boot Backend (Port 8080)

| Method | Endpoint | Description |
|---|---|---|
| `POST` | `/api/risk/analyze` | Full portfolio risk analysis |
| `POST` | `/api/optimization/optimize` | Portfolio optimization recommendations |
| `GET` | `/api/market/analysis` | Indian market overview |
| `POST` | `/api/alerts/check` | Portfolio alert check |
| `POST` | `/api/combined-analysis` | **Parallel** Sentiment + Technical analysis |
| `POST` | `/api/planning/goals` | Financial goal planning |
| `POST` | `/api/execution/execute` | Trade execution simulation |

### Python Agents

| Method | Endpoint | Port | Description |
|---|---|---|---|
| `POST` | `/api/v1/analyze-sentiment` | 5000 | Sentiment analysis for a ticker |
| `GET` | `/health` | 5000 | Sentiment service health check |
| `POST` | `/api/v1/analyze-technical` | 5001 | Technical analysis for a ticker |

---

## 🧪 Testing the Pipeline

```bash
# Test Sentiment Agent directly
curl -X POST http://localhost:5000/api/v1/analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{"ticker": "RELIANCE"}'

# Test Technical Agent directly
curl -X POST http://localhost:5001/api/v1/analyze-technical \
  -H "Content-Type: application/json" \
  -d '{"ticker": "RELIANCE.NS"}'

# Test Combined Analysis (Parallel execution via Spring Boot)
curl -X POST http://localhost:8080/api/combined-analysis \
  -H "Content-Type: application/json" \
  -d '{"ticker": "RELIANCE"}'
```

---

## 🎯 Research Objectives

| Objective | Description | Status |
|---|---|---|
| Sentiment Model | FinBERT fine-tuned on Indian market headlines | ✅ 77% accuracy |
| Regime-Aware Decisions | Dynamic weight switching via ATR Regime Flag | ✅ Implemented |
| Parallel Agent Execution | Sentiment + Technical agents via `CompletableFuture` | ✅ Working |
| Multi-Agent Orchestration | 8 specialized agents coordinated by Spring Boot | ✅ Operational |
| Deterministic Risk Rules | Python rule engine for personal financial limits | ✅ Implemented |

---

## 📝 License

This project is licensed under the MIT License — see the [LICENSE](LICENSE) file for details.
