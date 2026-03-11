import yfinance as yf
stock = yf.Ticker("INFY.NS")
print(stock.fast_info.last_price)