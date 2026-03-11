def convert_to_score(valuation_signal: str, confidence: float) -> float:
    """Convert a valuation signal to a numeric score between -1.0 and 1.0.

    UNDERVALUED  →  +confidence  (bullish)
    OVERVALUED   →  -confidence  (bearish)
    FAIR         →   0.0         (neutral)
    """
    if valuation_signal == "UNDERVALUED":
        return round(confidence, 4)
    elif valuation_signal == "OVERVALUED":
        return round(-confidence, 4)
    else:  # FAIR
        return 0.0
