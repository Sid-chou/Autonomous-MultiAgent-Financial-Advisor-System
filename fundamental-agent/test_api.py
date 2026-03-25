import sys
import os
try:
    import yfinance as yf
    print("Testing yfinance WIPRO.NS...")
    s = yf.Ticker("WIPRO.NS")
    hist = s.history(period="1d")
    print(hist)
    print("PE:", s.info.get("trailingPE", "Not found"))
except Exception as e:
    print("yf error:", e)

try:
    from Fundamentals.TickerTape import Tickertape
    print("\nTesting Tickertape WIPRO...")
    ttp = Tickertape()
    tid, raw = ttp.get_ticker("Wipro", search_place="stock")
    print("TID:", tid)
    slug = ttp._get_url_of_the_ticker(tid)
    print("SLUG:", slug)
    ratios = ttp.get_key_ratios(slug)
    print("RATIOS:")
    print(ratios)
except Exception as e:
    print("ttp error:", e)
