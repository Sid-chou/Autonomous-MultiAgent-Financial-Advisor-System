"""
Analyzer Factory
Selects the appropriate sentiment analyzer based on configuration
"""
import config
from models.ollama_analyzer import ollama_analyzer
from models.sentiment_analyzer import finbert_analyzer


def get_analyzer():
    """
    Get the appropriate sentiment analyzer based on configuration
    
    Returns:
        Analyzer instance (OllamaAnalyzer or FinBERTAnalyzer)
    """
    # Try to use fine-tuned model if enabled
    if config.USE_FINETUNED_MODEL and ollama_analyzer.is_available():
        print("Using fine-tuned model via Ollama")
        return ollama_analyzer
    
    # Fallback to FinBERT
    if config.FALLBACK_TO_FINBERT:
        print("Using FinBERT (fallback model)")
        return finbert_analyzer
    
    # No analyzer available
    raise Exception("No sentiment analyzer available. Please enable Ollama or FinBERT fallback.")


def get_model_info():
    """
    Get information about the currently active model
    
    Returns:
        dict: Model information
    """
    if config.USE_FINETUNED_MODEL and ollama_analyzer.is_available():
        return {
            "active_model": "fine-tuned",
            "model_name": config.OLLAMA_MODEL_NAME,
            "provider": "Ollama",
            "api_url": config.OLLAMA_API_URL,
            "fallback_available": config.FALLBACK_TO_FINBERT
        }
    elif config.FALLBACK_TO_FINBERT:
        return {
            "active_model": "finbert",
            "model_name": config.MODEL_NAME,
            "provider": "HuggingFace Transformers",
            "api_url": "local",
            "fallback_available": False
        }
    else:
        return {
            "active_model": "none",
            "error": "No analyzer available"
        }


# Initialize the analyzer
analyzer = get_analyzer()
