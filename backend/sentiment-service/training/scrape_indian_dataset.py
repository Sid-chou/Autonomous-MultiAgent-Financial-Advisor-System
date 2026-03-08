"""
Enhanced Indian Financial Dataset Scraper - Scales to 10,000+ articles
Supports: RSS feeds, Web archives, News APIs, Multi-day collection
"""
import requests
from bs4 import BeautifulSoup
import feedparser
import pandas as pd
from datetime import datetime, timedelta
import time
import re
import os
from typing import List, Dict



# Optional: News API
# Replace 'YOUR_API_KEY_HERE' with your actual key from newsapi.org
NEWS_API_KEY = 'a767cd3c6f85465890fb647bfbe69152'  # Get free key from https://newsapi.org/register


class EnhancedIndianScraper:
    """Enhanced scraper for large-scale data collection"""
    
    def __init__(self):
        self.headers = {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36'
        }
        self.all_articles = []
        self.seen_urls = set()  # Prevent duplicates
        
    def scrape_rss_feeds(self, max_articles=1000):
        """Scrape RSS feeds from Indian financial sources"""
        print("📰 Scraping RSS Feeds...")
        
        rss_sources = [
            {"name": "Moneycontrol", "url": "https://www.moneycontrol.com/rss/latestnews.xml"},
            {"name": "Economic Times", "url": "https://economictimes.indiatimes.com/rssfeedstopstories.cms"},
            {"name": "ET Markets", "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms"},
            {"name": "ET Stocks", "url": "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms"},
            {"name": "Business Standard", "url": "https://www.business-standard.com/rss/markets-106.rss"},
            {"name": "LiveMint Markets", "url": "https://www.livemint.com/rss/markets"},
            {"name": "LiveMint Money", "url": "https://www.livemint.com/rss/money"},
            {"name": "Financial Express", "url": "https://www.financialexpress.com/market/feed/"},
        ]
        
        for source in rss_sources:
            try:
                print(f"  Fetching from {source['name']}...")
                feed = feedparser.parse(source['url'])
                
                count = 0
                for entry in feed.entries:
                    url = entry.get('link', '')
                    
                    # Skip duplicates
                    if url in self.seen_urls:
                        continue
                    
                    article = {
                        'source': source['name'],
                        'source_type': 'news',
                        'title': entry.get('title', ''),
                        'text': BeautifulSoup(entry.get('summary', '') or entry.get('description', ''), 'html.parser').get_text(),
                        'url': url,
                        'published': entry.get('published', ''),
                        'collected_at': datetime.now().isoformat()
                    }
                    
                    article['full_text'] = f"{article['title']}. {article['text']}"
                    
                    self.all_articles.append(article)
                    self.seen_urls.add(url)
                    count += 1
                
                print(f"    ✓ {count} articles from {source['name']}")
                time.sleep(1)
                
            except Exception as e:
                print(f"    ✗ Error: {e}")
        
        print(f"✓ Total RSS: {len([a for a in self.all_articles if a['source_type'] == 'news'])}")
    
    def scrape_news_api(self, max_articles=5000):
        """Scrape using NewsAPI.org (requires free API key)"""
        if not NEWS_API_KEY:
            print("\n📡 NewsAPI skipped (no API key)")
            print("   Get free key: https://newsapi.org/register")
            return
        
        print("\n📡 Scraping NewsAPI...")
        
        queries = [
            "nifty OR sensex",
            "NSE OR BSE",
            "stock market india",
            "indian stocks",
            "reliance OR tcs OR infosys"
        ]
        
        # Can go back 30 days on free tier
        from_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')
        
        for query in queries:
            try:
                url = "https://newsapi.org/v2/everything"
                params = {
                    'q': query,
                    'from': from_date,
                    'language': 'en',
                    'sortBy': 'publishedAt',
                    'apiKey': NEWS_API_KEY,
                    'pageSize': 100
                }
                
                response = requests.get(url, params=params)
                
                if response.status_code == 200:
                    data = response.json()
                    count = 0
                    
                    for item in data.get('articles', []):
                        url = item.get('url', '')
                        if url in self.seen_urls:
                            continue
                        
                        article = {
                            'source': item.get('source', {}).get('name', 'NewsAPI'),
                            'source_type': 'news',
                            'title': item.get('title', ''),
                            'text': item.get('description', ''),
                            'url': url,
                            'published': item.get('publishedAt', ''),
                            'collected_at': datetime.now().isoformat(),
                            'full_text': f"{item.get('title', '')}. {item.get('description', '')}"
                        }
                        
                        self.all_articles.append(article)
                        self.seen_urls.add(url)
                        count += 1
                    
                    print(f"  ✓ {count} articles for '{query}'")
                    time.sleep(1)  # Rate limiting
                
            except Exception as e:
                print(f"  ✗ Error with '{query}': {e}")
        
        print(f"✓ Total NewsAPI: {len([a for a in self.all_articles if 'NewsAPI' in str(a.get('source'))])}")
    

    
    def scrape_reddit_bulk(self, max_posts=500):
        """Scrape more Reddit posts"""
        print("\n🔴 Scraping Reddit...")
        
        subreddits = [
            "IndiaInvestments",
            "IndianStockMarket",
            "StocksIndia",
            "IndianStreetBets"
        ]
        
        for subreddit in subreddits:
            try:
                print(f"  Fetching r/{subreddit}...")
                
                # Reddit RSS
                url = f"https://www.reddit.com/r/{subreddit}/hot.rss"
                feed = feedparser.parse(url)
                
                count = 0
                for entry in feed.entries:
                    url = entry.get('link', '')
                    if url in self.seen_urls:
                        continue
                    
                    article = {
                        'source': f'r/{subreddit}',
                        'source_type': 'social',
                        'title': entry.get('title', ''),
                        'text': BeautifulSoup(entry.get('summary', ''), 'html.parser').get_text(),
                        'url': url,
                        'published': entry.get('published', ''),
                        'collected_at': datetime.now().isoformat(),
                        'full_text': f"{entry.get('title', '')}. {BeautifulSoup(entry.get('summary', ''), 'html.parser').get_text()}"
                    }
                    
                    self.all_articles.append(article)
                    self.seen_urls.add(url)
                    count += 1
                
                print(f"    ✓ {count} posts")
                time.sleep(1)
                
            except Exception as e:
                print(f"    ✗ Error: {e}")
    
    def auto_label_sentiment(self, text):
        """Heuristic sentiment labeling"""
        text_lower = text.lower()
        
        positive = ['gain', 'surge', 'rally', 'beat', 'exceed', 'profit', 'growth', 'high', 'rise', 'jump', 'soar', 'positive', 'strong', 'boost', 'record', 'upgrade', 'bullish', 'recovery', 'expansion']
        negative = ['fall', 'drop', 'decline', 'loss', 'miss', 'plunge', 'crash', 'low', 'weak', 'downgrade', 'bearish', 'slump', 'cut', 'layoff', 'concern', 'worry', 'risk', 'debt', 'default', 'recession']
        
        pos_count = sum(1 for w in positive if w in text_lower)
        neg_count = sum(1 for w in negative if w in text_lower)
        
        if pos_count > neg_count + 1:
            return 'Positive'
        elif neg_count > pos_count + 1:
            return 'Negative'
        else:
            return 'Neutral'
    
    def save_to_csv(self, filename=None):
        """Save with deduplication and labeling - appends to existing file"""
        if filename is None:
            # Default: append to the main project dataset
            script_dir = os.path.dirname(os.path.abspath(__file__))
            filename = os.path.join(script_dir, 'datausing', 'final_labeled_project_data.csv')
        
        print(f"\n💾 Saving to {filename}...")
        
        if not self.all_articles:
            print("  ✗ No new articles!")
            return None
        
        # Add labels to new articles
        for article in self.all_articles:
            article['auto_sentiment'] = self.auto_label_sentiment(article['full_text'])
            article['manual_sentiment'] = ''
        
        new_df = pd.DataFrame(self.all_articles)
        
        # Check if file already exists
        if os.path.exists(filename):
            print(f"  📂 Found existing file, loading previous data...")
            existing_df = pd.read_csv(filename, encoding='utf-8')
            print(f"  📊 Existing articles: {len(existing_df)}")
            
            # Combine new and existing data
            combined_df = pd.concat([existing_df, new_df], ignore_index=True)
            
            # Remove duplicates by URL (keep first occurrence)
            before_dedup = len(combined_df)
            combined_df = combined_df.drop_duplicates(subset=['url'], keep='first')
            duplicates_removed = before_dedup - len(combined_df)
            
            print(f"  🔄 New articles scraped: {len(new_df)}")
            print(f"  🗑️  Duplicates removed: {duplicates_removed}")
            print(f"  ➕ Net new articles added: {len(new_df) - duplicates_removed}")
            
            df = combined_df
        else:
            print(f"  📄 Creating new file...")
            df = new_df.drop_duplicates(subset=['url'], keep='first')
        
        # Save combined data
        df.to_csv(filename, index=False, encoding='utf-8')
        
        print(f"\n✅ Total articles in dataset: {len(df)}")
        print(f"   News: {len(df[df['source_type'] == 'news'])}")
        print(f"   Social: {len(df[df['source_type'] == 'social'])}")
        print(f"\n   Sentiment Distribution:")
        print(f"   - Positive: {len(df[df['auto_sentiment'] == 'Positive'])}")
        print(f"   - Negative: {len(df[df['auto_sentiment'] == 'Negative'])}")
        print(f"   - Neutral: {len(df[df['auto_sentiment'] == 'Neutral'])}")
        
        return df


def main():
    """Main execution for large-scale scraping"""
    print("="*60)
    print("Enhanced Indian Financial Dataset Scraper")
    print("Target: 10,000+ Articles")
    print("="*60)
    
    scraper = EnhancedIndianScraper()
    
    # 1. RSS Feeds (800-1000 articles)
    scraper.scrape_rss_feeds(max_articles=1000)
    
    # 2. NewsAPI (if available - 3000-5000 articles)
    if NEWS_API_KEY:
        scraper.scrape_news_api(max_articles=5000)
    else:
        print("\n💡 Tip: Get NewsAPI key for 5000+ more articles")
        print("   https://newsapi.org/register (free)")
    
    # 3. Reddit (500 posts)
    scraper.scrape_reddit_bulk(max_posts=500)
    
    # 5. Save
    # Save / append to the final project dataset
    script_dir = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'datausing', 'final_labeled_project_data.csv')
    df = scraper.save_to_csv(output_path)
    
    print("\n" + "="*60)
    print("🎯 To reach 10,000+ articles:")
    print("="*60)
    if NEWS_API_KEY:
        print("✅ With NewsAPI: You should have 8,000-10,000 articles now!")
    else:
        print("📌 Option 1: Get NewsAPI key + rerun (will get 8k-10k)")
        print("📌 Option 2: Run this script daily for 7-10 days")
    print("="*60)


if __name__ == "__main__":
    main()
