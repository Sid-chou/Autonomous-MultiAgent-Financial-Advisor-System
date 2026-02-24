import pandas as pd

def compute_regime_and_score(df, indicators):
    # Regime computation
    # Step 1: ATR is already in df from indicators
    # Step 2 & 3: rolling mean and std of ATR over 14 days
    if 'ATR' not in df.columns:
        raise ValueError("ATR not found in dataframe")
        
    df['ATR_mean'] = df['ATR'].rolling(window=14).mean()
    df['ATR_std'] = df['ATR'].rolling(window=14).std()
    
    latest = df.iloc[-1]
    
    current_atr = latest.get('ATR')
    mean_atr = latest.get('ATR_mean')
    std_atr = latest.get('ATR_std')
    
    if pd.isna(current_atr) or pd.isna(mean_atr) or pd.isna(std_atr) or std_atr == 0:
        atr_zscore = 0.0
    else:
        atr_zscore = (current_atr - mean_atr) / std_atr
        
    # Check 5% drop
    if len(df) >= 2:
        latest_close = df['Close'].iloc[-1]
        prev_close = df['Close'].iloc[-2]
        session_drop = (prev_close - latest_close) / prev_close
    else:
        session_drop = 0.0
        
    if session_drop >= 0.05 or atr_zscore >= 2.0:
        regime_flag = 2
        regime_label = "PANIC"
    elif atr_zscore >= 1.0:
        regime_flag = 1
        regime_label = "BEARISH"
    else:
        regime_flag = 0
        regime_label = "STABLE"
        
    # Technical score
    score = 0.0
    
    rsi = indicators.get('rsi')
    if rsi is not None:
        if rsi < 30:
            score += 0.4
        elif rsi > 70:
            score -= 0.4
        else:
            score += (50 - rsi) / 50 * 0.2
            
    macd_signal = indicators.get('macd_signal')
    if macd_signal == "BUY":
        score += 0.4
    elif macd_signal == "SELL":
        score -= 0.4
        
    bollinger = indicators.get('bollinger_position')
    if bollinger == "OVERSOLD":
        score += 0.2
    elif bollinger == "OVERBOUGHT":
        score -= 0.2
        
    technical_score = max(-1.0, min(1.0, score))
    
    trend = "BULLISH" if technical_score > 0 else ("BEARISH" if technical_score < 0 else "NEUTRAL")
    
    res = {
        "regime_flag": int(regime_flag),
        "regime_label": regime_label,
        "atr_zscore": float(atr_zscore) if atr_zscore is not None else None,
        "technical_score": float(technical_score),
        "trend": trend
    }
    return res
