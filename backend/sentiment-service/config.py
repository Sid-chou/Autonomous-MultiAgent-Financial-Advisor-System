"""
Configuration for Sentiment Analysis Service
"""
import os

# Flask Configuration
DEBUG = True
PORT = 5000
HOST = '0.0.0.0'

# Model Configuration
MODEL_NAME = "ProsusAI/finbert"  # FinBERT model from Hugging Face
MAX_LENGTH = 512  # Maximum token length for FinBERT

# Cache Configuration
CACHE_TTL_SECONDS = 1800  # 30 minutes
CACHE_MAX_SIZE = 1000  # Maximum cached items

# Data Collection Configuration
MAX_NEWS_ARTICLES = 30
MAX_REDDIT_POSTS = 30
REQUEST_TIMEOUT = 10  # seconds

# News Sources (RSS Feeds - No Auth Required)
NEWS_SOURCES = [
    {
        "name": "Moneycontrol",
        "url": "https://www.moneycontrol.com/rss/latestnews.xml",
        "weight": 0.35
    },
    {
        "name": "Economic Times",
        "url": "https://economictimes.indiatimes.com/rssfeedstopstories.cms",
        "weight": 0.35
    },
    {
        "name": "Business Standard",
        "url": "https://www.business-standard.com/rss/markets-106.rss",
        "weight": 0.30
    }
]

# Reddit Configuration (Optional - requires API credentials)
REDDIT_ENABLED = os.getenv('REDDIT_ENABLED', 'false').lower() == 'true'
REDDIT_CLIENT_ID = os.getenv('REDDIT_CLIENT_ID', '')
REDDIT_CLIENT_SECRET = os.getenv('REDDIT_CLIENT_SECRET', '')
REDDIT_USER_AGENT = 'FinancialAdvisorBot/1.0'

REDDIT_SUBREDDITS = [
    "IndiaInvestments",
    "IndianStockMarket",
    "IndiaTech"
]

# Sentiment Thresholds
BULLISH_THRESHOLD = 0.6  # Positive score > 0.6 = BULLISH
BEARISH_THRESHOLD = 0.6  # Negative score > 0.6 = BEARISH

# Weighting Strategy
NEWS_WEIGHT = 0.6  # 60% weight to news
SOCIAL_WEIGHT = 0.4  # 40% weight to social media

# Stock ticker mappings (NSE to company names for better search)
TICKER_MAPPINGS = {
    "RELIANCE": "Reliance Industries",
    "TCS": "Tata Consultancy Services",
    "INFY": "Infosys",
    "HDFCBANK": "HDFC Bank",
    "ICICIBANK": "ICICI Bank",
    "HINDUNILVR": "Hindustan Unilever",
    "ITC": "ITC Limited",
    "SBIN": "State Bank of India",
    "BHARTIARTL": "Bharti Airtel",
    "KOTAKBANK": "Kotak Mahindra Bank",
    "LT": "Larsen & Toubro",
    "ASIANPAINT": "Asian Paints",
    "MARUTI": "Maruti Suzuki",
    "WIPRO": "Wipro",
    "TITAN": "Titan Company"
}

# Fine-Tuned Model Configuration (Ollama)
USE_FINETUNED_MODEL = os.getenv('USE_FINETUNED_MODEL', 'true').lower() == 'true'
OLLAMA_API_URL = os.getenv('OLLAMA_API_URL', 'http://localhost:11434')
OLLAMA_MODEL_NAME = os.getenv('OLLAMA_MODEL_NAME', 'financial-sentiment')
FALLBACK_TO_FINBERT = os.getenv('FALLBACK_TO_FINBERT', 'true').lower() == 'true'

# Ollama System Prompt
OLLAMA_SYSTEM_PROMPT = """You are a senior financial analyst specialized in sentiment analysis. Analyze financial news, headlines, and social media posts.

Your task is to classify the sentiment as EXACTLY one word:
- Positive (bullish, good news for stock price)
- Negative (bearish, bad news for stock price)  
- Neutral (mixed or unclear impact)

Respond with ONLY the sentiment word. No explanations, no additional text."""

# Ollama Request Configuration
OLLAMA_TIMEOUT = 10  # seconds
OLLAMA_TEMPERATURE = 0.1  # Low temperature for consistent output

