# 🏦 Autonomous Multi-Agent Financial Advisor System

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Market: NSE](https://img.shields.io/badge/Market-NSE%20(India)-blue)](https://www.nseindia.com/)

An advanced, multi-layered AI system designed to provide hyper-personalized stock analysis for the Indian equity market (NSE). By orchestrating six specialized AI agents, the system simulates a professional trading desk—analyzing sentiment, market technicals, and company fundamentals to deliver data-driven "Buy/Sell/Hold" recommendations within strict risk parameters.

---

## 🚀 Key Features

- **Six Specialized AI Agents**: A hierarchical pipeline where each agent focuses on a specific pillar of financial analysis.
- **NSE Market Coverage**: Full support for Nifty 50 and major Indian stocks with live data fetching.
- **Risk-Aware Decisioning**: Automatically calculates position sizes and validates trades against user-defined risk profiles (Conservative, Moderate, Aggressive).
- **Executive Dashboard**: A premium, glassmorphic UI that visualizes agent signals, market regimes, and final trade recommendations.
- **Explainable AI**: The User Liaison agent breaks down complex signals into human-readable explanations.

---

## 🧠 Agent Architecture

The system follows a strict **Layer 0 to Layer 4** orchestrator pattern, ensuring isolation and reliability:

| Layer | Agent | Function |
| :--- | :--- | :--- |
| **L1** | **Sentiment Analyst** | Scans RSS feeds, news, and social data using FinBERT to gauge market mood. |
| **L1** | **Technical Analyst** | Computes indicators (RSI, MACD, Bollinger Bands) and identifies Market Regimes (Stable, Bearish, Panic). |
| **L1** | **Fundamental Analyst** | Evaluates PE Ratios, profit margins, and revenue growth to determine valuation signals (Under/Overvalued). |
| **L2** | **Portfolio Manager** | Aggregates Layer 1 signals to make an initial strategic decision (BUY/SELL/HOLD). |
| **L3** | **Risk Manager** | Validates decisions against your budget, checking "Max Trade Size" and "Daily Loss Limits." |
| **L4** | **User Liaison** | The "Final Interface" that summarizes the logic into a clear, actionable dashboard report. |

---

## 🛠️ Technology Stack

- **Frontend**: React.js with Tailwind CSS for a high-end, responsive dashboard.
- **Backend Orchestrator**: Spring Boot (Java 17) managing the high-performance agent pipeline.
- **AI Agents**: Micro-services built with Python (Flask), leveraging:
  - `yfinance` & `pandas` for market data.
  - `FinBERT` for specialized financial sentiment analysis.
  - `TA-Lib` for advanced technical indicators.
- **Orchestration**: Direct REST-based communication with hierarchical layering.

---

## 🚦 Getting Started

### Prerequisites
- Java 17+
- Python 3.9+
- Node.js 18+

### Quick Start
1. **Frontend**:
   ```bash
   cd frontend
   npm install
   npm run dev
   ```
2. **Backend**:
   ```bash
   cd backend
   mvn spring-boot:run
   ```
3. **Agents**:
   Ensure all Python environments are set up and run the agents (check individual directories like `risk-manager`, `technical-agent`, etc.).

Alternatively, use the provided batch files for a quick start:
- `start-frontend.bat`
- `start-backend.bat`

---

## ⚠️ Disclaimer
**For educational purposes only.** This system is a proof-of-concept for AI-driven financial analysis. It does not constitute financial advice, and the developers are not responsible for any financial losses incurred through the use of this software. Always consult with a certified financial advisor before making investment decisions.

---
*Built with ❤️ for the Indian Trading Community.*
