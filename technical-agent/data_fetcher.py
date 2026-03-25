import yfinance as yf

def fetch_price_data(ticker: str, period: str = "3mo"):
    if not ticker.endswith(".NS") and not ticker.endswith(".BO"):
        ticker = f"{ticker}.NS"
        
    try:
        stock = yf.Ticker(ticker)
        df = stock.history(period=period)
        if df.empty:
            raise ValueError("No data returned from API")
        return df
    except Exception as e:
        raise RuntimeError(f"Price fetch failed: {str(e)}")
