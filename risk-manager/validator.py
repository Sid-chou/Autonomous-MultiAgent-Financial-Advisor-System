def validate_request(data):
    if not data:
        return "Request body is required"
    if not data.get("ticker"):
        return "ticker is required"
    if not data.get("user_profile"):
        return "user_profile is required"
    if not data.get("agent_reports"):
        return "agent_reports is required"

    profile = data["user_profile"]
    required_profile_fields = [
        "total_budget", "risk_level"
    ]
    for field in required_profile_fields:
        if field not in profile:
            return f"user_profile missing required field: {field}"

    reports = data["agent_reports"]
    if "technical_report" not in reports:
        return "agent_reports missing technical_report (needed for regime_flag)"

    return None
