REGIME_WEIGHTS = {
    0: {"w1": 0.40, "w2": 0.30, "w3": 0.30, "label": "STABLE"},
    1: {"w1": 0.25, "w2": 0.50, "w3": 0.25, "label": "BEARISH"},
    2: {"w1": 0.10, "w2": 0.80, "w3": 0.10, "label": "PANIC"},
}


def get_active_scores(sentiment_report, technical_report, fundamental_report):
    """
    Extract scores and statuses from agent reports.
    Returns dict of {agent: (score, status)}.
    """
    return {
        "sentiment":   (
            sentiment_report.get("sentiment_score", 0.0),
            sentiment_report.get("status", "NULL")
        ),
        "technical":   (
            technical_report.get("technical_score", 0.0),
            technical_report.get("status", "NULL")
        ),
        "fundamental": (
            fundamental_report.get("fundamental_score", 0.0),
            fundamental_report.get("status", "NULL")
        ),
    }


def compute_weights(regime_flag, agent_scores):
    """
    Compute final weights after applying graceful degradation.
    Redistributes weight from NULL agents to active agents.
    """
    base = REGIME_WEIGHTS.get(regime_flag, REGIME_WEIGHTS[0])
    w1 = base["w1"]
    w2 = base["w2"]
    w3 = base["w3"]

    s_status = agent_scores["sentiment"][1]
    t_status = agent_scores["technical"][1]
    f_status = agent_scores["fundamental"][1]

    null_agents = [
        (s_status == "NULL", "s"),
        (t_status == "NULL", "t"),
        (f_status == "NULL", "f")
    ]
    null_count = sum(1 for is_null, _ in null_agents if is_null)

    # All NULL — cannot proceed
    if null_count == 3:
        return None, None, None, 0.0, "NULL"

    confidence_penalty = 1.0 if null_count == 0 else (0.5 if null_count == 1 else 0.3)
    pipeline_status = "OK" if null_count == 0 else "PARTIAL"

    # Redistribute weights from NULL agents
    if s_status == "NULL":
        redistribution = w1 / (3 - null_count)
        w1 = 0.0
        if t_status != "NULL":
            w2 += redistribution
        if f_status != "NULL":
            w3 += redistribution

    if t_status == "NULL":
        redistribution = w2 / (3 - null_count)
        w2 = 0.0
        if s_status != "NULL":
            w1 += redistribution
        if f_status != "NULL":
            w3 += redistribution

    if f_status == "NULL":
        redistribution = w3 / (3 - null_count)
        w3 = 0.0
        if s_status != "NULL":
            w1 += redistribution
        if t_status != "NULL":
            w2 += redistribution

    return round(w1, 4), round(w2, 4), round(w3, 4), confidence_penalty, pipeline_status


def compute_decision_score(w1, w2, w3, sentiment_score, technical_score, fundamental_score):
    """
    Apply weighted formula.
    Decision_Score = (w1 x Sentiment) + (w2 x Technical) + (w3 x Fundamental)
    """
    s_contribution = round(w1 * sentiment_score, 4)
    t_contribution = round(w2 * technical_score, 4)
    f_contribution = round(w3 * fundamental_score, 4)
    total = round(s_contribution + t_contribution + f_contribution, 4)
    return total, s_contribution, t_contribution, f_contribution


def determine_decision(decision_score):
    if decision_score > 0.3:
        return "BUY"
    elif decision_score < -0.3:
        return "SELL"
    else:
        return "HOLD"


def compute_confidence(decision_score, confidence_penalty):
    base = round(abs(decision_score), 4)
    return round(min(base * confidence_penalty, 1.0), 4)


def run_portfolio_calculation(ticker, sentiment_report, technical_report, fundamental_report):
    """
    Main entry point for portfolio calculation.
    Returns complete calculation result dict.
    """
    regime_flag = technical_report.get("regime_flag", 0)
    regime_label = REGIME_WEIGHTS.get(regime_flag, REGIME_WEIGHTS[0])["label"]

    agent_scores = get_active_scores(sentiment_report, technical_report, fundamental_report)

    w1, w2, w3, confidence_penalty, pipeline_status = compute_weights(
        regime_flag, agent_scores
    )

    # All agents NULL
    if w1 is None:
        return {
            "ticker": ticker,
            "decision": None,
            "decision_score": None,
            "confidence": None,
            "regime_flag": regime_flag,
            "regime_label": regime_label,
            "weights": None,
            "contributions": None,
            "agent_statuses": {
                "sentiment":   agent_scores["sentiment"][1],
                "technical":   agent_scores["technical"][1],
                "fundamental": agent_scores["fundamental"][1],
            },
            "pipeline_status": "NULL"
        }

    sentiment_score   = agent_scores["sentiment"][1]   != "NULL" and agent_scores["sentiment"][0] or 0.0
    technical_score   = agent_scores["technical"][1]   != "NULL" and agent_scores["technical"][0] or 0.0
    fundamental_score = agent_scores["fundamental"][1] != "NULL" and agent_scores["fundamental"][0] or 0.0

    decision_score, s_contrib, t_contrib, f_contrib = compute_decision_score(
        w1, w2, w3, sentiment_score, technical_score, fundamental_score
    )

    decision = determine_decision(decision_score)
    confidence = compute_confidence(decision_score, confidence_penalty)

    return {
        "ticker": ticker,
        "decision": decision,
        "decision_score": decision_score,
        "confidence": confidence,
        "regime_flag": regime_flag,
        "regime_label": regime_label,
        "weights": {"w1_sentiment": w1, "w2_technical": w2, "w3_fundamental": w3},
        "contributions": {
            "sentiment_contribution":   s_contrib,
            "technical_contribution":   t_contrib,
            "fundamental_contribution": f_contrib,
        },
        "agent_statuses": {
            "sentiment":   agent_scores["sentiment"][1],
            "technical":   agent_scores["technical"][1],
            "fundamental": agent_scores["fundamental"][1],
        },
        "pipeline_status": pipeline_status,
        "confidence_penalty": confidence_penalty,
    }
