from flask import Flask, request, jsonify
from flask_cors import CORS
from rules import run_all_rules
from validator import validate_request

app = Flask(__name__)
CORS(app)

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "service": "risk-manager",
        "port": 5003,
        "type": "deterministic-rule-engine"
    })

@app.route('/api/v1/analyze-risk', methods=['POST'])
def analyze_risk():
    try:
        data = request.get_json()

        ticker = data.get("ticker")
        user_profile = data.get("user_profile", {})
        agent_reports = data.get("agent_reports", {})

        # Normalize frontend camelCase to Python snake_case
        normalized_profile = {
            "total_budget": user_profile.get("total_budget", user_profile.get("totalBudget")),
            "cash_available": user_profile.get("cash_available", user_profile.get("cashAvailable")),
            "max_trade_size": user_profile.get("max_trade_size", user_profile.get("maxTradeSize")),
            "daily_loss_limit": user_profile.get("daily_loss_limit", user_profile.get("dailyLossLimit")),
            "max_exposure_per_stock": user_profile.get("max_exposure_per_stock", user_profile.get("maxExposurePerStock")),
            "current_daily_loss": user_profile.get("current_daily_loss", user_profile.get("currentDailyLoss")),
            "current_exposure": user_profile.get("current_exposure", user_profile.get("currentExposure", {})),
            "risk_level": user_profile.get("risk_level", user_profile.get("riskLevel"))
        }

        # Override with normalized
        data["user_profile"] = normalized_profile
        user_profile = normalized_profile

        # Validate request
        error = validate_request(data)
        if error:
            return jsonify({"error": error}), 400

        # Run all rules
        result = run_all_rules(ticker, user_profile, agent_reports)

        return jsonify(result)

    except Exception as e:
        return jsonify({
            "ticker": data.get("ticker") if "data" in locals() else None,
            "approved": False,
            "adjusted_size": 0.0,
            "adjusted_amount": 0.0,
            "block_reason": "Risk Manager internal error",
            "status": "NULL",
            "error": str(e)
        })

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5003, debug=True)
