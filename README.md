# Risk Agent Demo - Autonomous Multi-Agent Financial Advisor

## Overview
This is a basic demonstration of the **Risk Assessment Agent** - one of the autonomous agents in our Multi-Agent Financial Advisor System.

## Features
- Portfolio risk analysis (VaR, Standard Deviation, Beta)
- Risk tolerance assessment
- AI-powered risk recommendations using Gemini
- Real-time risk scoring
- Simple and clean UI

## Project Structure
```
risk/
├── backend/          # Spring Boot backend
│   ├── src/
│   └── pom.xml
├── frontend/         # React frontend
│   ├── src/
│   └── package.json
└── README.md
```

## Tech Stack
- **Backend**: Spring Boot 3, Java 17
- **Frontend**: React 18, Material-UI
- **AI**: Google Gemini API (Free Tier)
- **Demo**: Localhost only

## Getting Started

### Backend (Port 8080)
```bash
cd backend
mvn spring-boot:run
```

### Frontend (Port 3000)
```bash
cd frontend
npm install
npm start
```

Visit: http://localhost:3000

## Demo Features
1. Add your portfolio holdings (stock symbols, quantities, purchase prices)
2. Click "Analyze Risk" to get AI-powered risk assessment
3. View risk metrics: VaR, volatility, diversification score
4. Get personalized risk recommendations
