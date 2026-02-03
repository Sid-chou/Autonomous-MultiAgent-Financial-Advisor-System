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

- **Risk Analysis Agent** - Portfolio risk assessment with AI insights
- **Optimization Agent** - Portfolio rebalancing recommendations
- **Market Analysis Agent** - Real-time Indian market monitoring (NSE/BSE)
- **Alert Agent** - Intelligent portfolio alerts and notifications

## 🎨 Modern SaaS Dashboard

- Light grayish-blue background
- Dark navy collapsible sidebar
- Royal blue accent colors
- Clean white cards with soft shadows
- Professional Inter typography
