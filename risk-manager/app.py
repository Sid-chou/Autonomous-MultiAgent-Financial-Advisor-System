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

        # Validate request
        error = validate_request(data)
        if error:
            return jsonify({"error": error}), 400

        ticker = data["ticker"]
        user_profile = data["user_profile"]
        agent_reports = data["agent_reports"]

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
