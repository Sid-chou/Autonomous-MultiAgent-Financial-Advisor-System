# 🚀 Quick Start Guide - Risk Agent Demo

## What is this?

This is a demonstration of the **Risk Assessment Agent** - an autonomous AI agent that analyzes portfolio risk using advanced financial algorithms and provides personalized recommendations.

## Features Demonstrated

✅ **Portfolio Risk Analysis**
- Value at Risk (VaR) calculation
- Volatility (Standard Deviation) measurement
- Diversification scoring
- Risk level assessment (LOW/MEDIUM/HIGH)


✅ **AI-Powered Recommendations**
- Personalized risk advice
- Diversification suggestions
- Risk tolerance alignment checks

✅ **Professional UI**
- Material-UI components
- Real-time charts and visualizations
- Responsive design

---

## Prerequisites

Make sure you have installed:
- **Java 17** or higher ([Download](https://www.oracle.com/java/technologies/downloads/))
- **Maven** ([Download](https://maven.apache.org/download.cgi))
- **Node.js** 16+ and npm ([Download](https://nodejs.org/))

Check installations:
```bash
java -version
mvn -version
node -version
npm -version
```

---

## 🎯 Quick Start (Easiest Method)

### Option 1: Using Batch Files (Windows)

1. **Start Backend** (in one terminal):
   ```
   Double-click: start-backend.bat
   ```
   Wait for: "🚀 Risk Agent Backend is running on http://localhost:8080"

2. **Start Frontend** (in another terminal):
   ```
   Double-click: start-frontend.bat
   ```
   Browser will auto-open at: http://localhost:3000

---

### Option 2: Manual Start

#### Terminal 1 - Backend
```bash
cd risk/backend
mvn spring-boot:run
```

#### Terminal 2 - Frontend
```bash
cd risk/frontend
npm install
npm start
```

---

## 📊 How to Use the Demo

### Step 1: Add Portfolio Holdings
- Enter stock symbols (e.g., AAPL, GOOGL, MSFT)
- Enter quantity, purchase price, and current price
- Add multiple holdings using the "+ Add Holding" button

### Step 2: Set Risk Tolerance
- Choose: Conservative, Moderate, or Aggressive

### Step 3: Analyze Risk
- Click "Analyze Risk" button
- Wait for AI agent to process (1-2 seconds)

### Step 4: View Results
- **Risk Score**: 0-100 scale with color coding
- **Metrics**: Total value, VaR, volatility, diversification
- **AI Insight**: Personalized market analysis
- **Recommendations**: Actionable advice based on your portfolio

---

## 🧪 Sample Demo Data

Try these sample portfolios to test the agent:

### Conservative Portfolio (Low Risk)
```
AAPL: 10 shares @ $150 → $175
BND: 20 shares @ $80 → $82
VTI: 15 shares @ $200 → $210
```

### Aggressive Portfolio (High Risk)
```
TSLA: 5 shares @ $600 → $750
NVDA: 8 shares @ $400 → $550
GME: 10 shares @ $150 → $180
```

### Poorly Diversified (Triggers Warnings)
```
AAPL: 50 shares @ $150 → $175
```

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────┐
│     React Frontend (Port 3000)      │
│  - Portfolio Input Form              │
│  - Risk Visualization Charts         │
│  - Real-time Results Display         │
└──────────────┬──────────────────────┘
               │ HTTP REST API
               │ (axios)
               ▼
┌─────────────────────────────────────┐
│   Spring Boot Backend (Port 8080)   │
│  ┌───────────────────────────────┐  │
│  │  🤖 Risk Agent Service         │  │
│  │  - Portfolio Analysis          │  │
│  │  - VaR Calculation             │  │
│  │  - Volatility Measurement      │  │
│  │  - Diversification Scoring     │  │
│  │  - AI Recommendation Engine    │  │
│  └───────────────────────────────┘  │
└─────────────────────────────────────┘
```

---

## 📁 Project Structure

```
risk/
├── backend/                      # Spring Boot Application
│   ├── src/main/java/
│   │   └── com/financial/riskagent/
│   │       ├── RiskAgentApplication.java
│   │       ├── model/
│   │       │   ├── Holding.java
│   │       │   ├── PortfolioRequest.java
│   │       │   └── RiskAnalysisResponse.java
│   │       ├── service/
│   │       │   └── RiskAgentService.java   # 🧠 Agent Logic
│   │       ├── controller/
│   │       │   └── RiskAgentController.java
│   │       └── config/
│   │           └── CorsConfig.java
│   └── pom.xml
│
├── frontend/                     # React Application
│   ├── public/
│   │   └── index.html
│   ├── src/
│   │   ├── App.js               # Main UI Component
│   │   ├── index.js
│   │   └── index.css
│   └── package.json
│
├── start-backend.bat            # Windows startup script
├── start-frontend.bat           # Windows startup script
└── README.md
```

---

## 🔬 Technical Details

### Backend Algorithms

#### 1. Value at Risk (VaR)
- Confidence Level: 95%
- Formula: `VaR = Portfolio Value × 1.65 × Daily Volatility`

#### 2. Volatility (Standard Deviation)
- Calculates price variance across holdings
- Annualized volatility metric

#### 3. Diversification Score
- Herfindahl Index for concentration
- Bonus points for multiple holdings
- Scale: 0-100 (higher = better diversified)

#### 4. Risk Score
- Combines volatility (60%) + diversification (40%)
- Classification: LOW (<30), MEDIUM (30-60), HIGH (>60)

### Frontend Features
- **Material-UI**: Modern, professional component library
- **Recharts**: Interactive pie chart for portfolio distribution
- **Axios**: HTTP client for API calls
- **Real-time Updates**: Instant feedback on analysis

---

## 🛠️ Troubleshooting

### Backend won't start
- Check Java version: `java -version` (need 17+)
- Check Maven: `mvn -version`
- Port 8080 in use? Change in `application.properties`

### Frontend won't start
- Delete `node_modules` and run `npm install` again
- Port 3000 in use? React will prompt to use different port
- Clear cache: `npm cache clean --force`

### "Failed to connect to backend"
- Make sure backend is running on port 8080
- Check CORS settings in `CorsConfig.java`
- Check browser console for errors (F12)

### Analysis returns weird results
- Ensure current price > 0
- Ensure quantity > 0
- Check your input values are reasonable

---

## 🎓 For Your Presentation

### Key Talking Points

1. **Autonomous Agent Architecture**
   - "The Risk Agent operates independently, making decisions based on portfolio data"
   - "Uses financial algorithms: VaR, Herfindahl Index, volatility calculations"

2. **Multi-Agent System (Future)**
   - "This is one of 6 agents in our complete system"
   - "Agents communicate via message bus to provide comprehensive advice"

3. **AI Integration**
   - "Currently uses rule-based AI, can integrate Gemini API for natural language insights"
   - "Agent learns from portfolio patterns to improve recommendations"

4. **Real-World Application**
   - "Professional robo-advisors use similar algorithms"
   - "Demonstrates understanding of financial risk management"

### Demo Script (2 minutes)

1. **Show empty dashboard** (5 sec)
2. **Add 2-3 holdings** (20 sec)
3. **Click Analyze** (2 sec)
4. **Explain results**:
   - Point to risk score and color coding (10 sec)
   - Highlight VaR metric (10 sec)
   - Read AI insight (10 sec)
   - Show recommendations (15 sec)
5. **Add more holdings** to show diversification improvement (30 sec)
6. **Re-analyze** to demonstrate real-time processing (10 sec)
7. **Show portfolio pie chart** (10 sec)

---

## 📈 Next Steps / Future Enhancements

- [ ] Integrate real Gemini API for natural language insights
- [ ] Add historical data visualization
- [ ] Implement Monte Carlo simulation
- [ ] Add multiple portfolio comparison
- [ ] Create agent-to-agent communication demo
- [ ] Add Market Analysis Agent
- [ ] Add Portfolio Optimization Agent
- [ ] Deploy to cloud (Vercel + Render)

---

## 📝 Notes

- This is a **demo/MVP** for final year project
- All calculations use simplified algorithms suitable for demonstration
- For production, would integrate with real market data APIs
- Agent behavior can be extended with machine learning

---

## ✅ Checklist Before Demo

- [ ] Backend starts without errors
- [ ] Frontend loads at localhost:3000
- [ ] Can add holdings successfully
- [ ] Analysis returns results
- [ ] Charts display correctly
- [ ] All metrics show reasonable values
- [ ] Recommendations are relevant
- [ ] Tested on fresh browser (no cache issues)

---

**Ready to present your autonomous Risk Agent! 🎉**
