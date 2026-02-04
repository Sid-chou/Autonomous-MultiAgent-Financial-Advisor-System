# 🚀 Quick Start Guide - Autonomous Multi-Agent Financial Advisor

Complete guide to run the project with **5 AI Agents**: Risk Analysis, Portfolio Optimization, Market Analysis, Alerts, and **Sentiment Analysis**.

---

## 📋 Prerequisites

### Required Software:
- ✅ **Java 17+** - Backend
- ✅ **Maven** - Java build tool
- ✅ **Node.js 16+** - Frontend
- ✅ **Python 3.8+** - Sentiment service

### Check Installations:
```bash
# Check Java
java -version

# Check Maven
mvn -version

# Check Node
node -version

# Check Python
python --version
```

---

## ⚙️ One-Time Setup

### 1️⃣ Configure API Keys (5 minutes)

Copy the template file:
```bash
cd backend/src/main/resources
copy application.properties.example application.properties
```

Edit `application.properties` and add your API keys:

**Groq API (Free):**
1. Visit: https://console.groq.com/keys
2. Sign up → Create API Key
3. Paste in: `groq.api.key=YOUR_KEY_HERE`

**Gemini API (Free):**
1. Visit: https://aistudio.google.com/app/apikey
2. Create API Key
3. Paste in: `gemini.api.key=YOUR_KEY_HERE`

**Alpha Vantage API (Free):**
1. Visit: https://www.alphavantage.co/support/#api-key
2. Request free key
3. Paste in: `alphavantage.api.key=YOUR_KEY_HERE`

### 2️⃣ Install Frontend Dependencies (2 minutes)

```bash
cd frontend
npm install
```

### 3️⃣ Install Python Dependencies for Sentiment Service (5 minutes)

```bash
cd backend/sentiment-service
pip install -r requirements.txt
```

**Note:** First run will download FinBERT model (~500MB, takes 2-5 min)

---

## ▶️ Running the Project

### **Option A: All Services Together (Recommended)**

Open **3 separate terminals** in the project root directory:

#### **Terminal 1: Sentiment Service (Python)**
```bash
cd backend/sentiment-service
python app.py
```
✅ Wait for: "Starting Flask Server on port 5000"

#### **Terminal 2: Spring Boot Backend (Java)**
```bash
cd backend
mvn spring-boot:run
```
✅ Wait for: "Started RiskAgentApplication"

#### **Terminal 3: React Frontend**
```bash
cd frontend
npm start
```
✅ Wait for: Browser opens at `http://localhost:3000`

---

## 🎯 Access the Application

Once all 3 services are running:

**Frontend:** http://localhost:3000
**Backend API:** http://localhost:8080
**Sentiment API:** http://localhost:5000

---

## 🧪 Quick Test

### Test in Browser:
1. Open http://localhost:3000
2. You should see the Financial Advisor Dashboard
3. Try adding a stock: `RELIANCE.NS`
4. Click "Analyze Risk"
5. Go to other tabs to test all agents

### Test APIs Directly:

**Backend Health:**
```bash
curl http://localhost:8080/api/market/current
```

**Sentiment Service:**
```bash
curl -X POST http://localhost:5000/api/v1/analyze-sentiment -H "Content-Type: application/json" -d "{\"ticker\":\"RELIANCE\"}"
```

---

## 🛑 Stopping the Services

Press `Ctrl+C` in each terminal to stop:
1. Frontend (Terminal 3)
2. Spring Boot (Terminal 2)
3. Sentiment Service (Terminal 1)

---

## 🔧 Troubleshooting

### Port Already in Use

**Port 8080 (Backend):**
```bash
# Windows
netstat -ano | findstr :8080
taskkill /PID <PID> /F
```

**Port 3000 (Frontend):**
```bash
# Windows
netstat -ano | findstr :3000
taskkill /PID <PID> /F
```

**Port 5000 (Sentiment):**
```bash
# Windows
netstat -ano | findstr :5000
taskkill /PID <PID> /F
```

### Backend Fails to Start
- Check `application.properties` has valid API keys
- Ensure Java 17+ is installed
- Try: `mvn clean install` first

### Frontend Fails to Start
- Run: `npm install` again
- Delete `node_modules` and reinstall
- Check Node version: `node -version` (needs 16+)

### Sentiment Service Fails
- Check Python version: `python --version` (needs 3.8+)
- Install dependencies: `pip install -r requirements.txt`
- On first run, wait for FinBERT download to complete

### FinBERT Model Download Slow
- Be patient, ~500MB download
- Check internet connection
- Model caches after first download

---

## 📊 What Each Service Does

| Service | Port | Purpose |
|---------|------|---------|
| **React Frontend** | 3000 | User interface |
| **Spring Boot Backend** | 8080 | 4 Java agents (Risk, Optimization, Market, Alerts) |
| **Python Sentiment** | 5000 | AI sentiment analysis with FinBERT |

---

## 🎨 Using the Dashboard

### Available Agents:

1. **Risk Analysis** 📊
   - Add Indian stocks (RELIANCE.NS, TCS.NS, etc.)
   - Analyze portfolio risk
   - Get AI insights

2. **Portfolio Optimization** 🎯
   - Get rebalancing recommendations
   - See buy/sell suggestions
   - Optimize allocation

3. **Market Analysis** 📈
   - Real-time NSE/BSE data
   - Sector performance
   - Market sentiment

4. **Alerts** 🔔
   - Portfolio monitoring
   - Critical alerts
   - Warning notifications

5. **Sentiment Analysis** 🧠 (NEW!)
   - Enter ticker (e.g., RELIANCE)
   - Get BULLISH/BEARISH/NEUTRAL sentiment
   - See news and social sources
   - AI-powered analysis

---

## 💡 Tips

✅ **Save Portfolio:** Portfolio auto-saves to browser localStorage
✅ **Export CSV:** Download portfolio data anytime
✅ **Sentiment Cache:** First sentiment analysis takes 5-15s, then cached for 30 min
✅ **Demo Data:** App loads with sample portfolio (RELIANCE, TCS, INFY)
✅ **Toast Notifications:** Watch for success/error messages

---

## 🆘 Need Help?

**Common Issues:**

❓ **"Service unavailable" error**
→ Check all 3 terminals are running

❓ **No sentiment data**
→ Sentiment service may be downloading model (first run only)

❓ **API errors**
→ Check `application.properties` has valid keys

❓ **Port conflicts**
→ See "Port Already in Use" section above

---

## 🎉 You're Ready!

Start all 3 services and enjoy your **5-Agent Financial Advisor System**! 🚀
