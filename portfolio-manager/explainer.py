import json
import logging
import os

from groq import Groq

logger = logging.getLogger(__name__)


def _get_groq_client():
    """Lazily initialize Groq client. Returns None if API key is missing."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key or api_key == "your_groq_key_here":
        return None
    return Groq(api_key=api_key)


def generate_reasoning(ticker, calculation_result, technical_report, fundamental_report):
    """
    Call Groq to generate a plain English reasoning explanation.
    Returns reasoning string and confidence float.
    Pure explanation only — no calculations done here.
    """
    decision        = calculation_result["decision"]
    score           = calculation_result["decision_score"]
    regime_label    = calculation_result["regime_label"]
    weights         = calculation_result["weights"]
    contributions   = calculation_result["contributions"]
    pipeline_status = calculation_result["pipeline_status"]

    # Build context string for partial pipeline
    degradation_note = ""
    if pipeline_status == "PARTIAL":
        null_agents = [
            k for k, v in calculation_result["agent_statuses"].items()
            if v == "NULL"
        ]
        degradation_note = f"Note: The following agents were unavailable: {', '.join(null_agents)}. Weights were redistributed."

    prompt = f"""
You are a Portfolio Manager in a multi-agent financial advisory system for Indian stock markets.

You have computed the following analysis for {ticker}:

Decision: {decision}
Decision Score: {score} (scale: -1.0 to +1.0, threshold: BUY above 0.3, SELL below -0.3)
Market Regime: {regime_label}

Agent Contributions:
- Sentiment contribution: {contributions['sentiment_contribution']} (weight: {weights['w1_sentiment']})
- Technical contribution: {contributions['technical_contribution']} (weight: {weights['w2_technical']})
- Fundamental contribution: {contributions['fundamental_contribution']} (weight: {weights['w3_fundamental']})

Technical context:
- RSI: {technical_report.get('rsi', 'N/A')}
- MACD Signal: {technical_report.get('macd_signal', 'N/A')}
- ATR Z-Score: {technical_report.get('atr_zscore', 'N/A')}

Fundamental context:
- Valuation: {fundamental_report.get('valuation_signal', 'N/A')}
- PE Ratio: {fundamental_report.get('pe_ratio', 'N/A')}
- Revenue Growth: {fundamental_report.get('revenue_growth', 'N/A')}
- Profit Margins: {fundamental_report.get('profit_margins', 'N/A')}

{degradation_note}

Write a clear 2 to 3 sentence explanation of why this decision was reached.
- Reference the actual numbers
- Mention the market regime if it affected the weights
- Mention any data unavailability if pipeline was PARTIAL
- Be direct and professional
- Do not repeat the decision word at the start

Return valid JSON only. No markdown. No preamble.

{{
  "reasoning": "your 2-3 sentence explanation here",
  "confidence": 0.0 to 1.0
}}
"""

    try:
        client = _get_groq_client()
        if client is None:
            logger.info(f"Groq API key not configured, using fallback reasoning for {ticker}")
            return _fallback_reasoning(calculation_result), calculation_result["confidence"]

        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": "You are a financial analyst. Always respond with valid JSON only. No markdown. No extra text."
                },
                {
                    "role": "user",
                    "content": prompt
                }
            ],
            temperature=0.2,
            max_tokens=300
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        return (
            result.get("reasoning", "Analysis complete."),
            result.get("confidence", calculation_result["confidence"])
        )

    except Exception as e:
        logger.warning(f"Groq reasoning failed for {ticker}: {e}")
        # Fallback — generate basic reasoning without LLM
        return _fallback_reasoning(calculation_result), calculation_result["confidence"]


def _fallback_reasoning(calc):
    """
    Pure Python fallback reasoning when Groq is unavailable.
    No LLM — just string formatting from the calculation data.
    """
    decision = calc["decision"]
    score    = calc["decision_score"]
    regime   = calc["regime_label"]
    contribs = calc["contributions"]

    dominant = max(contribs, key=contribs.get)
    dominant_label = dominant.replace("_contribution", "").capitalize()

    return (
        f"Decision score of {score:.3f} in a {regime} market regime. "
        f"{dominant_label} analysis was the dominant signal. "
        f"{'Insufficient data reduced confidence.' if calc['pipeline_status'] == 'PARTIAL' else ''}"
    ).strip()
