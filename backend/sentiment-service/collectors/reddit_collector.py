"""
Reddit Collector for Indian Stock Market Sentiment
Collects posts/comments from r/IndiaInvestments and r/IndianStockMarket
"""
import praw
from datetime import datetime, timedelta
import config

class RedditCollector:
    
    def __init__(self):
        self.enabled = config.REDDIT_ENABLED
        self.reddit = None
        
        if self.enabled:
            try:
                self.reddit = praw.Reddit(
                    client_id=config.REDDIT_CLIENT_ID,
                    client_secret=config.REDDIT_CLIENT_SECRET,
                    user_agent=config.REDDIT_USER_AGENT
                )
                print("Reddit API connected successfully!")
            except Exception as e:
                print(f"Reddit API connection failed: {e}")
                self.enabled = False
    
    def collect_posts(self, ticker, company_name=None):
        """
        Collect Reddit posts about a ticker
        
        Args:
            ticker (str): Stock ticker
            company_name (str, optional): Company name
            
        Returns:
            list: List of posts with {title, text, sentiment_text, url, score}
        """
        if not self.enabled or not self.reddit:
            return []
        
        if not company_name:
            company_name = config.TICKER_MAPPINGS.get(ticker, ticker)
        
        search_terms = [ticker, company_name]
        all_posts = []
        
        for subreddit_name in config.REDDIT_SUBREDDITS:
            try:
                posts = self._search_subreddit(subreddit_name, search_terms)
                all_posts.extend(posts)
            except Exception as e:
                print(f"Error searching r/{subreddit_name}: {e}")
        
        # Sort by Reddit score (upvotes) and limit
        all_posts = sorted(all_posts, key=lambda x: x['score'], reverse=True)
        return all_posts[:config.MAX_REDDIT_POSTS]
    
    def _search_subreddit(self, subreddit_name, search_terms):
        """
        Search a subreddit for posts matching search terms
        
        Args:
            subreddit_name (str): Name of subreddit
            search_terms (list): Terms to search for
            
        Returns:
            list: Matching posts
        """
        posts = []
        
        try:
            subreddit = self.reddit.subreddit(subreddit_name)
            
            # Search for each term
            for term in search_terms:
                # Search recent posts (last 7 days)
                search_results = subreddit.search(
                    term,
                    time_filter='week',
                    limit=20
                )
                
                for submission in search_results:
                    # Combine title and selftext for sentiment
                    sentiment_text = f"{submission.title}. {submission.selftext}"
                    
                    posts.append({
                        'title': submission.title,
                        'text': submission.selftext,
                        'sentiment_text': sentiment_text,
                        'url': f"https://reddit.com{submission.permalink}",
                        'score': submission.score,
                        'subreddit': subreddit_name,
                        'created': datetime.fromtimestamp(submission.created_utc)
                    })
        
        except Exception as e:
            print(f"Subreddit search error: {e}")
        
        return posts
    
    def get_trending_stocks(self, limit=10):
        """
        Get trending stock tickers from Indian investment subreddits
        (Optional feature for future use)
        
        Args:
            limit (int): Number of trending stocks to return
            
        Returns:
            dict: {ticker: mention_count}
        """
        if not self.enabled or not self.reddit:
            return {}
        
        ticker_mentions = {}
        
        for subreddit_name in config.REDDIT_SUBREDDITS:
            try:
                subreddit = self.reddit.subreddit(subreddit_name)
                
                # Get hot posts
                for submission in subreddit.hot(limit=50):
                    # Extract ticker mentions (simple pattern matching)
                    text = f"{submission.title} {submission.selftext}"
                    
                    for ticker in config.TICKER_MAPPINGS.keys():
                        if ticker in text.upper():
                            ticker_mentions[ticker] = ticker_mentions.get(ticker, 0) + 1
            
            except Exception as e:
                print(f"Error getting trending from r/{subreddit_name}: {e}")
        
        # Sort by mention count
        sorted_tickers = sorted(
            ticker_mentions.items(),
            key=lambda x: x[1],
            reverse=True
        )
        
        return dict(sorted_tickers[:limit])
