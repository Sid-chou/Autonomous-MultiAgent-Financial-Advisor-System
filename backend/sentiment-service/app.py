"""
Sentiment Analysis Flask Service
Main application for analyzing Indian stock market sentiment
"""
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import config

# Import modules
from models.analyzer_factory import analyzer, get_model_info
from collectors.news_collector import NewsCollector
from collectors.reddit_collector import RedditCollector
from cache.cache_manager import cache

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for Spring Boot integration

# Initialize collectors
news_collector = NewsCollector()
reddit_collector = RedditCollector()

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
        
        # Get company name
        company_name = config.TICKER_MAPPINGS.get(ticker, ticker)
        
        # Collect news articles
        print("Collecting news articles...")
        news_articles = news_collector.collect_news(ticker, company_name)
        print(f"Found {len(news_articles)} news articles")
        
        # Collect Reddit posts (if enabled)
        reddit_posts = []
        if config.REDDIT_ENABLED:
            print("Collecting Reddit posts...")
            reddit_posts = reddit_collector.collect_posts(ticker, company_name)
            print(f"Found {len(reddit_posts)} Reddit posts")
        
        # Check if we have any data
        if len(news_articles) == 0 and len(reddit_posts) == 0:
            return jsonify({
                "ticker": ticker,
                "overallSentiment": "NEUTRAL",
                "positiveScore": 0.33,
                "negativeScore": 0.33,
                "neutralScore": 0.34,
                "confidenceScore": 0.0,
                "newsCount": 0,
                "socialCount": 0,
                "sources": [],
                "message": "No recent news or social media data found",
                "timestamp": datetime.now().isoformat()
            })
        
        # Analyze news sentiments
        news_sentiments = []
        news_sources = []
        
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
                    "score": round(sentiment['score'], 3),
                    "url": article.get('url', '')
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
        result = {
            "ticker": ticker,
            "companyName": company_name,
            "overallSentiment": overall_sentiment,
            "positiveScore": final_scores['positive'],
            "negativeScore": final_scores['negative'],
            "neutralScore": final_scores['neutral'],
            "confidenceScore": round(confidence, 4),
            "newsCount": len(news_articles),
            "socialCount": len(reddit_posts),
            "sources": {
                "news": news_sources[:10],  # Top 10 news
                "social": social_sources[:10]  # Top 10 social
            },
            "timestamp": datetime.now().isoformat()
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
            "error": "Internal server error",
            "message": str(e)
        }), 500

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
            "score": result['score'],
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
