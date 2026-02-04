"""
Cache Manager for Sentiment Analysis Results
In-memory cache with TTL to reduce API calls and processing time
"""
from cachetools import TTLCache
from datetime import datetime
import config

class CacheManager:
    _instance = None  # Singleton pattern
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(CacheManager, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        # Create TTL cache (maxsize, ttl_seconds)
        self.cache = TTLCache(
            maxsize=config.CACHE_MAX_SIZE,
            ttl=config.CACHE_TTL_SECONDS
        )
        
        self.hits = 0
        self.misses = 0
        self._initialized = True
        
        print(f"Cache initialized: max_size={config.CACHE_MAX_SIZE}, ttl={config.CACHE_TTL_SECONDS}s")
    
    def get(self, ticker):
        """
        Get cached sentiment for a ticker
        
        Args:
            ticker (str): Stock ticker
            
        Returns:
            dict or None: Cached sentiment data
        """
        key = self._make_key(ticker)
        
        if key in self.cache:
            self.hits += 1
            cached_data = self.cache[key]
            print(f"Cache HIT for {ticker}")
            return cached_data
        else:
            self.misses += 1
            print(f"Cache MISS for {ticker}")
            return None
    
    def set(self, ticker, data):
        """
        Cache sentiment data for a ticker
        
        Args:
            ticker (str): Stock ticker
            data (dict): Sentiment data to cache
        """
        key = self._make_key(ticker)
        
        # Add timestamp to data
        data['cached_at'] = datetime.now().isoformat()
        
        self.cache[key] = data
        print(f"Cached sentiment for {ticker}")
    
    def invalidate(self, ticker):
        """
        Invalidate cache for a specific ticker
        
        Args:
            ticker (str): Stock ticker
        """
        key = self._make_key(ticker)
        
        if key in self.cache:
            del self.cache[key]
            print(f"Cache invalidated for {ticker}")
    
    def clear(self):
        """
        Clear entire cache
        """
        self.cache.clear()
        self.hits = 0
        self.misses = 0
        print("Cache cleared")
    
    def get_stats(self):
        """
        Get cache statistics
        
        Returns:
            dict: Cache stats
        """
        total_requests = self.hits + self.misses
        hit_rate = (self.hits / total_requests * 100) if total_requests > 0 else 0
        
        return {
            "size": len(self.cache),
            "max_size": config.CACHE_MAX_SIZE,
            "ttl_seconds": config.CACHE_TTL_SECONDS,
            "hits": self.hits,
            "misses": self.misses,
            "total_requests": total_requests,
            "hit_rate_percent": round(hit_rate, 2)
        }
    
    def _make_key(self, ticker):
        """
        Create cache key for ticker
        
        Args:
            ticker (str): Stock ticker
            
        Returns:
            str: Cache key
        """
        return f"sentiment:{ticker.upper()}"

# Global instance
cache = CacheManager()
