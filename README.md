# Autonomous Multi-Agent Financial Advisor System - Setup Guide

## 🔑 API Keys Setup (REQUIRED)

Before running the application, you need to configure your API keys:

### 1. Copy the template file
```bash
cp backend/src/main/resources/application.properties.example backend/src/main/resources/application.properties
```

### 2. Get your API keys

#### Groq API (Primary AI - Free Tier Available)
- Visit: https://console.groq.com/keys
- Sign up for a free account
- Generate an API key
- Update `groq.api.key` in `application.properties`

#### Gemini API (Backup AI - Free Tier Available)
- Visit: https://aistudio.google.com/app/apikey
- Sign in with Google account
- Create an API key
- Update `gemini.api.key` in `application.properties`

#### Alpha Vantage API (Market Data - Free Tier Available)
- Visit: https://www.alphavantage.co/support/#api-key
- Request a free API key
- Update `alphavantage.api.key` in `application.properties`

### 3. Update the configuration file
Open `backend/src/main/resources/application.properties` and replace:
- `YOUR_GROQ_API_KEY_HERE` with your actual Groq API key
- `YOUR_GEMINI_API_KEY_HERE` with your actual Gemini API key
- `YOUR_ALPHAVANTAGE_API_KEY_HERE` with your actual Alpha Vantage API key

⚠️ **NEVER commit the real `application.properties` file to Git!** It is already in `.gitignore`.

## 🚀 Quick Start

### Backend Setup
```bash
cd backend
mvn spring-boot:run
```

### Frontend Setup
```bash
cd frontend
npm install
npm start
```

The application will be available at `http://localhost:3000`

## 📊 Features

### 🤖 AI-Powered Agents
- **Risk Analysis Agent** - Portfolio risk assessment with AI insights using Groq's LLaMA models
- **Optimization Agent** - Portfolio rebalancing recommendations with trade suggestions
- **Market Analysis Agent** - Real-time Indian market monitoring (NSE/BSE) with trend analysis
- **Alert Agent** - Intelligent portfolio alerts and notifications

### 💼 Portfolio Management
- **Add/Remove Holdings** - Manage your Indian stock portfolio (NSE/BSE symbols)
- **Auto-Save** - Portfolio automatically saved to browser localStorage
- **Export to CSV** - Download your portfolio with risk analysis data
- **Risk Tolerance** - Configure conservative, moderate, or aggressive risk profiles
- **Portfolio Distribution** - Visual pie chart showing asset allocation

### 📈 Analytics & Insights
- **Risk Scoring** - AI-calculated risk score (0-100) with visual indicators
- **Volatility Analysis** - Standard deviation and sharpe ratio calculations
- **Drawdown Analysis** - Maximum historical drawdown tracking
- **Rebalancing Trades** - Specific buy/sell recommendations to optimize allocation
- **Sector Performance** - Track leading and lagging sectors in Indian markets
- **Market Sentiment** - Real-time bullish/bearish market analysis

### 🎨 Modern SaaS Dashboard

- **Light Theme** - Professional light grayish-blue background (#E8ECF4)
- **Collapsible Sidebar** - Dark navy sidebar with smooth animations
- **Royal Blue Accents** - Consistent color scheme throughout (#4A6CF7)
- **White Cards** - Clean cards with soft shadows for content organization
- **Toast Notifications** - Real-time feedback for all user actions
- **Loading States** - Spinners and progress indicators for better UX
- **Error Handling** - Graceful error boundaries and user-friendly messages
- **Responsive Design** - Works on desktop, tablet, and mobile devices
- **Professional Typography** - Inter font family for readability

### 🔒 Security & Privacy
- **Local Storage Only** - All data stored in browser, no external database
- **API Key Protection** - Sensitive keys kept in gitignored configuration
- **Error Boundaries** - Prevents crashes and data loss
- **Template Configuration** - Safe example files for easy setup

## 🛠️ Technology Stack

**Frontend:**
- React 18
- Tailwind CSS
- Recharts (data visualization)
- Axios (API calls)
- Lucide React (icons)

**Backend:**
- Spring Boot 3
- Java 17
- Groq AI (LLaMA 3.3 70B)
- Google Gemini (backup)
- Alpha Vantage API (market data)

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.
