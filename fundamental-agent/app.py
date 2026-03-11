from flask import Flask, request, jsonify
from flask_cors import CORS
from dotenv import load_dotenv

load_dotenv()
from analyzer import build_prompt, call_groq, convert_to_score
from data_fetcher import fetch_metrics, validate_metrics
import logging

app = Flask(__name__)
CORS(app)
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def null_response(ticker: str, error_msg: str) -> dict:
    """Return a standardized NULL response when analysis cannot be completed."""
    return {
        "ticker": ticker,
        "valuation_signal": None,
        "pe_ratio": None,
        "revenue_growth": None,
        "profit_margins": None,
        "debt_to_equity": None,
        "fundamental_score": None,
        "confidence": None,
        "reasoning": None,
        "data_source": "yfinance",
        "status": "NULL",
        "error": error_msg,
    }


@app.route("/health", methods=["GET"])
def health():
    return jsonify(
        {"status": "healthy", "service": "fundamental-analyst", "port": 5002}
    )


@app.route("/api/v1/analyze-fundamental", methods=["POST"])
def analyze_fundamental():
    try:
        data = request.get_json()
        ticker = data.get("ticker", "").strip() if data else ""

        if not ticker:
            return jsonify({"error": "Ticker is required"}), 400

        # Step 1 — fetch metrics from yfinance
        metrics = fetch_metrics(ticker)

        # Step 2 — validate that minimum required data exists
        if not validate_metrics(metrics):
            return jsonify(
                null_response(ticker, "Insufficient financial data for this ticker")
            )

        # Step 3 — build prompt and call Groq
        prompt = build_prompt(ticker, metrics)
        llm_result = call_groq(prompt)

        # Step 4 — compute numeric score
        valuation_signal = llm_result.get("valuation_signal", "FAIR")
        confidence = llm_result.get("confidence", 0.5)
        fundamental_score = convert_to_score(valuation_signal, confidence)

        return jsonify(
            {
                "ticker": ticker,
                "valuation_signal": valuation_signal,
                "pe_ratio": metrics.get("pe_ratio"),
                "revenue_growth": metrics.get("revenue_growth"),
                "profit_margins": metrics.get("profit_margins"),
                "debt_to_equity": metrics.get("debt_to_equity"),
                "fundamental_score": fundamental_score,
                "confidence": confidence,
                "reasoning": llm_result.get("reasoning"),
                "data_source": "yfinance",
                "status": "OK",
                "error": None,
            }
        )

    except RuntimeError as e:
        return jsonify({
            "ticker": ticker if 'ticker' in locals() else None,
            "valuation_signal": None,
            "fundamental_score": None,
            "confidence": None,
            "reasoning": None,
            "data_source": "tickertape",
            "status": "NULL",
            "error": str(e)
        })
    except Exception as e:
        logger.error(f"Error in analyze_fundamental: {str(e)}")
        return jsonify(
            null_response(
                ticker if "ticker" in locals() else None,
                str(e),
            )
        )


if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5002, debug=True)
