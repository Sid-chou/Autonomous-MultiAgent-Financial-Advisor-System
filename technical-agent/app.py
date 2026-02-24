from flask import Flask, request, jsonify
from data_fetcher import fetch_price_data
from indicators import compute_indicators
from regime import compute_regime_and_score
import logging

app = Flask(__name__)
logging.basicConfig(level=logging.INFO)

@app.route('/api/v1/analyze-technical', methods=['POST'])
def analyze_technical():
    data = request.get_json()
    if not data or 'ticker' not in data:
        return jsonify({
            "ticker": None,
            "status": "NULL",
            "error": "Missing ticker in request"
        }), 200

    ticker = data['ticker']
    
    try:
        # Fetch data
        df = fetch_price_data(ticker)
        
        # Compute indicators
        indicators = compute_indicators(df)
        
        # Compute regime and overall score
        regime_res = compute_regime_and_score(df, indicators)
        
        # Combine results
        response = {
            "ticker": ticker,
            **indicators,
            **regime_res,
            "status": "OK",
            "error": None
        }
        
    except Exception as e:
        logging.error(f"Error processing {ticker}: {str(e)}")
        response = {
            "ticker": ticker,
            "rsi": None,
            "macd_signal": None,
            "macd_value": None,
            "macd_histogram": None,
            "bollinger_position": None,
            "atr": None,
            "atr_zscore": None,
            "regime_flag": None,
            "regime_label": None,
            "trend": None,
            "technical_score": None,
            "status": "NULL",
            "error": str(e)
        }
        
    return jsonify(response), 200

if __name__ == '__main__':
    app.run(host='0.0.0.0', port=5001)
