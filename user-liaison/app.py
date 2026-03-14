"""
User Liaison Agent — Flask App (Port 5005)
Fine-Tuned Autonomous Multi-Model Financial Advisor

Translates the entire system output into plain English
that a first-time Indian retail investor can read and act on immediately.
"""

import logging
import os

from dotenv import load_dotenv
from flask import Flask, jsonify, request
from flask_cors import CORS

from edge_handler import detect_edge_cases
from translator import generate_explanation

load_dotenv()
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)


# ---------------------------------------------------------------------------
# Health Check
# ---------------------------------------------------------------------------
@app.route("/health", methods=["GET"])
def health():
    return jsonify({
        "status": "healthy",
        "service": "user-liaison",
        "port": 5005,
    })


# ---------------------------------------------------------------------------
# Main Endpoint
# ---------------------------------------------------------------------------
@app.route("/api/v1/analyze-liaison", methods=["POST"])
def analyze_liaison():
    ticker = None
    try:
        data = request.get_json()
        if not data:
            return jsonify({"error": "Request body is required"}), 400

        ticker = data.get("ticker", "").strip()
        if not ticker:
            return jsonify({"error": "ticker is required"}), 400

        logger.info(f"User Liaison processing {ticker}")

        # Step 1 — Detect edge cases before calling Groq
        flags = detect_edge_cases(data)
        logger.info(f"Edge case flags for {ticker}: {flags}")

        # Step 2 — Generate plain English explanation
        result = generate_explanation(data, flags)

        return jsonify(result)

    except Exception as e:
        logger.error(f"User Liaison error for {ticker}: {e}")
        return jsonify({
            "ticker":            ticker,
            "headline":          "Analysis could not be completed at this time.",
            "explanation":       "An unexpected error occurred. Please try again.",
            "action":            None,
            "risk_note":         None,
            "data_quality_note": None,
            "warnings":          [],
            "status":            "NULL",
            "error":             str(e),
        })


# ---------------------------------------------------------------------------
# Entry Point
# ---------------------------------------------------------------------------
if __name__ == "__main__":
    app.run(host="0.0.0.0", port=5005, debug=True)
