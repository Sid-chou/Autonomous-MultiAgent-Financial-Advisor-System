"""
Translator — Groq prompt builder and caller for User Liaison Agent.
Translates system output into plain English for Indian retail investors.
LLM: Groq Llama 3.3 70B — untrained, prompt engineering only.
"""

import json
import logging
import os

from groq import Groq

logger = logging.getLogger(__name__)
client = Groq(api_key=os.environ.get("GROQ_API_KEY"))


# ---------------------------------------------------------------------------
# Warning Translation Map
# ---------------------------------------------------------------------------
WARNING_TRANSLATIONS = {
    "available cash":  "Investment reduced to match your available funds.",
    "panic":           "Investment halved due to market volatility.",
    "exposure":        "Investment reduced to keep your holdings balanced.",
}


def _translate_warnings(warnings):
    """Map internal warning strings to plain-English versions."""
    translated = []
    for w in warnings:
        matched = False
        for key, plain in WARNING_TRANSLATIONS.items():
            if key in w.lower():
                translated.append(plain)
                matched = True
                break
        if not matched:
            translated.append(w)
    return translated


# ---------------------------------------------------------------------------
# Prompt Builder
# ---------------------------------------------------------------------------
def build_prompt(data, flags):
    """
    Build the Groq system + user prompt from agent reports and edge flags.
    Returns (prompt_string, data_quality_note).
    """
    portfolio    = data.get("portfolio_report", {})
    risk         = data.get("risk_report", {})
    technical    = data.get("technical_report", {})
    fundamental  = data.get("fundamental_report", {})
    sentiment    = data.get("sentiment_report", {})
    user_profile = data.get("user_profile", {})

    company         = data.get("company_name", data.get("ticker"))
    decision        = "BLOCKED" if flags["is_blocked"] else portfolio.get("decision")
    adjusted_amount = risk.get("adjusted_amount")
    block_reason    = risk.get("block_reason")
    warnings        = risk.get("warnings", [])

    translated_warnings = _translate_warnings(warnings)

    # Build data quality note
    data_quality = None
    if flags["is_partial"]:
        missing = " and ".join(flags["null_agents"])
        data_quality = (
            f"{missing.capitalize()} data was unavailable. "
            "Confidence is reduced."
        )

    prompt = f"""
You are a friendly financial assistant for Indian retail investors.
Explain the following stock analysis for {company} in plain English.

DECISION: {decision}
CONFIDENCE: {portfolio.get('confidence', 'N/A')}
MARKET CONDITIONS: {technical.get('regime_label', 'STABLE')}

What the analysis found:
- News and sentiment: {sentiment.get('label', 'N/A')} (confidence: {sentiment.get('confidence', 'N/A')})
- Price trend: RSI is {technical.get('rsi', 'N/A')}, momentum is {technical.get('macd_signal', 'N/A')}
- Financial health: Company is {fundamental.get('valuation_signal', 'N/A')} with PE ratio {fundamental.get('pe_ratio', 'N/A')}
- Revenue growth: {fundamental.get('revenue_growth', 'N/A')}
- Profit margins: {fundamental.get('profit_margins', 'N/A')}

Risk check result:
- Trade approved: {risk.get('approved')}
- Block reason: {block_reason if block_reason else 'None'}
- Suggested investment: ₹{adjusted_amount if adjusted_amount else 'N/A'}
- Warnings: {translated_warnings if translated_warnings else 'None'}

Data quality: {'PARTIAL — ' + str(flags['null_agents']) + ' data missing' if flags['is_partial'] else 'COMPLETE'}

STRICT RULES:
1. Never use these words: RSI, MACD, ATR, regime, z-score, sentiment score,
   technical score, fundamental score, weighted, basis points, beta, alpha
2. Lead the headline with the action word: HOLD, BUY, SELL, or BLOCKED
3. Explanation must be 2 to 3 sentences maximum
4. Use ₹ symbol for all money amounts
5. Tone: calm, clear, helpful — like a knowledgeable friend
6. If trade is BLOCKED — explain why in plain language using block_reason
7. If market conditions are PANIC — mention unusual volatility calmly
8. If data is partial — mention which data was missing in plain language

Return valid JSON only. No markdown. No preamble.

{{
  "headline": "one sentence starting with action",
  "explanation": "2 to 3 sentences in plain English",
  "action": "{decision}",
  "risk_note": "one sentence about investment amount or block reason",
  "warnings": {json.dumps(translated_warnings)}
}}
"""
    return prompt, data_quality


# ---------------------------------------------------------------------------
# Main Generator
# ---------------------------------------------------------------------------
def generate_explanation(data, flags):
    """
    Call Groq to generate plain English explanation.
    Falls back to hardcoded response if Groq fails.
    """
    # Edge Case 6 — complete failure: skip Groq entirely
    if flags["is_complete_failure"]:
        return complete_failure_response(data.get("ticker"))

    prompt, data_quality = build_prompt(data, flags)

    try:
        response = client.chat.completions.create(
            model="llama-3.3-70b-versatile",
            messages=[
                {
                    "role": "system",
                    "content": (
                        "You are a financial assistant. Always respond with "
                        "valid JSON only. No markdown. No extra text."
                    ),
                },
                {
                    "role": "user",
                    "content": prompt,
                },
            ],
            temperature=0.3,
            max_tokens=400,
        )

        raw = response.choices[0].message.content.strip()
        raw = raw.replace("```json", "").replace("```", "").strip()
        result = json.loads(raw)

        return {
            "ticker":            data.get("ticker"),
            "headline":          result.get("headline"),
            "explanation":       result.get("explanation"),
            "action":            result.get("action"),
            "risk_note":         result.get("risk_note"),
            "data_quality_note": data_quality,
            "warnings":          result.get("warnings", []),
            "status":            "OK",
            "error":             None,
        }

    except Exception as e:
        logger.warning(f"Groq failed for User Liaison: {e}")
        return fallback_response(data, flags)


# ---------------------------------------------------------------------------
# Fallback (no Groq)
# ---------------------------------------------------------------------------
def fallback_response(data, flags):
    """
    Pure Python fallback when Groq is unavailable.
    Builds a basic but correct response from the data.
    """
    portfolio = data.get("portfolio_report", {})
    risk      = data.get("risk_report", {})
    decision  = (
        "BLOCKED"
        if not risk.get("approved")
        else portfolio.get("decision", "HOLD")
    )
    company = data.get("company_name", data.get("ticker"))
    amount  = risk.get("adjusted_amount")

    headline = f"{company} — {decision} based on current analysis."

    if decision == "BLOCKED":
        explanation = (
            f"The analysis was completed but the trade was blocked. "
            f"Reason: {risk.get('block_reason', 'Risk limit reached')}."
        )
    elif decision == "BUY":
        explanation = (
            f"{company} shows positive signals across news, price, and "
            "financial health. Consider entering a position."
        )
    elif decision == "SELL":
        explanation = (
            f"{company} shows negative signals. "
            "Consider reducing or exiting your position."
        )
    else:
        explanation = (
            f"{company} signals are mixed. Holding your current position "
            "is recommended until conditions clarify."
        )

    risk_note = f"Suggested maximum investment: ₹{amount}." if amount else None

    # Build data quality note for fallback
    data_quality = None
    if flags.get("is_partial"):
        missing = " and ".join(flags["null_agents"])
        data_quality = (
            f"{missing.capitalize()} data was unavailable. "
            "Confidence is reduced."
        )
    else:
        data_quality = "Analysis explanation service temporarily unavailable."

    return {
        "ticker":            data.get("ticker"),
        "headline":          headline,
        "explanation":       explanation,
        "action":            decision,
        "risk_note":         risk_note,
        "data_quality_note": data_quality,
        "warnings":          [],
        "status":            "OK",
        "error":             None,
    }


# ---------------------------------------------------------------------------
# Complete Failure
# ---------------------------------------------------------------------------
def complete_failure_response(ticker):
    """Return hardcoded response when all agents are NULL."""
    return {
        "ticker":            ticker,
        "headline":          "Analysis could not be completed at this time.",
        "explanation":       (
            "Data from our analysis services is currently unavailable. "
            "Please try again in a few minutes."
        ),
        "action":            None,
        "risk_note":         None,
        "data_quality_note": "All analysis services were unavailable.",
        "warnings":          [],
        "status":            "NULL",
        "error":             None,
    }
