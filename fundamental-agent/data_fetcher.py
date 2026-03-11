import logging
import time

import pandas as pd
from Fundamentals.TickerTape import Tickertape

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# -------------------------------------------------------------------
# Ticker mapping — NSE symbol to company search name
# Add more tickers here as you expand supported stocks
# -------------------------------------------------------------------
TICKER_TO_COMPANY = {
    "INFY":       "Infosys",
    "TCS":        "Tata Consultancy Services",
    "RELIANCE":   "Reliance Industries",
    "HDFCBANK":   "HDFC Bank",
    "WIPRO":      "Wipro",
    "ICICIBANK":  "ICICI Bank",
    "HINDUNILVR": "Hindustan Unilever",
    "SBIN":       "State Bank of India",
    "BAJFINANCE": "Bajaj Finance",
    "KOTAKBANK":  "Kotak Mahindra Bank",
    "AXISBANK":   "Axis Bank",
    "ASIANPAINT": "Asian Paints",
    "MARUTI":     "Maruti Suzuki",
    "TATAMOTORS": "Tata Motors",
    "SUNPHARMA":  "Sun Pharmaceutical",
    "LTIM":       "LTIMindtree",
    "HCLTECH":    "HCL Technologies",
    "TECHM":      "Tech Mahindra",
    "TATASTEEL":  "Tata Steel",
    "ONGC":       "Oil and Natural Gas Corporation",
}

# -------------------------------------------------------------------
# In-memory cache — TTL 10 minutes
# Tickertape is more tolerant than Yahoo but caching is still good practice
# -------------------------------------------------------------------
_cache: dict = {}
_CACHE_TTL: float = 600.0  # seconds

# Shared Tickertape session — reuse across requests
_ttp = None


def _get_ttp() -> Tickertape:
    """Return shared Tickertape instance. Initialize once."""
    global _ttp
    if _ttp is None:
        _ttp = Tickertape()
        logger.info("Tickertape session initialized")
    return _ttp


def _normalize_ticker(ticker: str) -> str:
    """
    Strip .NS or .BO suffix from ticker.
    INFY.NS -> INFY
    TCS.BO  -> TCS
    INFY    -> INFY
    """
    return ticker.replace(".NS", "").replace(".BO", "").upper().strip()


def _get_cached(ticker: str):
    """Return cached metrics if still fresh, otherwise None."""
    if ticker in _cache:
        cached_time, cached_data = _cache[ticker]
        if time.time() - cached_time < _CACHE_TTL:
            logger.info(f"[cache] Returning cached metrics for {ticker}")
            return cached_data
    return None


def _set_cache(ticker: str, metrics: dict) -> None:
    _cache[ticker] = (time.time(), metrics)


def _safe_float(value, default=None):
    """Safely convert a value to float. Returns default on failure."""
    try:
        if value is None or (isinstance(value, float) and pd.isna(value)):
            return default
        return round(float(value), 4)
    except (TypeError, ValueError):
        return default


def _extract_pe_ratio(ratios_df: pd.DataFrame) -> float | None:
    if ratios_df is None or ratios_df.empty:
        return None
    try:
        # Use ttmPe (trailing 12 month) — most accurate current valuation
        # Fall back to pe if ttmPe is missing
        val = ratios_df.loc["ttmPe"].iloc[0] if "ttmPe" in ratios_df.index else None
        if val is None or pd.isna(val):
            val = ratios_df.loc["pe"].iloc[0] if "pe" in ratios_df.index else None
        return _safe_float(val)
    except Exception as e:
        logger.warning(f"PE extraction failed: {e}")
        return None


def _extract_profit_margins(ratios_df: pd.DataFrame, income_df: pd.DataFrame) -> float | None:
    # Compute from income statement — incNinc / incTrev
    if income_df is not None and not income_df.empty:
        try:
            # Use most recent year — FY2025 is iloc[1], TTM is iloc[2]
            # Use TTM (index 2) for most current picture
            row = income_df.iloc[-1]
            revenue = _safe_float(row.get("incTrev"))
            net_income = _safe_float(row.get("incNinc"))
            if revenue and net_income and revenue != 0:
                return round(net_income / revenue, 4)
        except Exception as e:
            logger.warning(f"Profit margin computation failed: {e}")
    return None


def _extract_revenue_growth(income_df: pd.DataFrame) -> float | None:
    if income_df is None or income_df.empty:
        return None
    try:
        # income_df rows: FY2024 (idx 0), FY2025 (idx 1), TTM (idx 2)
        # Use FY2024 and FY2025 for clean annual YoY growth
        if len(income_df) >= 2:
            current = _safe_float(income_df.iloc[1].get("incTrev"))   # FY2025
            previous = _safe_float(income_df.iloc[0].get("incTrev"))  # FY2024
            if current and previous and previous != 0:
                return round((current - previous) / abs(previous), 4)
    except Exception as e:
        logger.warning(f"Revenue growth computation failed: {e}")
    return None


def _extract_debt_to_equity(ratios_df: pd.DataFrame) -> float | None:
    # Tickertape key ratios do not directly expose D/E in this payload
    # bps (book value per share) and eps are available
    # D/E requires balance sheet — not available in this call
    # Return None — LLM will handle missing D/E gracefully
    logger.debug("D/E ratio not available in Tickertape key ratios payload")
    return None


def _extract_roe(ratios_df: pd.DataFrame) -> float | None:
    if ratios_df is None or ratios_df.empty:
        return None
    try:
        if "roe" in ratios_df.index:
            val = _safe_float(ratios_df.loc["roe"].iloc[0])
            if val is not None:
                # Tickertape returns ROE as percentage (28.9) — normalize to decimal
                return round(val / 100, 4) if val > 1 else val
    except Exception as e:
        logger.warning(f"ROE extraction failed: {e}")
    return None



# -------------------------------------------------------------------
# Public API
# -------------------------------------------------------------------

def fetch_metrics(ticker: str) -> dict:
    """
    Fetch fundamental financial metrics for the given NSE ticker
    using the Bharat-SM-Data TickerTape library.

    Steps:
      1. Normalize ticker — strip .NS suffix
      2. Check in-memory cache
      3. Map ticker to company name using TICKER_TO_COMPANY
      4. Resolve Tickertape ticker ID and slug via get_ticker()
      5. Fetch key ratios via get_key_ratios()
      6. Fetch income statement via get_income_data()
      7. Extract and return structured metrics dict

    Returns:
      dict with keys: pe_ratio, revenue_growth, profit_margins,
      debt_to_equity, return_on_equity, earnings_growth,
      current_price, sector, industry

    Raises:
      ValueError  — ticker not in supported list
      RuntimeError — unrecoverable data fetch failure
    """
    clean_ticker = _normalize_ticker(ticker)

    # Step 1 — check cache
    cached = _get_cached(clean_ticker)
    if cached is not None:
        return cached

    # Step 2 — verify ticker is supported
    if clean_ticker not in TICKER_TO_COMPANY:
        raise ValueError(
            f"Ticker '{clean_ticker}' is not in the supported ticker list. "
            f"Supported: {list(TICKER_TO_COMPANY.keys())}"
        )

    company_name = TICKER_TO_COMPANY[clean_ticker]
    logger.info(f"Fetching metrics for {clean_ticker} ({company_name}) via Tickertape")

    ttp = _get_ttp()

    try:
        # Step 3 — resolve Tickertape ticker ID
        logger.info(f"Searching Tickertape for: {company_name}")
        ticker_id, raw_data = ttp.get_ticker(company_name, search_place="stock")

        if not ticker_id:
            raise RuntimeError(
                f"Tickertape returned no ticker ID for '{company_name}'"
            )

        logger.info(f"Resolved Tickertape ticker ID: {ticker_id}")

        # Step 4 — resolve slug URL for get_key_ratios
        slug = None
        try:
            slug = ttp._get_url_of_the_ticker(ticker_id)
            logger.info(f"Resolved slug: {slug}")
        except Exception as e:
            logger.warning(f"Could not resolve slug for {clean_ticker}: {e}")

        # Step 5 — fetch key ratios (PE, margins, D/E, ROE)
        ratios_df = None
        if slug:
            try:
                ratios_df = ttp.get_key_ratios(slug)
                logger.info(
                    f"Key ratios fetched for {clean_ticker}. "
                    f"Available keys: {list(ratios_df.index) if ratios_df is not None else 'None'}"
                )
            except Exception as e:
                logger.warning(f"get_key_ratios failed for {clean_ticker}: {e}")

        # Step 6 — fetch income statement (annual, 2 periods for YoY growth)
        income_df = None
        try:
            income_df = ttp.get_income_data(
                ticker_id,
                time_horizon="annual",
                num_time_periods=2
            )
            logger.info(
                f"Income data fetched for {clean_ticker}. "
                f"Available rows: {list(income_df.index) if income_df is not None else 'None'}"
            )
        except Exception as e:
            logger.warning(f"get_income_data failed for {clean_ticker}: {e}")

        # Step 7 — extract all metrics
        metrics = {
            "pe_ratio":        _extract_pe_ratio(ratios_df),
            "revenue_growth":  _extract_revenue_growth(income_df),
            "profit_margins":  _extract_profit_margins(ratios_df, income_df),
            "debt_to_equity":  _extract_debt_to_equity(ratios_df),
            "return_on_equity": _extract_roe(ratios_df),
            "earnings_growth": None,   # not directly available — skipped
            "current_price":   None,   # Technical agent handles price data
            "sector":          None,   # not cleanly exposed by Tickertape
            "industry":        None,
        }
        if ratios_df is not None and "lastPrice" in ratios_df.index:
            metrics["current_price"] = _safe_float(ratios_df.loc["lastPrice"].iloc[0])

        logger.info(
            f"Final metrics for {clean_ticker}: "
            f"PE={metrics['pe_ratio']}, "
            f"RevGrowth={metrics['revenue_growth']}, "
            f"Margins={metrics['profit_margins']}, "
            f"D/E={metrics['debt_to_equity']}, "
            f"ROE={metrics['return_on_equity']}"
        )

        _set_cache(clean_ticker, metrics)
        return metrics

    except ValueError:
        raise
    except Exception as e:
        logger.error(f"Unrecoverable error fetching metrics for {clean_ticker}: {e}")
        raise RuntimeError(
            f"Failed to fetch financial data for {clean_ticker} from Tickertape: {e}"
        ) from e


def validate_metrics(metrics: dict) -> bool:
    """
    Validate that the minimum required metrics are present.

    pe_ratio is the only hard requirement. Without it the LLM
    cannot produce a meaningful valuation signal.
    """
    if metrics.get("pe_ratio") is None:
        logger.warning(
            "Missing critical metric: pe_ratio — cannot proceed with fundamental analysis"
        )
        return False
    return True


def get_supported_tickers() -> list:
    """Return the list of all supported NSE tickers."""
    return list(TICKER_TO_COMPANY.keys())


def clear_cache(ticker: str = None) -> None:
    """
    Clear the in-memory cache.
    Pass a specific ticker to clear only that entry.
    Pass nothing to clear all cached entries.
    Used primarily for testing.
    """
    if ticker:
        clean = _normalize_ticker(ticker)
        _cache.pop(clean, None)
        logger.info(f"Cache cleared for {clean}")
    else:
        _cache.clear()
        logger.info("Full metrics cache cleared")