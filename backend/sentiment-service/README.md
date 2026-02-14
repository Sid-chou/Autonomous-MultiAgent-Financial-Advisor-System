# Sentiment Analysis Service

Python-based microservice for analyzing Indian stock market sentiment using AI models.

**Models Supported**:
- **Fine-Tuned Llama-3 8B** (via Ollama) - Custom trained on financial data, >85% accuracy
- **FinBERT** (backup) - Pre-trained financial sentiment model from HuggingFace

## Features

- **FinBERT Model**: Financial domain-specific sentiment analysis
- **News Sources**: Moneycontrol, Economic Times, Business Standard (RSS feeds)
- **Social Media**: Reddit (r/IndiaInvestments, r/IndianStockMarket) - Optional
- **Caching**: 30-minute TTL cache to reduce processing
- **Weighted Aggregation**: News (60%) + Social (40%)

## Setup

### Option A: Fine-Tuned Model (Recommended)

#### 1. Install Ollama

**Windows**:
1. Download from https://ollama.ai/download
2. Run the installer
3. Verify installation:
```bash
ollama --version
```

**macOS/Linux**:
```bash
curl -fsSL https://ollama.ai/install.sh | sh
```

#### 2. Import the Fine-Tuned Model

After training the model in Google Colab (notebook provided separately), you'll have a `financial-sentiment-model.gguf` file.

```bash
# Place the GGUF file in the sentiment-service directory
cd backend/sentiment-service

# Create the model in Ollama
ollama create financial-sentiment -f Modelfile

# Test the model
ollama run financial-sentiment "Operating costs increased, but margins expanded."
# Expected output: Positive
```

#### 3. Install Python Dependencies

```bash
pip install -r requirements.txt
```

#### 4. Run the Service

```bash
python app.py
```

The service will automatically use the fine-tuned model via Ollama. If Ollama is not running, it will fallback to FinBERT.

---

### Option B: FinBERT Only (No Ollama)

If you want to use only FinBERT without installing Ollama:

#### 1. Disable Fine-Tuned Model

Create a `.env` file:
```bash
USE_FINETUNED_MODEL=false
FALLBACK_TO_FINBERT=true
```

#### 2. Install Python Dependencies

```bash
cd backend/sentiment-service
pip install -r requirements.txt
```

### 2. Configure Reddit API (Optional)

If you want to include Reddit sentiment:

1. Go to https://www.reddit.com/prefs/apps
2. Click "Create App" or "Create Another App"
3. Choose "script"
4. Name: "FinancialAdvisorBot"
5. Redirect URI: `http://localhost:8080`
6. Note the **client_id** and **client_secret**

Create `.env` file:
```bash
REDDIT_ENABLED=true
REDDIT_CLIENT_ID=your_client_id_here
REDDIT_CLIENT_SECRET=your_secret_here
```

### 3. Run the Service

```bash
python app.py
```

Service will start on `http://localhost:5000`

**First run**: FinBERT model (~500MB) will download automatically from Hugging Face. This may take 2-5 minutes depending on internet speed.

## API Endpoints

### POST /api/v1/analyze-sentiment
Analyze sentiment for a ticker

**Request:**
```json
{
  "ticker": "RELIANCE"
}
```

**Response:**
```json
{
  "ticker": "RELIANCE",
  "companyName": "Reliance Industries",
  "overallSentiment": "BULLISH",
  "positiveScore": 0.72,
  "negativeScore": 0.15,
  "neutralScore": 0.13,
  "confidenceScore": 0.85,
  "newsCount": 25,
  "socialCount": 18,
  "sources": {
    "news": [...],
    "social": [...]
  },
  "timestamp": "2026-02-04T00:42:00"
}
```

### GET /health
Health check

**Response:**
```json
{
  "status": "healthy",
  "service": "sentiment-analysis",
  "model": "ProsusAI/finbert",
  "reddit_enabled": false
}
```

### GET /cache-stats
Get cache statistics

**Response:**
```json
{
  "size": 15,
  "max_size": 1000,
  "hits": 42,
  "misses": 15,
  "hit_rate_percent": 73.68
}
```

## Testing

### Test Health
```bash
curl http://localhost:5000/health
```

### Test Sentiment Analysis
```bash
curl -X POST http://localhost:5000/api/v1/analyze-sentiment \
  -H "Content-Type: application/json" \
  -d '{"ticker":"RELIANCE"}'
```

### Test via Spring Boot
```bash
curl http://localhost:8080/api/sentiment/analyze/RELIANCE
```

## Supported Tickers

Popular NSE stocks with company name mappings:
- RELIANCE - Reliance Industries
- TCS - Tata Consultancy Services
- INFY - Infosys
- HDFCBANK - HDFC Bank
- ICICIBANK - ICICI Bank
- And many more...

## Architecture

```
User Request
    ↓
Spring Boot API (port 8080)
    ↓
Python Flask Service (port 5000)
    ↓
Check Cache (30min TTL)
    ↓ (if miss)
Collect Data:
  ├─ News RSS Feeds (Moneycontrol, ET, BS)
  └─ Reddit API (optional)
    ↓
FinBERT Analysis (batch processing)
    ↓
Aggregate with weights (60/40)
    ↓
Return Sentiment + Cache
```

## Performance

- **With Cache**: < 50ms response time
- **Without Cache (Cold)**: 5-15 seconds:
  - News collection: 2-3s
  - Reddit collection: 1-2s (if enabled)
  - FinBERT analysis: 2-5s
  - Aggregation: < 1s

## Troubleshooting

### Model Download Fails
- Check internet connection
- Hugging Face may be slow, retry after a few minutes
- Model will be cached after first download

### No News Found
- RSS feeds may be temporarily unavailable
- Try another ticker
- Service will return NEUTRAL sentiment with 0 confidence

### Reddit API Errors
- Check credentials in `.env`
- Ensure `REDDIT_ENABLED=true`
- Reddit may rate limit - service will work with news only

## Notes

- **First run**: Model download takes 2-5 minutes
- **Cache**: Results cached for 30 minutes
- **Free tier**: All APIs are free (Hugging Face, RSS, Reddit)
- **No database**: All data in-memory cache only
