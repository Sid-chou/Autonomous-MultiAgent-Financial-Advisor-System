"""
News Collector for Indian Financial Markets
Collects news from RSS feeds (Moneycontrol, ET, Business Standard)
"""
import feedparser
import requests
from bs4 import BeautifulSoup
from datetime import datetime, timedelta
import config

class NewsCollector:
    
    def __init__(self):
        self.sources = config.NEWS_SOURCES
        self.timeout = config.REQUEST_TIMEOUT
    
    def collect_news(self, ticker, company_name=None):
        """
        Collect news articles for a specific ticker
        
        Args:
            ticker (str): Stock ticker (e.g., "RELIANCE")
            company_name (str, optional): Company name for better matching
            
        Returns:
            list: List of news articles with {title, summary, source, sentiment_text, url}
        """
        if not company_name:
            company_name = config.TICKER_MAPPINGS.get(ticker, ticker)
        
        search_terms = [ticker, company_name]
        all_articles = []
        
        for source in self.sources:
            try:
                articles = self._fetch_rss(source, search_terms)
                all_articles.extend(articles)
            except Exception as e:
                print(f"Error fetching from {source['name']}: {e}")
        
        # Sort by relevance (title match) and limit
        all_articles = self._rank_articles(all_articles, search_terms)
        return all_articles[:config.MAX_NEWS_ARTICLES]
    
    def _fetch_rss(self, source, search_terms):
        """
        Fetch and parse RSS feed
        
        Args:
            source (dict): Source configuration
            search_terms (list): Terms to search for
            
        Returns:
            list: Matching articles
        """
        articles = []
        
        try:
            feed = feedparser.parse(source['url'])
            
            for entry in feed.entries:
                title = entry.get('title', '')
                summary = entry.get('summary', entry.get('description', ''))
                link = entry.get('link', '')
                
                # Check if any search term is in title or summary
                if self._matches_search(title + ' ' + summary, search_terms):
                    # Combine title and summary for sentiment analysis
                    sentiment_text = f"{title}. {summary}"
                    
                    articles.append({
                        'title': title,
                        'summary': summary,
                        'source': source['name'],
                        'sentiment_text': sentiment_text,
                        'url': link,
                        'weight': source['weight']
                    })
        
        except Exception as e:
            print(f"RSS parsing error for {source['url']}: {e}")
        
        return articles
    
    def _matches_search(self, text, search_terms):
        """
        Check if text matches any search term
        
        Args:
            text (str): Text to search in
            search_terms (list): Terms to search for
            
        Returns:
            bool: True if any term found
        """
        text = text.lower()
        for term in search_terms:
            if term.lower() in text:
                return True
        return False
    
    def _rank_articles(self, articles, search_terms):
        """
        Rank articles by relevance
        
        Args:
            articles (list): Articles to rank
            search_terms (list): Search terms
            
        Returns:
            list: Sorted articles
        """
        def relevance_score(article):
            text = (article['title'] + ' ' + article['summary']).lower()
            score = 0
            
            for term in search_terms:
                term_lower = term.lower()
                # Title match is worth more
                score += article['title'].lower().count(term_lower) * 2
                # Summary match
                score += article['summary'].lower().count(term_lower)
            
            return score
        
        return sorted(articles, key=relevance_score, reverse=True)
    
    def get_sample_news(self):
        """
        Get sample recent news (for testing)
        
        Returns:
            list: Recent news articles
        """
        articles = []
        
        for source in self.sources:
            try:
                feed = feedparser.parse(source['url'])
                for entry in feed.entries[:5]:  # Get top 5 from each source
                    articles.append({
                        'title': entry.get('title', ''),
                        'summary': entry.get('summary', ''),
                        'source': source['name'],
                        'url': entry.get('link', '')
                    })
            except Exception as e:
                print(f"Error fetching sample from {source['name']}: {e}")
        
        return articles
