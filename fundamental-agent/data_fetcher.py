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
    """
    Extract PE ratio from key ratios DataFrame.
    Tickertape returns a transposed DataFrame — rows are metric names.
    """
    if ratios_df is None or ratios_df.empty:
        return None

    pe_candidates = ["P/E", "PE Ratio", "Price to Earnings", "pe", "P/E Ratio"]

    for candidate in pe_candidates:
        if candidate in ratios_df.index:
            val = ratios_df.loc[candidate].iloc[0]
            result = _safe_float(val)
            if result is not None:
                logger.debug(f"PE ratio found under key '{candidate}': {result}")
                return result

    logger.warning(f"PE ratio not found. Available ratio keys: {list(ratios_df.index)}")
    return None


def _extract_profit_margins(ratios_df: pd.DataFrame, income_df: pd.DataFrame) -> float | None:
    """
    Extract net profit margin from key ratios.
    Falls back to computing from income statement if not in ratios.
    """
    if ratios_df is not None and not ratios_df.empty:
        margin_candidates = [
            "Net Profit Margin", "Profit Margin", "NPM", "Net Margin",
            "Net Profit Margin %", "PAT Margin"
        ]
        for candidate in margin_candidates:
            if candidate in ratios_df.index:
                val = ratios_df.loc[candidate].iloc[0]
                result = _safe_float(val)
                if result is not None:
                    # Normalize — Tickertape may return 21.5 instead of 0.215
                    if result > 1:
                        result = round(result / 100, 4)
                    logger.debug(f"Profit margin found under key '{candidate}': {result}")
                    return result

    # Fallback — compute from income statement
    if income_df is not None and not income_df.empty:
        try:
            revenue_candidates = ["Revenue", "Total Revenue", "Net Sales", "Net Revenue"]
            profit_candidates = ["Net Profit", "PAT", "Net Income", "Profit After Tax"]

            revenue = None
            profit = None

            for col in revenue_candidates:
                if col in income_df.index:
                    revenue = _safe_float(income_df.loc[col].iloc[0])
                    break

            for col in profit_candidates:
                if col in income_df.index:
                    profit = _safe_float(income_df.loc[col].iloc[0])
                    break

            if revenue and profit and revenue != 0:
                return round(profit / revenue, 4)
        except Exception as e:
            logger.debug(f"Could not compute margin from income statement: {e}")

    return None


def _extract_revenue_growth(income_df: pd.DataFrame) -> float | None:
    """
    Compute YoY revenue growth from income statement.
    Requires at least 2 periods of data.
    """
    if income_df is None or income_df.empty:
        return None

    revenue_candidates = ["Revenue", "Total Revenue", "Net Sales", "Net Revenue"]

    for candidate in revenue_candidates:
        if candidate in income_df.index:
            revenue_row = income_df.loc[candidate]
            if len(revenue_row) >= 2:
                current = _safe_float(revenue_row.iloc[0])
                previous = _safe_float(revenue_row.iloc[1])
                if current and previous and previous != 0:
                    growth = round((current - previous) / abs(previous), 4)
                    logger.debug(f"Revenue growth computed: {growth}")
                    return growth
            break

    logger.warning("Could not compute revenue growth — insufficient data")
    return None


def _extract_debt_to_equity(ratios_df: pd.DataFrame) -> float | None:
    """
    Extract debt to equity ratio from key ratios DataFrame.
    """
    if ratios_df is None or ratios_df.empty:
        return None

    de_candidates = [
        "Debt to Equity", "D/E Ratio", "Debt/Equity", "DE Ratio",
        "Total Debt/Equity", "D/E"
    ]

    for candidate in de_candidates:
        if candidate in ratios_df.index:
            val = ratios_df.loc[candidate].iloc[0]
            result = _safe_float(val)
            if result is not None:
                logger.debug(f"D/E ratio found under key '{candidate}': {result}")
                return result

    logger.warning(f"D/E ratio not found. Available ratio keys: {list(ratios_df.index)}")
    return None


def _extract_roe(ratios_df: pd.DataFrame) -> float | None:
    """
    Extract Return on Equity from key ratios DataFrame.
    """
    if ratios_df is None or ratios_df.empty:
        return None

    roe_candidates = ["ROE", "Return on Equity", "Return on Equity %"]

    for candidate in roe_candidates:
        if candidate in ratios_df.index:
            val = _safe_float(ratios_df.loc[candidate].iloc[0])
            if val is not None:
                return val / 100 if val > 1 else val

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