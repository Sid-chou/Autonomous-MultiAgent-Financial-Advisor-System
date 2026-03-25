"""
Configuration for Sentiment Analysis Service
"""
import os

# Flask Configuration
DEBUG = True
PORT = 5000
HOST = '0.0.0.0'

# Model Configuration
MODEL_NAME = "models/finbert_indian_best"  # FinBERT model from local Hugging Face path
MAX_LENGTH = 512  # Maximum token length for FinBERT

# Cache Configuration
CACHE_TTL_SECONDS = 1800  # 30 minutes
CACHE_MAX_SIZE = 1000  # Maximum cached items

# Data Collection Configuration
MAX_NEWS_ARTICLES = 30
MAX_REDDIT_POSTS = 30
REQUEST_TIMEOUT = 10  # seconds

# News Sources — priority-grouped RSS feeds (finance-specific, no auth required)
# Priority 1 = preferred, 2 = fallback, 3 = last resort
SOURCE_GROUPS = {
    "market_news": [
        {"name": "ET Markets",   "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",        "priority": 1},
        {"name": "ET Stocks",    "url": "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",    "priority": 1},
        {"name": "ET Economy",   "url": "https://economictimes.indiatimes.com/economy/rssfeeds/1373380680.cms",        "priority": 1},
        {"name": "Business Standard Markets", "url": "https://www.business-standard.com/rss/markets-106.rss",          "priority": 2},
        {"name": "LiveMint Markets",          "url": "https://www.livemint.com/rss/markets",                           "priority": 2},
        {"name": "Moneycontrol",              "url": "https://www.moneycontrol.com/rss/latestnews.xml",                "priority": 3},
    ],
    "stocks_specific": [
        {"name": "MC Buzzing Stocks",    "url": "https://www.moneycontrol.com/rss/buzzingstocks.xml",   "priority": 1},
        {"name": "MC Results",           "url": "https://www.moneycontrol.com/rss/results.xml",         "priority": 1},
        {"name": "Financial Express",    "url": "https://www.financialexpress.com/market/feed/",         "priority": 2},
        {"name": "BusinessLine Markets", "url": "https://www.thehindubusinessline.com/markets/?service=rss", "priority": 2},
    ],
    "economy_macro": [
        {"name": "LiveMint Money",       "url": "https://www.livemint.com/rss/money",                   "priority": 1},
        {"name": "ET Wealth",            "url": "https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms", "priority": 1},
        {"name": "Business Standard Economy", "url": "https://www.business-standard.com/rss/economy-policy-102.rss", "priority": 2},
    ],
    "negative_signals": [
        # Structurally negative sources — earnings misses, enforcement orders,
        # debt defaults, rating downgrades. Directly improves Negative class detection.
        {"name": "MC Results",    "url": "https://www.moneycontrol.com/rss/results.xml",                "priority": 1},
        {"name": "BusinessLine",  "url": "https://www.thehindubusinessline.com/markets/?service=rss",   "priority": 1},
        {"name": "BS Markets",    "url": "https://www.business-standard.com/rss/markets-106.rss",       "priority": 1},
    ],
}


def get_all_sources():
    """Flat list of all unique sources for the live agent to consume, sorted by priority."""
    seen_urls = set()
    all_sources = []
    for group in SOURCE_GROUPS.values():
        for source in group:
            if source["url"] not in seen_urls:
                seen_urls.add(source["url"])
                all_sources.append(source)
    # Highest priority (lowest number) feeds processed first
    return sorted(all_sources, key=lambda x: x["priority"])

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

