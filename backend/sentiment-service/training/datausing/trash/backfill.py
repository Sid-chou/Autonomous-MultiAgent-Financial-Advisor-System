"""
backfill_csv.py — Run ONCE locally to add label_confidence to existing CSV.

What it does:
  - Loads your existing final_labeled_project_data.csv
  - Adds label_confidence column to every row:
      'manual'   → row already has a manual label (your ground truth)
      'high'     → title AND body agree, no conflicting signals
      'medium'   → title is clear, body mixed or absent
      'low'      → only body signals, title ambiguous
      'very_low' → conflicting or nothing fires — manual labeling queue
  - Saves updated CSV back in place

After running:
  - Commit the updated CSV to your repo
  - The scraper (v4) handles label_confidence automatically on all new articles
  - This script never needs to run again

Usage:
  cd backend/sentiment-service/training
  python backfill_csv.py
"""

import pandas as pd
import re
import os
import sys


# ── Paste sentiment phrase constants from scraper ─────────────────────────────
# These must stay in sync with scrape_indian_dataset.py

POSITIVE_PHRASES = [
    r'\bbuy\b', r'\baccumulate\b', r'\bbullish\b', r'\bupgrade\b',
    r'\boutperform\b', r'\boverweight\b', r'\bstrong buy\b',
    r'52.week high', r'record high', r'all.time high',
    r'profit\s+(surge|jumps|rises|up\b)',
    r'(rallies?|surges?|jumps?|soars?)\s+\d+',
    r'earnings beat', r'beats? estimates?', r'beats? expectations?',
    r'strong\s+(results|growth|profit|performance)',
    r'upside potential', r'target.*raised', r'price target.*increas',
    r'subscribed\s+\d+x', r'oversubscribed',
    r'net profit\s+(rises?|surges?|jumps?|up\b)',
    r'profit\s+\d+%\s+(rise|jump|surge)',
    r'multibagger', r'record.*profit', r'record.*revenue',
    r'fii.*buying', r'fpi.*buying',
    r'mutual funds raise stakes',
    r'record.*forex reserves',
    r'comex gold jumps', r'gold.*jumps?\b',
    r'ipo.*oversubscribed',
    r'revenue.*grows?', r'revenue.*rises?',
]

NEGATIVE_PHRASES = [
    r'\breduce\b', r'\bsell\b', r'\bunderperform\b', r'\bavoid\b',
    r'\bbearish\b', r'\bunderweight\b',
    r'downgrade', r'target.*cut', r'price target.*decreas',
    r'52.week low', r'record low', r'all.time low',
    r'net loss',
    r'net profit\s+(slips?|drops?|declines?|falls?)',
    r'profit\s+(drops?|slips?|declines?)',
    r'(falls?|drops?|plunges?|slumps?|crashes?|tumbles?)\s+\d+',
    r'bear market', r'worst\s+(week|month|year|session)',
    r'market crash', r'market bloodbath', r'stocks plummet',
    r'stocks slide', r'stocks slump',
    r'default', r'bankruptcy',
    r'rupee.*fall', r'rupee.*weaken', r'rupee.*record low',
    r'mcap.*erodes?',
    r'concurrent losers', r'stocks.*fallen most',
    r'nifty\s+down\s+\d', r'sensex\s+down\s+\d',
    r'penny stocks.*plunge',
    r'indian stocks plummet',
    r'fii.*selling', r'fpi.*selling',
    r'fii.*outflow', r'fpi.*outflow',
    r'outflows?\s+hit', r'record.*outflow',
    r'private credit defaults',
    r'mf.*inflows.*plunge',
    r'bitcoin.*slips?\b', r'crypto.*sell.?off',
    r'morgan stanley downgrades',
    r'nyse to pay sec',
    r'revenue.*declines?\b', r'revenue.*falls?\b',
    r'widening.*loss', r'loss.*widens?',
]

POSITIVE_RE = re.compile('|'.join(POSITIVE_PHRASES), re.IGNORECASE)
NEGATIVE_RE = re.compile('|'.join(NEGATIVE_PHRASES), re.IGNORECASE)


# ── Confidence logic (same as scraper v4) ─────────────────────────────────────

def compute_confidence(title: str, text: str) -> str:
    """
    Returns confidence tier for an auto-labeled row.
    Mirrors auto_label_sentiment() in scrape_indian_dataset.py exactly.

    high     → title AND body agree, no conflict
    medium   → title is clear, body mixed or absent
    low      → only body signals, title ambiguous
    very_low → conflicting signals or nothing fires
    """
    title_lower = str(title).lower()
    full_lower  = (str(title) + ' ' + str(text)).lower()

    t_pos = bool(POSITIVE_RE.search(title_lower))
    t_neg = bool(NEGATIVE_RE.search(title_lower))
    f_pos = bool(POSITIVE_RE.search(full_lower))
    f_neg = bool(NEGATIVE_RE.search(full_lower))

    # HIGH — title and body both agree, no conflict
    if t_neg and f_neg and not t_pos and not f_pos:
        return 'high'
    if t_pos and f_pos and not t_neg and not f_neg:
        return 'high'

    # MEDIUM — title is unambiguous, body may be mixed or absent
    if t_neg and not t_pos:
        return 'medium'
    if t_pos and not t_neg:
        return 'medium'

    # LOW — only body signals, title gives no clear lean
    if f_neg and not f_pos:
        return 'low'
    if f_pos and not f_neg:
        return 'low'

    # VERY LOW — conflicting or nothing fires
    return 'very_low'


def backfill(csv_path: str):
    print(f"Loading: {csv_path}")

    if not os.path.exists(csv_path):
        print(f"❌ File not found: {csv_path}")
        sys.exit(1)

    df = pd.read_csv(csv_path, encoding='utf-8')
    print(f"Loaded: {len(df)} rows")
    print(f"Columns: {df.columns.tolist()}")

    # ── Check if already backfilled ───────────────────────────────────────
    if 'label_confidence' in df.columns:
        already_filled = df['label_confidence'].notna().sum()
        print(f"\nlabel_confidence already exists ({already_filled} filled rows)")
        ans = input("Re-run backfill and overwrite? (y/n): ").strip().lower()
        if ans != 'y':
            print("Aborted.")
            return

    # ── Apply label_confidence to every row ───────────────────────────────
    def assign_confidence(row):
        manual = row.get('manual_sentiment', '')

        # Manually labeled rows → tag as 'manual'
        # These are ground truth — confidence logic doesn't apply to them
        if pd.notna(manual) and str(manual).strip() != '':
            return 'manual'

        # Auto-labeled rows → compute confidence from title + text
        return compute_confidence(
            row.get('title', '') or '',
            row.get('text',  '') or ''
        )

    print("\nBackfilling label_confidence...")
    df['label_confidence'] = df.apply(assign_confidence, axis=1)

    # ── Summary ───────────────────────────────────────────────────────────
    print("\n── label_confidence breakdown ──────────────────────────────")
    c = df['label_confidence'].value_counts()
    print(f"  manual   : {c.get('manual',   0)}  ← your ground truth labels")
    print(f"  high     : {c.get('high',     0)}  ← safe for FinBERT training")
    print(f"  medium   : {c.get('medium',   0)}  ← safe for FinBERT training")
    print(f"  low      : {c.get('low',      0)}  ← review before training")
    print(f"  very_low : {c.get('very_low', 0)}  ← manual labeling queue")

    training_ready = c.get('manual', 0) + c.get('high', 0) + c.get('medium', 0)
    needs_review   = c.get('low', 0) + c.get('very_low', 0)
    print(f"\n  Ready for training : {training_ready} rows")
    print(f"  Needs manual review: {needs_review} rows")

    # ── Save ──────────────────────────────────────────────────────────────
    df.to_csv(csv_path, index=False, encoding='utf-8')
    print(f"\n✅ Saved: {csv_path}")
    print("Next step: commit the updated CSV to your repo")

    # ── Export labeling queue ─────────────────────────────────────────────
    # Gives you a prioritized list of rows to manually label next
    queue_path = os.path.join(os.path.dirname(csv_path), 'labeling_queue.csv')
    queue = df[
        df['manual_sentiment'].isna() &
        df['label_confidence'].isin(['low', 'very_low'])
    ].sort_values('label_confidence')[['title', 'auto_sentiment', 'label_confidence']]

    queue.to_csv(queue_path, index=False, encoding='utf-8')
    print(f"✅ Labeling queue exported: {queue_path} ({len(queue)} rows)")
    print("   Open this file, manually label the rows, paste results back into the main CSV")


if __name__ == '__main__':
    # Path relative to this script's location
    script_dir = os.path.dirname(os.path.abspath(__file__))
    csv_path   = os.path.join(script_dir, 'datausing', 'final_labeled_project_data.csv')
    backfill(csv_path)