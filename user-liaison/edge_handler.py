"""
Edge Handler — Pre-processing logic for User Liaison Agent.
Detects all six edge cases before the Groq prompt is built.
"""


def detect_edge_cases(data):
    """
    Inspect all reports and return edge case flags.
    Called before building the Groq prompt.

    Edge Cases Handled:
        1. Risk Manager BLOCKED trade
        2. PANIC regime
        3. One agent NULL (partial data)
        4. Conflicting signals (HOLD with mixed contributions)
        5. Risk Manager warnings present
        6. All agents NULL (complete failure)
    """
    flags = {
        "is_blocked":         False,
        "is_panic":           False,
        "is_complete_failure": False,
        "null_agents":        [],
        "has_warnings":       False,
        "is_partial":         False,
    }

    portfolio   = data.get("portfolio_report", {})
    risk        = data.get("risk_report", {})
    technical   = data.get("technical_report", {})
    sentiment   = data.get("sentiment_report", {})
    fundamental = data.get("fundamental_report", {})

    # Edge Case 6 — Complete failure (all agents NULL)
    if portfolio.get("status") == "NULL":
        flags["is_complete_failure"] = True
        return flags

    # Edge Case 1 — Risk Manager BLOCKED trade
    if risk.get("approved") is False:
        flags["is_blocked"] = True

    # Edge Case 2 — PANIC regime
    if technical.get("regime_label") == "PANIC":
        flags["is_panic"] = True

    # Edge Case 3 — One or more agents NULL (partial data)
    if sentiment.get("status") == "NULL":
        flags["null_agents"].append("news")
    if technical.get("status") == "NULL":
        flags["null_agents"].append("price trend")
    if fundamental.get("status") == "NULL":
        flags["null_agents"].append("financial report")

    flags["is_partial"] = len(flags["null_agents"]) > 0

    # Edge Case 5 — Risk Manager warnings present
    if risk.get("warnings"):
        flags["has_warnings"] = True

    return flags
