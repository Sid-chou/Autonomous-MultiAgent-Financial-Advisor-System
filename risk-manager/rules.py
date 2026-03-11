def run_all_rules(ticker, user_profile, agent_reports):
    rules_checked = []
    warnings = []

    total_budget = user_profile["total_budget"]
    cash_available = user_profile["cash_available"]
    max_trade_size = user_profile["max_trade_size"]
    daily_loss_limit = user_profile["daily_loss_limit"]
    max_exposure = user_profile["max_exposure_per_stock"]
    current_daily_loss = user_profile.get("current_daily_loss", 0.0)
    current_exposure = user_profile.get("current_exposure", {}).get(ticker, 0.0)
    regime_flag = agent_reports["technical_report"].get("regime_flag", 0)

    proposed_size = max_trade_size
    proposed_amount = proposed_size * total_budget

    # Rule 1 — Cash available
    if proposed_amount > cash_available:
        adjusted_amount = cash_available
        adjusted_size = round(adjusted_amount / total_budget, 4)
        warnings.append("Trade size reduced to match available cash.")
    else:
        adjusted_size = proposed_size
        adjusted_amount = proposed_amount
    rules_checked.append("max_trade_size: PASS")

    # Rule 2 — Daily loss limit
    if current_daily_loss >= daily_loss_limit:
        rules_checked.append("daily_loss_limit: BLOCKED")
        return build_response(
            ticker, False, proposed_size, 0.0, 0.0,
            f"Daily loss limit reached. Current loss {current_daily_loss:.1%} exceeds limit of {daily_loss_limit:.1%}.",
            warnings, rules_checked, regime_flag, user_profile["risk_level"]
        )
    rules_checked.append("daily_loss_limit: PASS")

    # Rule 3 — Max exposure per stock
    if current_exposure + adjusted_size > max_exposure:
        remaining_room = max_exposure - current_exposure
        if remaining_room <= 0:
            rules_checked.append("max_exposure: BLOCKED")
            return build_response(
                ticker, False, proposed_size, 0.0, 0.0,
                f"Maximum exposure for {ticker} already reached. Current: {current_exposure:.1%}, Limit: {max_exposure:.1%}.",
                warnings, rules_checked, regime_flag, user_profile["risk_level"]
            )
        else:
            adjusted_size = round(remaining_room, 4)
            adjusted_amount = round(adjusted_size * total_budget, 2)
            warnings.append(f"Trade size reduced to {adjusted_size:.1%} to stay within max exposure limit.")
            rules_checked.append(f"max_exposure: ADJUSTED to {adjusted_size:.1%}")
    else:
        rules_checked.append("max_exposure: PASS")

    # Rule 4 — Panic regime auto-reduction
    if regime_flag == 2:
        adjusted_size = round(adjusted_size * 0.5, 4)
        adjusted_amount = round(adjusted_size * total_budget, 2)
        warnings.append("PANIC regime detected. Trade size automatically reduced by 50%.")
        rules_checked.append("panic_regime: TRIGGERED — size reduced 50%")
    else:
        rules_checked.append("panic_regime: NOT_TRIGGERED")

    return build_response(
        ticker, True, proposed_size, adjusted_size, adjusted_amount,
        None, warnings, rules_checked, regime_flag, user_profile["risk_level"]
    )


def build_response(ticker, approved, proposed_size, adjusted_size,
                   adjusted_amount, block_reason, warnings,
                   rules_checked, regime_flag, risk_level):
    return {
        "ticker": ticker,
        "approved": approved,
        "proposed_trade_size": proposed_size,
        "adjusted_size": adjusted_size,
        "adjusted_amount": adjusted_amount,
        "block_reason": block_reason,
        "warnings": warnings,
        "regime_flag": regime_flag,
        "risk_level": risk_level,
        "rules_checked": rules_checked,
        "status": "OK",
        "error": None
    }
