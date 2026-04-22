"""
Sentiment Analysis Flask Service
Main application for analyzing Indian stock market sentiment
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
from concurrent.futures import ThreadPoolExecutor, as_completed
import feedparser
import config
from config import get_all_sources

# Import modules
from models.analyzer_factory import analyzer, get_model_info
from collectors.reddit_collector import RedditCollector
from cache.cache_manager import cache

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Spring Boot integration

# Initialize collectors
reddit_collector = RedditCollector()


# ─── Risk Theme Classification ────────────────────────────────────────────────

RISK_THEMES = {
    "competition":  ["competitor", "rival", "cheaper", "alternative", "disruption", "ai replace", "automation", "undercut"],
    "earnings":     ["miss", "below estimate", "profit warning", "revenue decline", "weak quarter", "disappoints"],
    "macro":        ["recession", "rate hike", "inflation", "slowdown", "gdp", "fed", "rbi"],
    "regulatory":   ["sebi", "penalty", "investigation", "compliance", "ban", "probe"],
    "management":   ["ceo", "resign", "fraud", "layoff", "restructure", "scandal"],
    "deal_loss":    ["lost contract", "deal cancelled", "client exit", "order cancelled", "pulled out"]
}

def classify_theme(headline: str) -> str:
    headline_lower = headline.lower()
    for theme, keywords in RISK_THEMES.items():
        if any(kw in headline_lower for kw in keywords):
            return theme
    return "general"


def extract_top_factors(scored_headlines: list) -> list:
    """
    scored_headlines: list of dicts with keys: headline, label, confidence
    Returns top 3 negative headlines with theme classification.
    """
    negative = [h for h in scored_headlines if h["label"] == "negative"]
    negative.sort(key=lambda x: x["confidence"], reverse=True)
    return [
        {
            "headline":   h["headline"],
            "theme":      classify_theme(h["headline"]),
            "confidence": round(h["confidence"], 2)
        }
        for h in negative[:3]
    ]


# ─── Concurrent RSS Fetching ─────────────────────────────────────────────────

def fetch_single_feed(source, search_terms):
    """Fetch one RSS feed and return matching articles."""
    articles = []
    try:
        feed = feedparser.parse(
            source["url"],
            request_headers={"User-Agent": "Mozilla/5.0"}
        )
        for entry in feed.entries:
            title   = entry.get("title", "")
            summary = entry.get("summary", "")
            text    = f"{title} {summary}".lower()
            if any(term.lower() in text for term in search_terms):
                articles.append({
                    "title":          title,
                    "summary":        summary,
                    "source":         source["name"],
                    "sentiment_text": f"{title}. {summary}",
                    "url":            entry.get("link", ""),
                    "priority":       source["priority"],
                })
        print(f"DEBUG {source['name']} returned {len(articles)} articles")
    except Exception as e:
        print(f"DEBUG {source['name']} failed: {e}")
    return articles


def fetch_all_feeds_concurrent(search_terms):
    """Fire all RSS feeds simultaneously. Hard cap: 8 seconds total."""
    sources     = get_all_sources()
    all_articles = []
    with ThreadPoolExecutor(max_workers=15) as executor:
        futures = {
            executor.submit(fetch_single_feed, source, search_terms): source
            for source in sources
        }
        for future in as_completed(futures, timeout=8):
            try:
                all_articles.extend(future.result())
            except Exception as e:
                print(f"DEBUG feed future failed: {e}")
    # Higher priority (lower number) articles score first
    return sorted(all_articles, key=lambda x: x.get("priority", 99))


# ─────────────────────────────────────────────────────────────────────────────

print("=" * 50)
print("Sentiment Analysis Service Starting...")
print("=" * 50)

@app.route('/health', methods=['GET'])
def health_check():
    """
    Health check endpoint
    """
    model_info = get_model_info()
    return jsonify({
        "status": "healthy",
        "service": "sentiment-analysis",
        "model": model_info.get("model_name", "unknown"),
        "active_model": model_info.get("active_model", "unknown"),
        "provider": model_info.get("provider", "unknown"),
        "timestamp": datetime.now().isoformat(),
        "reddit_enabled": config.REDDIT_ENABLED,
        "ollama_enabled": config.USE_FINETUNED_MODEL,
        "fallback_available": model_info.get("fallback_available", False)
    })

@app.route('/api/v1/analyze-sentiment', methods=['POST'])
def analyze_sentiment():
    """
    Main sentiment analysis endpoint
    
    Request Body:
        {
    "ticker": "RELIANCE"
        }
    
    Response:
        {
            "ticker": "RELIANCE",
            "overallSentiment": "BULLISH",
            "positiveScore": 0.72,
            "negativeScore": 0.15,
            "neutralScore": 0.13,
            "confidenceScore": 0.85,
            "newsCount": 25,
            "socialCount": 18,
            "sources": [...],
            "timestamp": "2026-02-04T00:42:00"
        }
    """
    try:
        # Get ticker from request
        data = request.get_json()
        ticker = data.get('ticker', '').upper()
        
        if not ticker:
            return jsonify({"error": "Ticker is required"}), 400
        
        # Check cache first
        cached_result = cache.get(ticker)
        if cached_result:
            return jsonify(cached_result)
        
        print(f"\n{'='*50}")
        print(f"Analyzing sentiment for: {ticker}")
        print(f"{'='*50}")
        
        # Get company name — strip exchange suffix before lookup
        ticker_clean = ticker.replace('.NS', '').replace('.BO', '').replace('.BSE', '')
        company_name = config.TICKER_MAPPINGS.get(ticker_clean, ticker_clean)

        # Build search terms with variations; remove duplicates, preserve order
        search_terms = [
            ticker_clean,
            ticker_clean.lower(),
            company_name,
            company_name + " Limited",
            company_name + " Ltd",
        ]
        search_terms = list(dict.fromkeys(search_terms))

        # Collect news articles concurrently across all sources
        print("Collecting news articles (concurrent)...")
        news_articles = fetch_all_feeds_concurrent(search_terms)
        print(f"Found {len(news_articles)} news articles")
        
        # Collect Reddit posts (if enabled)
        reddit_posts = []
        if config.REDDIT_ENABLED:
            print("Collecting Reddit posts...")
            reddit_posts = reddit_collector.collect_posts(ticker, company_name)
            print(f"Found {len(reddit_posts)} Reddit posts")
        
        # Check if we have any data
        article_count = len(news_articles) + len(reddit_posts)
        if article_count == 0:
            return jsonify({
                "ticker":          ticker,
                "sentiment_score": None,
                "confidence":      None,
                "label":           None,
                "top_factors":     [],
                "article_count":   0,
                "status":          "NULL",
                "error":           "No articles found for this ticker across all sources"
            }), 200
            # NOTE: status NULL (not 4xx) so Spring Boot graceful degradation
            # handles this correctly — Portfolio Manager redistributes
            # sentiment's 40% weight to Technical and Fundamental agents.
        
        # Analyze news sentiments
        news_sentiments = []
        news_sources = []
        scored_headlines = []

        if news_articles:
            print("Analyzing news sentiment...")
            texts = [article['sentiment_text'] for article in news_articles]
            sentiments = analyzer.analyze_batch(texts)
            
            for article, sentiment in zip(news_articles, sentiments):
                news_sentiments.append(sentiment)
                news_sources.append({
                    "title": article['title'],
                    "source": article['source'],
                    "sentiment": sentiment['label'].upper(),
                    "score": round(sentiment['sentiment_score'], 3),
                    "url": article.get('url', '')
                })
                # Build scored_headlines for top_factors extraction
                scored_headlines.append({
                    "headline":   article['title'],
                    "label":      sentiment['label'].lower(),
                    "confidence": sentiment['sentiment_score'] if sentiment['label'].lower() == 'negative'
                                  else sentiment.get('confidence', abs(sentiment['sentiment_score']))
                })
        
        # Analyze Reddit sentiments
        social_sentiments = []
        social_sources = []
        
        if reddit_posts:
            print("Analyzing social media sentiment...")
            texts = [post['sentiment_text'] for post in reddit_posts]
            sentiments = analyzer.analyze_batch(texts)
            
            for post, sentiment in zip(reddit_posts, sentiments):
                social_sentiments.append(sentiment)
                social_sources.append({
                    "title": post['title'],
                    "source": f"r/{post['subreddit']}",
                    "sentiment": sentiment['label'].upper(),
                    "score": round(sentiment['score'], 3),
                    "url": post.get('url', ''),
                    "upvotes": post.get('score', 0)
                })
        
        # Aggregate sentiments with weights
        print("Aggregating sentiments...")
        
        all_sentiments = []
        all_weights = []
        
        # Add news sentiments with news weight
        if news_sentiments:
            news_weight_per_item = config.NEWS_WEIGHT / len(news_sentiments)
            all_sentiments.extend(news_sentiments)
            all_weights.extend([news_weight_per_item] * len(news_sentiments))
        
        # Add social sentiments with social weight
        if social_sentiments:
            social_weight_per_item = config.SOCIAL_WEIGHT / len(social_sentiments)
            all_sentiments.extend(social_sentiments)
            all_weights.extend([social_weight_per_item] * len(social_sentiments))
        
        # Get aggregated scores
        final_scores = analyzer.aggregate_sentiments(all_sentiments, all_weights)
        
        # Classify overall sentiment
        overall_sentiment = analyzer.classify_sentiment(final_scores)
        
        # Calculate confidence (max score)
        confidence = max(
            final_scores['positive'],
            final_scores['negative'],
            final_scores['neutral']
        )
        
        # Build response
        if overall_sentiment == "BULLISH":
            final_label = "positive"
            sentiment_sc = round(confidence, 4)
        elif overall_sentiment == "BEARISH":
            final_label = "negative"
            sentiment_sc = round(-confidence, 4)
        else:
            final_label = "neutral"
            sentiment_sc = 0.0
            
        result = {
            "sentiment_score": sentiment_sc,
            "confidence":      round(confidence, 4),
            "label":           final_label,
            "top_factors":     extract_top_factors(scored_headlines),
            "status":          "OK",
            "error":           None
        }
        
        # Cache the result
        cache.set(ticker, result)
        
        print(f"\n✓ Sentiment Analysis Complete!")
        print(f"  Overall: {overall_sentiment}")
        print(f"  Positive: {final_scores['positive']:.2%}")
        print(f"  Negative: {final_scores['negative']:.2%}")
        print(f"  Neutral: {final_scores['neutral']:.2%}")
        print(f"{'='*50}\n")
        
        return jsonify(result)
    
    except Exception as e:
        print(f"Error in sentiment analysis: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "sentiment_score": None,
            "confidence":      None,
            "label":           None,
            "top_factors":     [],
            "status":          "NULL",
            "error":           str(e)
        }), 200

@app.route('/cache-stats', methods=['GET'])
def get_cache_stats():
    """
    Get cache statistics
    """
    return jsonify(cache.get_stats())

@app.route('/clear-cache', methods=['POST'])
def clear_cache():
    """
    Clear sentiment cache
    """
    cache.clear()
    return jsonify({"message": "Cache cleared successfully"})

@app.route('/api/v1/model-info', methods=['GET'])
def model_info():
    """
    Get detailed model information
    """
    info = get_model_info()
    return jsonify(info)

@app.route('/api/v1/test-finetuned', methods=['POST'])
def test_finetuned():
    """
    Test the fine-tuned model directly (bypass cache)
    
    Request Body:
        {
            "text": "The company reported strong earnings growth."
        }
    
    Response:
        {
            "text": "...",
            "sentiment": "POSITIVE",
            "score": 0.85,
            "model": "financial-sentiment"
        }
    """
    try:
        data = request.get_json()
        text = data.get('text', '')
        
        if not text:
            return jsonify({"error": "Text is required"}), 400
        
        # Get current model info
        info = get_model_info()
        
        # Analyze with current analyzer
        result = analyzer.analyze_text(text)
        
        return jsonify({
            "text": text,
            "sentiment": result['label'].upper(),
            "score": result['sentiment_score'],
            "model": info.get("model_name", "unknown"),
            "active_model": info.get("active_model", "unknown"),
            "timestamp": datetime.now().isoformat()
        })
        
    except Exception as e:
        print(f"Error in test endpoint: {e}")
        import traceback
        traceback.print_exc()
        
        return jsonify({
            "error": "Internal server error",
            "message": str(e)
        }), 500


if __name__ == '__main__':
    print("\n" + "=" * 50)
    print("Starting Flask Server on port", config.PORT)
    print("=" * 50 + "\n")
    
    app.run(
        host=config.HOST,
        port=config.PORT,
        debug=config.DEBUG
    )
