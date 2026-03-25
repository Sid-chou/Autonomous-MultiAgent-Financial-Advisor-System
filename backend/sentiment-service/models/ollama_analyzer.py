# THIS FILE IS CURRENTLY DISABLED
# Ollama is not used in the active pipeline.
# FinBERT (models/finbert_indian_best/) is the active model.
# This file is preserved for future reference only.

"""
Ollama-based Sentiment Analyzer
Uses the fine-tuned financial sentiment model via Ollama
"""
import requests
import re
import time
from typing import List, Dict, Optional
import config


class OllamaAnalyzer:
    _instance = None  # Singleton pattern
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(OllamaAnalyzer, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        self.api_url = f"{config.OLLAMA_API_URL}/api/generate"
        self.model_name = config.OLLAMA_MODEL_NAME
        self.timeout = config.OLLAMA_TIMEOUT
        self.available = self._check_availability()
        
        if self.available:
            print(f"✓ Ollama analyzer initialized successfully!")
            print(f"  Model: {self.model_name}")
            print(f"  API URL: {config.OLLAMA_API_URL}")
        else:
            print(f"✗ Ollama not available at {config.OLLAMA_API_URL}")
            if config.FALLBACK_TO_FINBERT:
                print(f"  Will use FinBERT as fallback")
        
        self._initialized = True
    
    def _check_availability(self) -> bool:
        """
        Check if Ollama service is running
        
        Returns:
            bool: True if Ollama is available, False otherwise
        """
        try:
            response = requests.get(
                f"{config.OLLAMA_API_URL}/api/tags",
                timeout=2
            )
            return response.status_code == 200
        except Exception:
            return False
    
    def is_available(self) -> bool:
        """
        Check if Ollama analyzer is available
        
        Returns:
            bool: True if available
        """
        return self.available
    
    def _parse_output(self, response_text: str) -> str:
        """
        Parse Ollama output to extract sentiment label
        Ensures strict format compliance (Positive/Negative/Neutral)
        
        Args:
            response_text (str): Raw response from Ollama
            
        Returns:
            str: Normalized sentiment label (positive/negative/neutral)
        """
        # Convert to lowercase for matching
        text = response_text.lower().strip()
        
        # Try exact word match first
        if 'positive' in text:
            return 'positive'
        elif 'negative' in text:
            return 'negative'
        elif 'neutral' in text:
            return 'neutral'
        
        # Try to extract first word
        words = re.findall(r'\b\w+\b', text)
        if words:
            first_word = words[0].lower()
            if first_word in ['positive', 'negative', 'neutral']:
                return first_word
        
        # Default to neutral if parsing fails
        print(f"Warning: Could not parse output '{response_text}', defaulting to neutral")
        return 'neutral'
    
    def analyze_text(self, text: str) -> Dict[str, any]:
        """
        Analyze sentiment of a single text using Ollama
        
        Args:
            text (str): Text to analyze
            
        Returns:
            dict: {label: str, score: float}
        """
        if not text or len(text.strip()) == 0:
            return {"label": "neutral", "score": 0.5}
        
        if not self.available:
            print("Warning: Ollama not available, cannot analyze")
            return {"label": "neutral", "score": 0.0}
        
        try:
            # Prepare the prompt
            prompt = f"{config.OLLAMA_SYSTEM_PROMPT}\n\nText to analyze: {text}\n\nSentiment:"
            
            # Call Ollama API
            response = requests.post(
                self.api_url,
                json={
                    "model": self.model_name,
                    "prompt": prompt,
                    "stream": False,
                    "options": {
                        "temperature": config.OLLAMA_TEMPERATURE
                    }
                },
                timeout=self.timeout
            )
            
            if response.status_code != 200:
                print(f"Ollama API error: {response.status_code}")
                return {"label": "neutral", "score": 0.0}
            
            result = response.json()
            output = result.get('response', '').strip()
            
            # Parse the output
            label = self._parse_output(output)
            
            # Assign confidence score based on label
            # Fine-tuned models are generally high confidence
            score = 0.85 if label != 'neutral' else 0.70
            
            return {
                "label": label,
                "score": score
            }
            
        except requests.Timeout:
            print(f"Ollama request timeout after {self.timeout}s")
            return {"label": "neutral", "score": 0.0}
        except Exception as e:
            print(f"Error analyzing text with Ollama: {e}")
            return {"label": "neutral", "score": 0.0}
    
    def analyze_batch(self, texts: List[str]) -> List[Dict[str, any]]:
        """
        Analyze sentiment of multiple texts
        
        Args:
            texts (list): List of texts to analyze
            
        Returns:
            list: List of {label: str, score: float} dicts
        """
        if not texts:
            return []
        
        if not self.available:
            print("Warning: Ollama not available, returning neutral for all")
            return [{"label": "neutral", "score": 0.0} for _ in texts]
        
        results = []
        for text in texts:
            result = self.analyze_text(text)
            results.append(result)
            # Small delay to avoid overwhelming the service
            time.sleep(0.05)
        
        return results
    
    def aggregate_sentiments(self, sentiments: List[Dict], weights: Optional[List[float]] = None) -> Dict:
        """
        Aggregate multiple sentiment scores
        
        Args:
            sentiments (list): List of sentiment dicts
            weights (list, optional): Weight for each sentiment
            
        Returns:
            dict: Aggregated sentiment scores
        """
        if not sentiments:
            return {
                "positive": 0.33,
                "negative": 0.33,
                "neutral": 0.34
            }
        
        if weights is None:
            weights = [1.0] * len(sentiments)
        
        # Normalize weights
        total_weight = sum(weights)
        weights = [w / total_weight for w in weights]
        
        # Calculate weighted scores
        positive_score = 0.0
        negative_score = 0.0
        neutral_score = 0.0
        
        for sentiment, weight in zip(sentiments, weights):
            label = sentiment['label']
            score = sentiment['score']
            
            if label == 'positive':
                positive_score += score * weight
            elif label == 'negative':
                negative_score += score * weight
            else:  # neutral
                neutral_score += score * weight
        
        # Normalize to sum to 1.0
        total = positive_score + negative_score + neutral_score
        if total > 0:
            positive_score /= total
            negative_score /= total
            neutral_score /= total
        
        return {
            "positive": round(positive_score, 4),
            "negative": round(negative_score, 4),
            "neutral": round(neutral_score, 4)
        }
    
    def classify_sentiment(self, scores: Dict[str, float]) -> str:
        """
        Classify overall sentiment based on scores
        
        Args:
            scores (dict): {positive, negative, neutral}
            
        Returns:
            str: BULLISH, BEARISH, or NEUTRAL
        """
        pos = scores['positive']
        neg = scores['negative']
        
        if pos >= config.BULLISH_THRESHOLD:
            return "BULLISH"
        elif neg >= config.BEARISH_THRESHOLD:
            return "BEARISH"
        else:
            return "NEUTRAL"


# Global instance
ollama_analyzer = OllamaAnalyzer()
