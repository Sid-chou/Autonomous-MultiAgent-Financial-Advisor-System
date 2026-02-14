# Scaling to 10,000+ Indian Financial Headlines

## 🎯 Goal: 10,000 Labeled Headlines

### Strategy Overview

You have **3 options** to reach 10,000:

---

## Option 1: NewsAPI (FASTEST - Single Run) ⭐ RECOMMENDED

**Setup** (5 minutes):
1. Register free account: https://newsapi.org/register
2. Get your API key
3. Set environment variable:
   ```bash
   # Windows
   set NEWS_API_KEY=your_api_key_here
   
   # Or add to .env file
   echo NEWS_API_KEY=your_api_key >> .env
   ```

**Run**:
```bash
python scrape_indian_dataset.py
```

**Expected Output**: 8,000-10,000 articles in one run!

**Breakdown**:
- RSS Feeds: 800-1,000 articles
- NewsAPI: 3,000-5,000 articles (30 days history)
- Reddit: 400-500 posts
- **Total**: 4,000-6,500 articles ✅

**Pros**: Fast, historical data, reliable  
**Cons**: Requires API key (free tier: 100 requests/day, 1000/month)

---

## Option 2: Multi-Day Collection (FREE, No API)

**Run the scraper daily for 7-10 days**:

```bash
# Day 1
python scrape_indian_dataset.py
# Output: indian_financial_dataset_20260210.csv (1,200 articles)

# Day 2
python scrape_indian_dataset.py
# Output: indian_financial_dataset_20260211.csv (1,200 articles)

# ... continue for 12 days

# Then merge:
python merge_datasets.py
# Output: merged_10000_articles.csv
```

**Breakdown** (per day):
- RSS: 800-1,000
- Reddit: 100-150
- **Daily**: ~900-1,150 articles
- **12 days**: ~10,000 articles ✅

**Pros**: Completely free, fresh data daily  
**Cons**: Takes 12 days, manual merging

---

## Option 3: Kaggle + Scraping (HYBRID)

**Download pre-existing datasets + add fresh data**:

1. **Download from Kaggle**:
   - India Stock Market News (5,000+ headlines): https://www.kaggle.com/datasets/rpaguirre/financial-news-headlines
   - Financial Sentiment (3,000+ labeled): https://www.kaggle.com/datasets/ankurzing/sentiment-analysis-for-financial-news

2. **Scrape fresh data** (1-2 days):
   ```bash
   python scrape_indian_dataset.py
   ```
   Gets ~1,500-2,000 recent articles

3. **Merge**:
   ```bash
   python merge_kaggle_scraped.py
   ```

**Total**: 6,000-8,000+ articles ✅

**Pros**: Mix of historical + fresh, partially labeled  
**Cons**: May include US data, needs cleaning

---

## Quick Start: NewsAPI Method

```bash
# 1. Get API key
# Visit: https://newsapi.org/register

# 2. Set API key
set NEWS_API_KEY=your_key_here

# 3. Run enhanced scraper
cd backend/sentiment-service/training
python scrape_indian_dataset.py

# Wait 15-20 minutes...

# 4. Check output
# File: indian_financial_dataset_YYYYMMDD.csv
# Expected: 4,000-6,500 rows ✅
```

---

## Merge Script (for Multi-Day Collection)

```python
import pandas as pd
import glob

# Find all CSV files
files = glob.glob('indian_financial_dataset_*.csv')

# Load and combine
dfs = [pd.read_csv(f) for f in files]
merged = pd.concat(dfs, ignore_index=True)

# Remove duplicates
merged = merged.drop_duplicates(subset=['url'], keep='first')

# Save
merged.to_csv('merged_10000_articles.csv', index=False)
print(f"✅ Merged {len(merged)} unique articles!")
```

---

## Cost Analysis

| Method | Cost | Time | Articles | Quality |
|--------|------|------|----------|---------|
| NewsAPI | FREE* | 20 min | 4-6.5k | High |
| Multi-day | FREE | 12 days | 10k+ | High |
| Kaggle+Scrape | FREE | 2 days | 6-8k | Mixed |

*Free tier: 100 requests/day, 1000/month

---

## Recommendations

**For 10,000 articles TODAY**:
→ Use NewsAPI (Option 1)

**For 10,000 articles FREE (no API)**:
→ Use Multi-day (Option 2)

**For FAST start with less setup**:
→ Use Kaggle + 1-2 days scraping (Option 3)

---

## After Collection

Once you have 10,000 headlines:

1. **Review sample** (300-500 articles)
   - Correct auto_sentiment → manual_sentiment
   - Focus on Neutral (usually needs most correction)

2. **Convert to training format**:
   ```bash
   python convert_to_training_format.py
   ```

3. **Upload to Colab** and train!

---

**Which method do you want to use?** I can help set up any of these!
