import logging
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from calculator import run_portfolio_calculation
from explainer import generate_reasoning

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "portfolio-manager",
        "port": 5004
    })


@app.route('/api/v1/analyze-portfolio', methods=['POST'])
def analyze_portfolio():
    ticker = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        ticker              = data.get("ticker", "").strip()
        sentiment_report    = data.get("sentiment_report", {})
        technical_report    = data.get("technical_report", {})
        fundamental_report  = data.get("fundamental_report", {})

        if not ticker:
            return jsonify({"error": "ticker is required"}), 400

        # Part 1 — deterministic calculation
        logger.info(f"Running portfolio calculation for {ticker}")
        calc = run_portfolio_calculation(
            ticker, sentiment_report, technical_report, fundamental_report
        )

        # All agents NULL — cannot proceed
        if calc["pipeline_status"] == "NULL":
            return jsonify({
                "ticker": ticker,
                "decision": None,
                "decision_score": None,
                "confidence": None,
                "regime_flag": calc["regime_flag"],
                "regime_label": calc["regime_label"],
                "weights": None,
                "contributions": None,
                "reasoning": None,
                "agent_statuses": calc["agent_statuses"],
                "status": "NULL",
                "error": "All agent reports unavailable"
            })

        # Part 2 — LLM generates reasoning
        logger.info(f"Generating reasoning for {ticker}")
        reasoning, llm_confidence = generate_reasoning(
            ticker, calc, technical_report, fundamental_report
        )

        # Use LLM confidence if higher than computed confidence
        final_confidence = max(calc["confidence"], llm_confidence * calc["confidence_penalty"])

        return jsonify({
            "ticker":         ticker,
            "decision":       calc["decision"],
            "decision_score": calc["decision_score"],
            "confidence":     round(final_confidence, 4),
            "regime_flag":    calc["regime_flag"],
            "regime_label":   calc["regime_label"],
            "weights":        calc["weights"],
            "contributions":  calc["contributions"],
            "reasoning":      reasoning,
            "agent_statuses": calc["agent_statuses"],
            "status":         calc["pipeline_status"],
            "error":          None
        })

    except Exception as e:
        logger.error(f"Error in analyze_portfolio for {ticker}: {e}")
        return jsonify({
            "ticker":         ticker,
            "decision":       None,
            "decision_score": None,
            "confidence":     None,
            "regime_flag":    None,
            "regime_label":   None,
            "weights":        None,
            "contributions":  None,
            "reasoning":      None,
            "agent_statuses": None,
            "status":         "NULL",
            "error":          str(e)
        })


if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5004, debug=True)
