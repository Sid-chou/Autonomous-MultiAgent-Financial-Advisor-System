# Indian Financial Dataset Collection Guide

## Quick Start

### Step 1: Install Dependencies
```bash
cd backend/sentiment-service/training
pip install -r scraper_requirements.txt
```

### Step 2: Run the Scraper
```bash
python scrape_indian_dataset.py
```

This will:
- ✅ Scrape 500+ news articles from Moneycontrol, ET, BS, LiveMint
- ✅ Collect 200+ Reddit posts from Indian investment communities  
- ✅ Auto-label sentiment using heuristics
- ✅ Save to `indian_financial_dataset.csv`

**Expected runtime**: 5-10 minutes

---

## Step 3: Manual Review (Important!)

Open `indian_financial_dataset.csv` in Excel/Google Sheets:

1. Review the `auto_sentiment` column
2. Correct mistakes in `manual_sentiment` column
3. Focus on reviewing ~300-500 samples (especially Neutral ones)

**Tip**: Sort by `auto_sentiment` and review a mix of all three categories

---

## Step 4: Convert to Training Format

```bash
python convert_to_training_format.py
```

This creates `indian_training_data.jsonl` ready for Colab.

---

## Step 5: Upload to Colab

1. Upload `indian_training_data.jsonl` to Google Colab
2. Modify the notebook to load this file instead of HuggingFace datasets
3. Train!

---

## What Gets Scraped

### News Sources (RSS - No Auth Needed)
- **Moneycontrol**: Latest news feed
- **Economic Times**: Top stories + Markets section
- **Business Standard**: Markets RSS
- **LiveMint**: Markets section

### Social Media
- **Reddit**: r/IndiaInvestments, r/IndianStockMarket, r/StocksIndia

---

## Auto-Labeling Logic

The script uses keyword matching:

**Positive**: gain, surge, rally, beat, profit, growth, bullish  
**Negative**: fall, drop, loss, crash, weak, bearish, concern  
**Neutral**: Everything else

**Accuracy**: ~60-70% (that's why manual review is important!)

---



---

## Troubleshooting



### Rate Limiting
The script includes delays. If you still get blocked:
- Reduce max_articles/max_tweets
- Add longer sleep times in the code
- Run at different times

### Empty Results
- Check internet connection
- Some RSS feeds may be temporarily down
- Try again later or disable that source

---

## Dataset Quality Tips

1. **Diversify sources**: Include mix of news + social media
2. **Recent data**: Focus on last 30-60 days for current market language
3. **Manual review**: At least 20-30% of dataset should be manually verified
4. **Balance**: Try to get roughly equal Positive/Negative/Neutral samples

---

## Expected Dataset Size

Running with default settings should give you:
- **News**: 500-700 articles
- **Reddit**: 150-200 posts
- **Total**: ~700-900 samples

**Recommended for training**: 1,500-3,000 samples (run scraper 2-3 times on different days)

---

## Next: Training

Once you have `indian_training_data.jsonl`:
1. Upload to Google Colab
2. Load it in the training notebook
3. Train for 1 epoch (with your Indian data only)
4. Or combine 70% US + 30% Indian for best results

See `TRAINING_GUIDE.md` for full training instructions.
