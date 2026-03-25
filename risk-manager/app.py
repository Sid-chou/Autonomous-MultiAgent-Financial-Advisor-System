a
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
