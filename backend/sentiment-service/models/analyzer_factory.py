"""
Analyzer Factory
Selects the appropriate sentiment analyzer based on configuration
"""
import config
# from models.ollama_analyzer import ollama_analyzer  # DISABLED — see note below
from models.sentiment_analyzer import finbert_analyzer

# Ollama disabled — FinBERT fine-tuned on Indian financial headlines
# is the primary model for this agent.
# Model path: models/finbert_indian_best/
# Accuracy: 77% on validation set
# Re-enable Ollama only if FinBERT path is unavailable (future fallback)


def get_analyzer():
    """
    Returns the active sentiment analyzer.
    FinBERT is unconditionally used — Ollama is disabled.
    """
    print("Using FinBERT (models/finbert_indian_best/) — primary model")
    return finbert_analyzer


def get_model_info():
    """
    Get information about the currently active model.
    """
    return {
        "active_model": "finbert",
        "model_name": config.MODEL_NAME,
        "provider": "HuggingFace Transformers",
        "api_url": "local",
        "fallback_available": False
    }


# Initialize the analyzer
analyzer = get_analyzer()
