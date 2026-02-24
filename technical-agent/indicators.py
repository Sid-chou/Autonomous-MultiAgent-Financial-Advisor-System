import pandas as pd
import ta

def compute_indicators(df: pd.DataFrame):
    # RSI
    df['RSI'] = ta.momentum.RSIIndicator(close=df['Close'], window=14).rsi()
    
    # MACD
    macd = ta.trend.MACD(close=df['Close'], window_slow=26, window_fast=12, window_sign=9)
    df['MACD'] = macd.macd()
    df['MACDh'] = macd.macd_diff()
    df['MACDs'] = macd.macd_signal()
    
    # Bollinger Bands
    bbands = ta.volatility.BollingerBands(close=df['Close'], window=20, window_dev=2)
    df['BBL'] = bbands.bollinger_lband()
    df['BBM'] = bbands.bollinger_mavg()
    df['BBU'] = bbands.bollinger_hband()
    
    # ATR
    atr_ind = ta.volatility.AverageTrueRange(high=df['High'], low=df['Low'], close=df['Close'], window=14)
    df['ATR'] = atr_ind.average_true_range()
    
    # We can handle NaN as None in dict
    latest = df.iloc[-1]
    
    rsi = None if pd.isna(latest.get('RSI')) else float(latest['RSI'])
    macd_val = None if pd.isna(latest.get('MACD')) else float(latest['MACD'])
    macd_hist = None if pd.isna(latest.get('MACDh')) else float(latest['MACDh'])
    
    if macd_hist is None:
        macd_signal = "HOLD"
    elif macd_hist > 0:
        macd_signal = "BUY"
    elif macd_hist < 0:
        macd_signal = "SELL"
    else:
        macd_signal = "HOLD"
        
    close_price = latest.get('Close')
    bbl = latest.get('BBL')
    bbu = latest.get('BBU')
    
    if pd.isna(bbl) or pd.isna(bbu) or pd.isna(close_price):
        bollinger_pos = "MIDDLE"
    elif close_price >= bbu:
        bollinger_pos = "OVERBOUGHT"
    elif close_price <= bbl:
        bollinger_pos = "OVERSOLD"
    else:
        bollinger_pos = "MIDDLE"
        
    atr = None if pd.isna(latest.get('ATR')) else float(latest['ATR'])
    
    return {
        "rsi": rsi,
        "macd_signal": macd_signal,
        "macd_value": macd_val,
        "macd_histogram": macd_hist,
        "bollinger_position": bollinger_pos,
        "atr": atr
    }
