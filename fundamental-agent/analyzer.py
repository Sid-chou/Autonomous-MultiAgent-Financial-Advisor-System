from groq import Groq
import json
import os
import logging

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def _get_groq_client():
    """Create Groq client on demand so the service can start without the key."""
    api_key = os.environ.get("GROQ_API_KEY")
    if not api_key:
        raise ValueError("GROQ_API_KEY environment variable is not set")
    return Groq(api_key=api_key)


def build_prompt(ticker: str, metrics: dict) -> str:
    """Build a structured prompt for the LLM with Indian market context."""
    return f"""
You are a fundamental analyst specializing in Indian stock markets.

Analyze the following financial metrics for {ticker} and provide a valuation signal.

Financial Metrics:
- PE Ratio: {metrics.get('pe_ratio', 'N/A')}
- Revenue Growth (YoY): {metrics.get('revenue_growth', 'N/A')}
- Profit Margins: {metrics.get('profit_margins', 'N/A')}
- Debt to Equity: {metrics.get('debt_to_equity', 'N/A')}
- Earnings Growth: {metrics.get('earnings_growth', 'N/A')}
- Return on Equity: {metrics.get('return_on_equity', 'N/A')}
- Sector: {metrics.get('sector', 'N/A')}
- Industry: {metrics.get('industry', 'N/A')}

Indian Market Context:
- Nifty 50 average PE: 20 to 22
- IT sector average PE: 25 to 28
- Banking sector average PE: 12 to 15
- FMCG sector average PE: 40 to 50
- Healthy profit margin for IT: above 15%
- Healthy debt to equity for most sectors: below 1.0

Instructions:
1. Compare the PE ratio against the sector average provided above
2. Assess whether revenue and earnings growth justify the current valuation
3. Check if profit margins are healthy for the sector
4. Consider debt levels as a risk factor
5. Output a valuation signal: UNDERVALUED, FAIR, or OVERVALUED

You must respond with valid JSON only. No explanation outside the JSON. No markdown. No preamble.

Response format:
{{
  "valuation_signal": "UNDERVALUED or FAIR or OVERVALUED",
  "confidence": 0.0 to 1.0,
  "reasoning": "one to two sentence explanation referencing the actual numbers"
}}
"""


def call_groq(prompt: str) -> dict:
    """Send the prompt to Groq (Llama 3) and parse the JSON response."""
    logger.info("Calling Groq API for fundamental analysis")

    client = _get_groq_client()
    response = client.chat.completions.create(
        model="llama3-8b-8192",
        messages=[
            {
                "role": "system",
                "content": "You are a financial analyst. Always respond with valid JSON only.",
            },
            {"role": "user", "content": prompt},
        ],
        temperature=0.1,
        max_tokens=300,
    )

    raw = response.choices[0].message.content.strip()

    # Strip markdown code blocks if present
    raw = raw.replace("```json", "").replace("```", "").strip()

    try:
        return json.loads(raw)
    except json.JSONDecodeError:
        logger.error(f"Failed to parse Groq response: {raw}")
        raise ValueError("LLM returned malformed JSON")
