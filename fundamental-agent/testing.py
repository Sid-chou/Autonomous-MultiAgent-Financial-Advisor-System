from Fundamentals.TickerTape import Tickertape
ttp = Tickertape()

# Step 1 — get ticker ID
ticker_id, raw = ttp.get_ticker("Infosys", search_place="stock")
print(f"Ticker ID: {ticker_id}")

# Step 2 — get slug
slug = ttp._get_url_of_the_ticker(ticker_id)
print(f"Slug: {slug}")

# Step 3 — get key ratios
ratios = ttp.get_key_ratios(slug)
print("\n--- KEY RATIOS ---")
print(ratios)

# Step 4 — get income data
income = ttp.get_income_data(ticker_id, time_horizon="annual", num_time_periods=2)
print("\n--- INCOME DATA ---")
print(income)