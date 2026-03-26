# Product Requirements Document
## Fine-Tuned Autonomous Multi-Model Financial Advisor

| Field | Detail |
|---|---|
| Project Name | Fine-Tuned Autonomous Multi-Model Financial Advisor |
| Version | v1.0 |
| Status | In Development |
| Sentiment Analyst | Completed — 77% Accuracy on Indian Market Headlines |
| Remaining Modules | 5 Agents + Orchestration Layer |

---

## 1. Project Overview

The Fine-Tuned Autonomous Multi-Model Financial Advisor is a multi-agent AI system designed to simulate the decision-making process of a professional hedge fund. Instead of a single general-purpose model attempting to analyze everything, the system deploys six specialized agents, each an expert in one domain, operating in a structured hierarchical pipeline.

The Sentiment Analyst agent has been completed with 77% accuracy on Indian market-specific financial headlines. This PRD defines the full scope, methodology, and technology stack required to complete the remaining five modules and integrate them into a working end-to-end system.

### 1.1 Problem Being Solved

- **Problem 1** — Single-model financial AI tools produce shallow analysis. One model cannot be simultaneously expert in news sentiment, price patterns, and company fundamentals.
- **Problem 2** — General-purpose LLMs hallucinate financial data. Without grounding in real source documents, they fabricate plausible-sounding but incorrect valuations.
- **Problem 3** — No existing system enforces personal risk limits before executing a recommendation. The same advice is given regardless of user financial profile.

### 1.2 Solution Summary

A six-agent hierarchical pipeline where each agent is specialized, each connection is a versioned JSON contract, each decision is grounded in real data, and every output is filtered through deterministic risk rules before reaching the user.

---

## 2. Team Roles and Responsibilities

| Role | Agent Ownership | Responsibility |
|---|---|---|
| ML Engineer — Sentiment | Sentiment Analyst (DONE) | FinBERT fine-tuning complete at 77% accuracy. Responsible for API integration and NULL fallback handling. |
| ML Engineer — Technical | Technical Analyst | Implement TA-Lib indicators (RSI, MACD, ATR, Bollinger). Own the Regime_Flag computation and output schema. |
| ML Engineer — Fundamental | Fundamental Analyst | Build RAG pipeline using LangChain + FAISS. Own PDF preprocessing, embedding, and runtime retrieval logic. |
| Backend Engineer | Risk Manager + Orchestrator | Build deterministic Python rule engine for risk. Build FastAPI backend and asyncio orchestration layer. |
| NLP Engineer | Portfolio Manager + User Liaison | Design the weighted rubric prompt, regime-switching logic, confidence score output, and Liaison tone mapping. |

---

## 3. System Architecture

### 3.1 Architecture Pattern

Hierarchical Pipeline. Data flows strictly from Layer 0 (raw data sources) to Layer 4 (user output). No agent skips a layer or communicates laterally. Every inter-agent communication uses a fixed JSON contract.

### 3.2 Layers

#### Layer 0 — Data Sources
- News API — real-time financial headlines filtered by stock ticker
- Price API — OHLCV data (Yahoo Finance / NSE)
- Vector Database — pre-embedded annual report PDFs (FAISS / ChromaDB)
- User Profile JSON — structured file containing risk limits, budget, and exposure thresholds

#### Layer 1 — Parallel Intelligence Agents (asyncio)
- Sentiment Analyst, Technical Analyst, and Fundamental Analyst run simultaneously
- No dependency between these three agents — asyncio triggers all three at the same moment
- Each returns a structured JSON report with a status flag (OK or NULL)

#### Layer 2 — Safety Gate
- Risk Manager receives all three Layer 1 reports
- Applies deterministic Python rules against the User Profile JSON
- Returns: `approved` (bool), `adjusted_size` (float), `block_reason` (str or null)

#### Layer 3 — Decision Engine
- Portfolio Manager receives all agent reports and the Risk Manager approval
- Reads the `Regime_Flag` from the Technical Analyst report
- Selects weight set and computes: `Decision_Score = (w1 × Sentiment) + (w2 × Technical) + (w3 × Fundamental)`
- Outputs structured JSON only: `decision`, `decision_score`, `confidence_score`, `reasoning_log`

#### Layer 4 — Communication
- User Liaison receives Portfolio Manager JSON + all reasoning logs
- Maps `confidence_score` to calibrated natural language tone
- Returns one clean natural language summary to the user

---

## 4. Module Definitions and Methodology

### 4.1 Sentiment Analyst — COMPLETED

| Attribute | Detail |
|---|---|
| Status | Completed — 77% accuracy |
| Model | FinBERT fine-tuned on Indian financial headlines |
| Input | Raw news headlines for the queried stock ticker |
| Process | Tokenize → Classify (Positive / Negative / Neutral) → Compute weighted score |
| Output | `{ "sentiment_score": float (-1 to 1), "confidence": float, "status": "OK" \| "NULL" }` |
| Failure Handling | If News API is down → return `status: NULL`, pipeline redistributes weights |

---

### 4.2 Technical Analyst

| Attribute | Detail |
|---|---|
| Status | To Be Built |
| Library | TA-Lib, Python, NumPy |
| Input | OHLCV price data from Price API |
| Indicators | RSI (momentum), MACD (trend), Bollinger Bands (range), ATR (volatility) |
| Key Responsibility | Compute ATR z-score vs 14-day moving average → emit `Regime_Flag` (0, 1, or 2) |
| Output | `{ "rsi": float, "macd_signal": str, "regime_flag": int, "atr_zscore": float, "status": "OK" \| "NULL" }` |
| Failure Handling | If Price API times out → return `status: NULL` → Risk Manager blocks trade automatically |

#### Regime Flag Logic

| Regime | Flag Value | Trigger Condition |
|---|---|---|
| Stable / Bull | 0 | ATR below 14-day moving average |
| Bearish / Uncertain | 1 | ATR 1 standard deviation above mean |
| Panic / High Volatility | 2 | ATR 2 SD above mean OR single-session 5% price drop |

---

### 4.3 Fundamental Analyst

| Attribute | Detail |
|---|---|
| Status | To Be Built |
| Approach | Retrieval Augmented Generation (RAG) |
| Offline Process | Annual report PDFs chunked, embedded via sentence transformer, stored in FAISS / ChromaDB |
| Runtime Process | User query embedded → similarity search → 3–5 chunks retrieved → LLM generates signal from chunks only |
| Output | `{ "valuation_signal": "UNDERVALUED" \| "FAIR" \| "OVERVALUED", "rag_confidence": float, "status": "OK" \| "NULL" }` |
| Hallucination Control | LLM is explicitly restricted to retrieved source chunks — cannot fabricate data outside documents |

---

### 4.4 Risk Manager

| Attribute | Detail |
|---|---|
| Status | To Be Built |
| Type | Deterministic Python Script — NO LLM |
| Input | User Profile JSON + all three agent reports |
| Rules Enforced | `if trade_size > max_exposure → BLOCK` / `if daily_loss > daily_limit → BLOCK` / `if regime_flag == 2 → reduce trade size by 50%` |
| Output | `{ "approved": bool, "adjusted_size": float, "block_reason": str \| null }` |
| Justification | Hard financial limits require 100% deterministic logic. LLMs produce probabilistic outputs unacceptable for capital enforcement. |

#### User Profile JSON Schema
```json
{
  "max_trade_size": 0.10,
  "daily_loss_limit": 0.05,
  "max_exposure_per_stock": 0.15,
  "risk_level": "moderate"
}
```

---

### 4.5 Portfolio Manager

| Attribute | Detail |
|---|---|
| Status | To Be Built |
| Model | Llama 3 or GPT-4o with locked deterministic system prompt |
| Core Formula | `Decision_Score = (w1 × Sentiment) + (w2 × Technical) + (w3 × Fundamental)` |
| Constraint | `w1 + w2 + w3 = 1` |
| Output Format | Structured JSON only — no freeform text |
| Output | `{ "decision": str, "decision_score": float, "confidence_score": float, "reasoning_log": obj }` |

#### Regime-Switching Weight Table

| Regime | w1 Sentiment | w2 Technical | w3 Fundamental | Trigger |
|---|---|---|---|---|
| 0 — Stable | 0.40 | 0.30 | 0.30 | ATR below 14-day MA |
| 1 — Bearish | 0.25 | 0.50 | 0.25 | ATR 1 SD above mean |
| 2 — Panic | 0.10 | 0.80 | 0.10 | ATR 2 SD above mean or 5% drop |

#### Decision Logic
- Score above threshold + `approved: true` → **BUY / SELL**
- Score below threshold → **HOLD**
- `approved: false` → **BLOCKED** regardless of score

---

### 4.6 User Liaison

| Attribute | Detail |
|---|---|
| Status | To Be Built |
| Model | Fine-tuned dialogue model |
| Input | Portfolio Manager JSON + reasoning logs from all agents |
| Output | Natural language explanation including decision, reasoning, and missing data disclosure |

#### Confidence-to-Tone Mapping

| Confidence Score | Output Tone |
|---|---|
| > 0.85 | "All indicators strongly align. Recommended action: [decision]." |
| 0.65 – 0.85 | "Signals lean positive. Consider a moderate position." |
| 0.50 – 0.65 | "Mixed signals detected. Proceed with caution." |
| < 0.50 | "Conflicting signals. Holding position is advised." |

---

## 5. Technology Stack

| Layer | Component | Technology | Justification |
|---|---|---|---|
| Sentiment | FinBERT Fine-Tuning | HuggingFace Transformers, PyTorch | Domain-specific financial NLP, already completed |
| Technical | Indicator Computation | TA-Lib, NumPy, Python | Industry-standard library for all technical indicators |
| Fundamental | RAG Pipeline | LangChain, FAISS or ChromaDB, Sentence Transformers | Grounded retrieval from pre-embedded PDFs at millisecond speed |
| Risk | Rule Engine | Pure Python (if/else) | 100% deterministic, testable, zero hallucination risk |
| Decision | Portfolio Manager LLM | Llama 3 or GPT-4o API | Advanced reasoning for multi-signal synthesis with structured output |
| Communication | User Liaison | Fine-tuned dialogue model | Calibrated NL generation from structured JSON input |
| Orchestration | Backend + Async | FastAPI, Python asyncio | Native Python, parallel agent execution, lightweight |
| Storage | Vector Database | FAISS or ChromaDB | Optimized for similarity search on pre-embedded PDF chunks |
| Data | Price Feed | Yahoo Finance API or NSE API | Free, reliable OHLCV data for Indian markets |
| Data | News Feed | NewsAPI or similar | Real-time headline feed filterable by ticker symbol |

---

## 6. Inter-Agent JSON Contract

All agents communicate via a fixed versioned JSON schema. Changing it requires updating all downstream agents.

### 6.1 Consolidated Payload to Portfolio Manager

```json
{
  "sentiment_report": {
    "score": 0.72,
    "confidence": 0.88,
    "status": "OK"
  },
  "technical_report": {
    "rsi": 58.4,
    "macd_signal": "BUY",
    "regime_flag": 0,
    "atr_zscore": 0.4,
    "status": "OK"
  },
  "fundamental_report": {
    "valuation": "UNDERVALUED",
    "rag_confidence": 0.79,
    "status": "OK"
  },
  "risk_report": {
    "approved": true,
    "adjusted_size": 0.05,
    "block_reason": null
  }
}
```

### 6.2 Failure State Handling

| Failure Scenario | Agent Response | Pipeline Behaviour |
|---|---|---|
| News API down | `status: NULL` in sentiment_report | Increase w2 by 0.2, reduce max trade size 50% |
| FinBERT confidence < 0.5 | `confidence: LOW` flag | Apply 0.5x penalty multiplier to sentiment input |
| Price API timeout | `status: NULL` in technical_report | Risk Manager sets `approved: false` immediately |
| RAG retrieval fails | `status: NULL` in fundamental_report | Redistribute weight between sentiment and technical |

---

## 7. Research Objectives

| Objective | Description | Success Metric |
|---|---|---|
| O1 — Sentiment Model | Fine-tune FinBERT on Indian market headlines | Accuracy above 80% (currently 77%) |
| O2 — Regime-Aware Decisions | Dynamic weight switching via ATR Regime_Flag | Correct regime classification on historical test data |
| O3 — Grounded Fundamentals | RAG pipeline over annual report PDFs | Zero hallucinated financial figures in output |
| O4 — Deterministic Risk | Python rule engine for personal financial limits | 100% rule enforcement, no probabilistic edge cases |
| O5 — Confidence Transparency | Confidence-calibrated User Liaison response | Tone correctly matches confidence score in all test cases |

---

## 8. Scalability Considerations

> These are future-scope items. No scaling infrastructure is required for the current academic project scope.

- Agents can be containerized independently using Docker and orchestrated via Kubernetes for horizontal scaling.
- FastAPI backend can be placed behind a load balancer for concurrent user requests.
- FAISS / ChromaDB can be replaced with Pinecone for production-grade vector retrieval at scale.
- PDF embedding pipeline can be moved to a scheduled Apache Airflow job for automatic nightly refresh.

---

## 9. Out of Scope

- Real brokerage integration or live trade execution
- User authentication or multi-user account management
- Mobile application or production-ready frontend
- Kafka, Redis, or distributed message queue infrastructure
- Regulatory compliance (SEBI, SEC) — system is for academic demonstration only

---

*Fine-Tuned Autonomous Multi-Model Financial Advisor | PRD v1.0 | Academic Project*