"""
FinBERT Sentiment Analyzer
Wrapper for FinBERT model from Hugging Face
Used as fallback when fine-tuned model is unavailable
"""
from transformers import AutoTokenizer, AutoModelForSequenceClassification, pipeline
import torch
import config
import os

class FinBERTAnalyzer:
    _instance = None  # Singleton pattern
    
    def __new__(cls):
        if cls._instance is None:
            cls._instance = super(FinBERTAnalyzer, cls).__new__(cls)
            cls._instance._initialized = False
        return cls._instance
    
    def __init__(self):
        if self._initialized:
            return
        
        print(f"Loading local FinBERT model...")
        
        # Local model path — relative to sentiment_analyzer.py location
        BASE_DIR = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
        MODEL_PATH = os.path.join(BASE_DIR, 'models', 'finbert_indian_best')
        
        ID2LABEL = {0: "negative", 1: "neutral", 2: "positive"}
        LABEL2ID = {"negative": 0, "neutral": 1, "positive": 2}

        # Load FinBERT model and tokenizer
        self.tokenizer = AutoTokenizer.from_pretrained(MODEL_PATH)
        self.model = AutoModelForSequenceClassification.from_pretrained(
            MODEL_PATH,
            id2label=ID2LABEL,
            label2id=LABEL2ID
        )
        
        # Create sentiment analysis pipeline
        self.analyzer = pipeline(
            "text-classification",
            model=self.model,
            tokenizer=self.tokenizer,
            device=0 if torch.cuda.is_available() else -1  # GPU if available
        )
        
        print("FinBERT local model loaded successfully!")
        self._initialized = True
    
    def convert_to_sentiment_score(self, label: str, confidence: float) -> float:
        if label == "positive":
            return round(confidence, 4)
        elif label == "negative":
            return round(-confidence, 4)
        else:  # neutral
            return 0.0

    def analyze_text(self, text):
        """
        Analyze sentiment of a single text
        
        Args:
            text (str): Text to analyze
            
        Returns:
            dict: {label: str, score: float}
        """
        if not text or len(text.strip()) == 0:
            return {"label": "neutral", "score": 0.5}
        
        # Truncate text to max length
        text = text[:config.MAX_LENGTH]
        
        try:
            result = self.analyzer(text)[0]
            label = result['label'].lower()
            confidence = float(result['score'])
            sentiment_score = self.convert_to_sentiment_score(label, confidence)
            
            return {
                "sentiment_score": sentiment_score,
                "confidence": confidence,
                "label": label,
                "status": "OK",
                "error": None
            }
        except Exception as e:
            print(f"Error analyzing text: {e}")
            return {
                "sentiment_score": None,
                "confidence": None,
                "label": None,
                "status": "NULL",
                "error": str(e)
            }
    
    def analyze_batch(self, texts):
        """
        Analyze sentiment of multiple texts
        
        Args:
            texts (list): List of texts to analyze
            
        Returns:
            list: List of {label: str, score: float} dicts
        """
        if not texts:
            return []
        
        # Truncate all texts
        texts = [text[:config.MAX_LENGTH] if text else "" for text in texts]
        
        try:
            results = self.analyzer(texts)
            output = []
            for r in results:
                label = r['label'].lower()
                confidence = float(r['score'])
                sentiment_score = self.convert_to_sentiment_score(label, confidence)
                output.append({
                    "sentiment_score": sentiment_score,
                    "confidence": confidence,
                    "label": label,
                    "status": "OK",
                    "error": None
                })
            return output
        except Exception as e:
            print(f"Error in batch analysis: {e}")
            return [{
                "sentiment_score": None,
                "confidence": None,
                "label": None,
                "status": "NULL",
                "error": str(e)
            } for _ in texts]
    
    def aggregate_sentiments(self, sentiments, weights=None):
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
            if sentiment.get("status") == "NULL":
                continue
                
            label = sentiment['label']
            confidence = sentiment['confidence']
            
            if label == 'positive':
                positive_score += confidence * weight
            elif label == 'negative':
                negative_score += confidence * weight
            else:  # neutral
                neutral_score += confidence * weight
        
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
    
    def classify_sentiment(self, scores):
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
finbert_analyzer = FinBERTAnalyzer()
