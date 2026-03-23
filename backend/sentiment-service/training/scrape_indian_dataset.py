"""
Enhanced Indian Financial Dataset Scraper  v4.0
Changes from v3:
  - Removed scope column — unnecessary for current system.
    The Sentiment Agent already filters by ticker at query time,
    so market-wide vs company-specific distinction is handled there.
    Scope added complexity without improving the 77% accuracy problem.

Changes from v2 (still present):
  - auto_label_sentiment() returns (label, confidence) tuple — 4 tiers:
      high      → title AND body agree, no conflicting signals
                  safe to use directly in FinBERT training
      medium    → title is clear, body is mixed or absent
                  use in training with awareness of some noise
      low       → only body signals fire, title ambiguous
                  flag for manual review before using in training
      very_low  → conflicting signals or nothing fires
                  prioritize these for manual labeling queue
  - label_confidence column stored on every article
      training filter : only include high + medium auto-labels
      labeling queue  : work through low + very_low manually
  - Negative-signal sources added (BusinessLine, BS Markets, MC Results)
      structurally negative content — cleaner negative labels
  - No dataset cap — negative samples are rare, never discard them
  - Finance-specific RSS feeds only — no homepage/general feeds
  - Priority-based fallback chain per source group
  - is_financial() topic filter before storing any article
  - Phrase-based sentiment (title-first, no generic words)
  - Title-based deduplication on top of URL dedup
  - Reddit via .json endpoint with proper User-Agent
  - Feed health logging to feed_health_log.csv
"""

import requests
from bs4 import BeautifulSoup
import feedparser
import pandas as pd
from datetime import datetime, timedelta
import time
import re
import os
from typing import List, Dict, Optional


NEWS_API_KEY = os.environ.get('NEWS_API_KEY', '')


# ─────────────────────────────────────────────────────────────────────────────
# TOPIC FILTER CONSTANTS
# ─────────────────────────────────────────────────────────────────────────────

FINANCE_KEYWORDS = [
    'nifty', 'sensex', 'stock', 'share', 'market', 'rupee',
    'sebi', 'rbi', 'ipo', 'equity', 'fund', 'crude', 'gold',
    'profit', 'loss', 'earnings', 'revenue', 'bse', 'nse',
    'fii', 'fpi', 'inflation', 'gdp', 'interest rate', 'bond',
    'dividend', 'buyback', 'quarter', 'q3', 'q4', 'fiscal',
    'smallcap', 'midcap', 'largecap', 'bluechip', 'mutual fund',
    'silver', 'commodity', 'forex', 'treasury', 'yield', 'debt',
    'nbfc', 'bank', 'insurance', 'fintech', 'startup funding',
    'venture capital', 'private equity', 'vc ', 'valuation',
    'listing', 'allotment', 'gmp', 'subscription', 'anchor',
    'results', 'quarterly', 'annual report', 'balance sheet',
    'ebitda', 'pat', 'net profit', 'net loss', 'operating profit',
    'capex', 'mcap', 'market cap', 'portfolio', 'sip', 'nav',
]

# These patterns in the title → reject the article regardless of finance keywords
HARD_EXCLUDE_PATTERNS = [
    r'\bcricket\b', r'\bt20\b', r'\bipl\b', r'\bicc\b', r'\bwpl\b',
    r'world cup.*cricket', r'cricket.*world cup',
    r'\bwicket', r'\bbatting\b', r'\bbowling\b',
    r'\bbollywood\b', r'\bcinema\b', r'\bactor\b', r'\bfilm review\b',
    r'box office',
    r'\bkilled\b.*war', r'\bdead\b.*strike', r'missile strike',
    r'war casualt', r'\bcasualt',
    r'chief minister wins', r'\bmla\b.*win', r'\bmp\b.*win',
    r'election result.*seat',
    r'school assembly',
    r'icc t20 world cup trophy',
    r'bi-weekly advice thread',
    r'promotional content thread',
    r'pitch report.*match preview',
    r'\bwickets?\b',
]

HARD_EXCLUDE_RE = re.compile('|'.join(HARD_EXCLUDE_PATTERNS), re.IGNORECASE)


# ─────────────────────────────────────────────────────────────────────────────
# SENTIMENT PHRASE CONSTANTS  (phrase-based, title-first)
# ─────────────────────────────────────────────────────────────────────────────

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


# ─────────────────────────────────────────────────────────────────────────────
# SOURCE GROUPS  (priority 1 = preferred, 2 = fallback, 3 = last resort)
# ─────────────────────────────────────────────────────────────────────────────
#
# Rule:
#   priority 1 → ET's ID-based feeds (may break silently)
#   priority 2 → path/slug-based feeds (more stable)
#   priority 3 → always-reliable sources
#
# Each group represents one "category" of news.
# Scraper tries priority 1 first; falls back if feed is dead/empty.

SOURCE_GROUPS = {
    "market_news": [
        {"name": "ET Markets",   "url": "https://economictimes.indiatimes.com/markets/rssfeeds/1977021501.cms",        "priority": 1},
        {"name": "ET Stocks",    "url": "https://economictimes.indiatimes.com/markets/stocks/rssfeeds/2146842.cms",    "priority": 1},
        {"name": "ET Economy",   "url": "https://economictimes.indiatimes.com/economy/rssfeeds/1373380680.cms",        "priority": 1},
        {"name": "Business Standard Markets", "url": "https://www.business-standard.com/rss/markets-106.rss",          "priority": 2},
        {"name": "LiveMint Markets",          "url": "https://www.livemint.com/rss/markets",                           "priority": 2},
        {"name": "Moneycontrol",              "url": "https://www.moneycontrol.com/rss/latestnews.xml",                "priority": 3},
    ],
    "stocks_specific": [
        {"name": "MC Buzzing Stocks",    "url": "https://www.moneycontrol.com/rss/buzzingstocks.xml",   "priority": 1},
        {"name": "MC Results",           "url": "https://www.moneycontrol.com/rss/results.xml",         "priority": 1},
        {"name": "Financial Express",    "url": "https://www.financialexpress.com/market/feed/",         "priority": 2},
        {"name": "BusinessLine Markets", "url": "https://www.thehindubusinessline.com/markets/?service=rss", "priority": 2},
    ],
    "economy_macro": [
        {"name": "LiveMint Money",       "url": "https://www.livemint.com/rss/money",                   "priority": 1},
        {"name": "ET Wealth",            "url": "https://economictimes.indiatimes.com/wealth/rssfeeds/837555174.cms", "priority": 1},
        {"name": "Business Standard Economy", "url": "https://www.business-standard.com/rss/economy-policy-102.rss", "priority": 2},
    ],

    # ── Structurally negative sources ────────────────────────────────────
    # These sources publish content that is inherently negative in nature —
    # enforcement orders, earnings misses, company losses, debt defaults.
    # Labels here are far less ambiguous than general market headlines,
    # which directly helps the model learn the Negative class better.
    # No fallback chain needed — if one fails, the others still collect.
    "negative_signals": [
        # MC Results — earnings misses, profit drops, net losses
        {"name": "MC Results",    "url": "https://www.moneycontrol.com/rss/results.xml",   "priority": 1},

        # BusinessLine — tends to cover regulatory actions, downgrades
        {"name": "BusinessLine",  "url": "https://www.thehindubusinessline.com/markets/?service=rss", "priority": 1},

        # BS Markets — debt defaults, FII selling, rating downgrades
        {"name": "BS Markets",    "url": "https://www.business-standard.com/rss/markets-106.rss",     "priority": 1},
    ],
}

# Reddit — separate from SOURCE_GROUPS because it uses a different fetch method
REDDIT_SUBREDDITS = [
    "IndianStockMarket",
    "IndianStreetBets",
    "IndiaInvestments",
]


class EnhancedIndianScraper:

    def __init__(self):
        self.headers = {
            # Proper Reddit-style User-Agent — generic browser UA gets blocked
            'User-Agent': 'python:finbert-india-research:v2.0 (financial sentiment dataset)'
        }
        self.all_articles: List[Dict] = []
        self.seen_urls:    set = set()
        self.seen_titles:  set = set()   # second dedup layer — catches near-duplicate URLs


    # ─────────────────────────────────────────────────────────────────────
    # TOPIC FILTER
    # ─────────────────────────────────────────────────────────────────────

    def is_financial(self, title: str, text: str) -> bool:
        """
        Two-stage filter:
          1. Hard-exclude patterns in title → always reject
          2. Must contain at least one finance keyword
        """
        title_lower = title.lower()
        combined    = (title + ' ' + text).lower()

        # Stage 1 — hard exclude (check title only, faster)
        if HARD_EXCLUDE_RE.search(title_lower):
            return False

        # Stage 2 — must have finance relevance
        return any(kw in combined for kw in FINANCE_KEYWORDS)



    # ─────────────────────────────────────────────────────────────────────
    # SENTIMENT LABELING
    # ─────────────────────────────────────────────────────────────────────

    def auto_label_sentiment(self, title: str, text: str) -> tuple:
        """
        Phrase-based labeling. Returns (label, confidence) tuple.

        Confidence tiers:
          high      → title AND full text agree, zero conflicting signals
                      Safe to use directly in FinBERT training
          medium    → title is unambiguous but body is mixed or thin
                      Use in training with awareness of some noise
          low       → only body signals fire, title is ambiguous
                      Flag for manual review before using in training
          very_low  → conflicting signals or nothing fires at all
                      Prioritize these for manual labeling queue

        Never uses generic words like 'high', 'growth', 'record' alone —
        those fired on war/crisis headlines in the original version.
        """
        title_lower = title.lower()
        full_lower  = (title + ' ' + text).lower()

        t_pos = bool(POSITIVE_RE.search(title_lower))
        t_neg = bool(NEGATIVE_RE.search(title_lower))
        f_pos = bool(POSITIVE_RE.search(full_lower))
        f_neg = bool(NEGATIVE_RE.search(full_lower))

        # ── HIGH confidence: title and body both agree, no conflict ──────
        if t_neg and f_neg and not t_pos and not f_pos:
            return 'Negative', 'high'
        if t_pos and f_pos and not t_neg and not f_neg:
            return 'Positive', 'high'

        # ── MEDIUM confidence: title is clear, body is mixed or absent ───
        if t_neg and not t_pos:
            return 'Negative', 'medium'
        if t_pos and not t_neg:
            return 'Positive', 'medium'

        # ── LOW confidence: only body signals, title gives no clear lean ─
        if f_neg and not f_pos:
            return 'Negative', 'low'
        if f_pos and not f_neg:
            return 'Positive', 'low'

        # ── VERY LOW: conflicting signals or nothing fires ───────────────
        # Both signals present with no title tiebreaker → ambiguous
        # Nothing fires at all → genuinely neutral or too vague to tell
        return 'Neutral', 'very_low'


    # ─────────────────────────────────────────────────────────────────────
    # SHARED FEED PARSER  (used by all RSS sources)
    # ─────────────────────────────────────────────────────────────────────

    def _parse_feed_entries(self, source: dict, feed) -> int:
        """
        Parse a feedparser feed object into self.all_articles.
        Applies is_financial() filter + both dedup checks.
        Returns count of articles actually added.
        """
        count = 0
        for entry in feed.entries:
            url   = entry.get('link', '').strip()
            title = entry.get('title', '').strip()
            text  = BeautifulSoup(
                entry.get('summary', '') or entry.get('description', ''),
                'html.parser'
            ).get_text().strip()

            # URL dedup
            if url in self.seen_urls:
                continue

            # Title dedup (catches same article with different URL params)
            title_norm = re.sub(r'\s+', ' ', title.lower().strip())
            if title_norm in self.seen_titles:
                continue

            # Topic filter — drop non-financial articles at collection time
            if not self.is_financial(title, text):
                continue

            # Sentiment + confidence — returns (label, confidence) tuple
            sentiment, confidence = self.auto_label_sentiment(title, text)

            article = {
                'source':           source['name'],
                'source_type':      'news',
                'title':            title,
                'text':             text,
                'url':              url,
                'published':        entry.get('published', ''),
                'collected_at':     datetime.now().isoformat(),
                'full_text':        f"{title}. {text}",
                'auto_sentiment':   sentiment,
                'label_confidence': confidence,
                'manual_sentiment': '',
            }

            self.all_articles.append(article)
            self.seen_urls.add(url)
            self.seen_titles.add(title_norm)
            count += 1

        return count


    # ─────────────────────────────────────────────────────────────────────
    # FEED HEALTH LOGGER
    # ─────────────────────────────────────────────────────────────────────

    def _log_feed_health(self, source_name: str, status: str, count: int, note: str = ''):
        """
        Appends one row to feed_health_log.csv after every feed attempt.
        After a week of runs you can see which ET IDs are degrading.
        Status: 'ok' | 'empty' | 'malformed' | 'error'
        """
        log_path = 'feed_health_log.csv'
        row = {
            'timestamp':   datetime.now().isoformat(),
            'source':      source_name,
            'status':      status,
            'count':       count,
            'note':        note,
        }
        pd.DataFrame([row]).to_csv(
            log_path,
            mode='a',
            header=not os.path.exists(log_path),
            index=False
        )


    # ─────────────────────────────────────────────────────────────────────
    # FALLBACK-AWARE RSS SCRAPER
    # ─────────────────────────────────────────────────────────────────────

    def scrape_rss_feeds(self, min_articles_per_group: int = 30):
        """
        For each source group, try feeds in priority order.
        If priority-1 feeds are healthy → skip lower priorities.
        If they fail or return too few → fall through to next tier.
        """
        print("📰 Scraping RSS Feeds (with fallback chain)...\n")
        total = 0

        for group_name, sources in SOURCE_GROUPS.items():
            print(f"  ── Group: {group_name} ──")
            group_collected = 0
            highest_priority_ok = False

            sorted_sources = sorted(sources, key=lambda x: x['priority'])

            for source in sorted_sources:

                # If priority-1 already gave enough, skip lower-priority sources
                if highest_priority_ok and source['priority'] > 1:
                    print(f"    ⏭  Skipping {source['name']} (primary was healthy)")
                    continue

                try:
                    feed = feedparser.parse(source['url'])

                    # Malformed feed
                    if feed.bozo and len(feed.entries) == 0:
                        msg = str(getattr(feed, 'bozo_exception', 'unknown'))
                        print(f"    ⚠️  {source['name']} — malformed: {msg}")
                        self._log_feed_health(source['name'], 'malformed', 0, msg)
                        continue

                    # Empty feed (ID likely dead)
                    if len(feed.entries) < 5:
                        print(f"    ⚠️  {source['name']} — only {len(feed.entries)} entries, likely dead")
                        self._log_feed_health(source['name'], 'empty', len(feed.entries))
                        continue

                    # Parse
                    count = self._parse_feed_entries(source, feed)
                    group_collected += count
                    print(f"    ✓  {source['name']}: {count} articles added")
                    self._log_feed_health(source['name'], 'ok', count)

                    # Mark priority-1 healthy if it delivered enough
                    if source['priority'] == 1 and group_collected >= min_articles_per_group:
                        highest_priority_ok = True

                except Exception as e:
                    print(f"    ✗  {source['name']} — exception: {e}")
                    self._log_feed_health(source['name'], 'error', 0, str(e))
                    continue

                time.sleep(1)

            if group_collected == 0:
                print(f"    🚨 ALL sources failed for group '{group_name}'")
            elif group_collected < min_articles_per_group:
                print(f"    ⚠️  Only {group_collected}/{min_articles_per_group} target for '{group_name}'")
            else:
                print(f"    ✅ {group_collected} articles collected for '{group_name}'")

            total += group_collected
            print()

        print(f"✓ Total from RSS: {total} articles\n")


    # ─────────────────────────────────────────────────────────────────────
    # REDDIT SCRAPER  (.json endpoint, not official API)
    # ─────────────────────────────────────────────────────────────────────
    #
    # NOTE: This uses Reddit's .json trick (not the paid API).
    # Works for casual scraping but is unofficial — Reddit can break it.
    # If it fails, the scraper continues without Reddit data.
    # Reddit is supplementary; primary data comes from RSS feeds above.

    def scrape_reddit(self, max_posts_per_sub: int = 100):
        """
        Fetch posts via Reddit's .json endpoint.
        Uses proper User-Agent format Reddit expects.
        Paginates with 'after' token (max ~3 pages reliable).
        Only stores posts that pass is_financial() filter.
        """
        print("🔴 Scraping Reddit (.json endpoint)...")

        for subreddit in REDDIT_SUBREDDITS:
            print(f"  Fetching r/{subreddit}...")
            collected = 0
            after     = None
            page      = 0

            while collected < max_posts_per_sub:
                try:
                    url    = f"https://www.reddit.com/r/{subreddit}/hot.json?limit=100"
                    if after:
                        url += f"&after={after}"

                    resp = requests.get(url, headers=self.headers, timeout=10)

                    if resp.status_code == 429:
                        print(f"    ⚠️  Rate limited on r/{subreddit}, skipping")
                        break

                    if resp.status_code != 200:
                        print(f"    ⚠️  HTTP {resp.status_code} on r/{subreddit}")
                        break

                    data  = resp.json().get('data', {})
                    posts = data.get('children', [])

                    if not posts:
                        break

                    for post in posts:
                        p     = post.get('data', {})
                        p_url = p.get('url', '')
                        title = p.get('title', '').strip()
                        text  = p.get('selftext', '').strip()

                        if p_url in self.seen_urls:
                            continue

                        title_norm = re.sub(r'\s+', ' ', title.lower().strip())
                        if title_norm in self.seen_titles:
                            continue

                        # Finance filter — Reddit has a lot of junk
                        if not self.is_financial(title, text):
                            continue

                        # Sentiment + confidence tuple
                        sentiment, confidence = self.auto_label_sentiment(title, text)

                        article = {
                            'source':           f"r/{subreddit}",
                            'source_type':      'social',
                            'title':            title,
                            'text':             text[:500],   # cap body length
                            'url':              p_url,
                            'published':        datetime.utcfromtimestamp(
                                                    p.get('created_utc', 0)
                                                ).isoformat(),
                            'collected_at':     datetime.now().isoformat(),
                            'full_text':        f"{title}. {text[:500]}",
                            'auto_sentiment':   sentiment,
                            'label_confidence': confidence,
                            'manual_sentiment': '',
                        }

                        self.all_articles.append(article)
                        self.seen_urls.add(p_url)
                        self.seen_titles.add(title_norm)
                        collected += 1

                    after = data.get('after')
                    page += 1

                    # .json pagination becomes unreliable after ~3 pages
                    if not after or page >= 3:
                        break

                    time.sleep(2)   # be polite — Reddit blocks fast scrapers

                except Exception as e:
                    print(f"    ✗  r/{subreddit} failed: {e}")
                    break

            print(f"    ✓  r/{subreddit}: {collected} posts added")
            time.sleep(2)

        reddit_total = len([a for a in self.all_articles if a['source_type'] == 'social'])
        print(f"✓ Total from Reddit: {reddit_total} posts\n")


    # ─────────────────────────────────────────────────────────────────────
    # NEWS API  (optional, requires free key from newsapi.org)
    # ─────────────────────────────────────────────────────────────────────

    def scrape_news_api(self, max_articles: int = 3000):
        if not NEWS_API_KEY:
            print("📡 NewsAPI skipped — set NEWS_API_KEY env variable")
            print("   Free key: https://newsapi.org/register\n")
            return

        print("📡 Scraping NewsAPI...")

        queries = [
            "nifty OR sensex",
            "NSE OR BSE india stocks",
            "indian stock market",
            "RBI OR SEBI india",
            "india IPO",
        ]

        from_date = (datetime.now() - timedelta(days=30)).strftime('%Y-%m-%d')

        for query in queries:
            try:
                params = {
                    'q':        query,
                    'from':     from_date,
                    'language': 'en',
                    'sortBy':   'publishedAt',
                    'apiKey':   NEWS_API_KEY,
                    'pageSize': 100,
                }
                resp = requests.get("https://newsapi.org/v2/everything", params=params, timeout=10)

                if resp.status_code != 200:
                    print(f"  ⚠️  NewsAPI error {resp.status_code} for '{query}'")
                    continue

                count = 0
                for item in resp.json().get('articles', []):
                    url   = item.get('url', '')
                    title = item.get('title', '') or ''
                    text  = item.get('description', '') or ''

                    if url in self.seen_urls:
                        continue

                    title_norm = re.sub(r'\s+', ' ', title.lower().strip())
                    if title_norm in self.seen_titles:
                        continue

                    if not self.is_financial(title, text):
                        continue

                    sentiment, confidence = self.auto_label_sentiment(title, text)

                    article = {
                        'source':           item.get('source', {}).get('name', 'NewsAPI'),
                        'source_type':      'news',
                        'title':            title,
                        'text':             text,
                        'url':              url,
                        'published':        item.get('publishedAt', ''),
                        'collected_at':     datetime.now().isoformat(),
                        'full_text':        f"{title}. {text}",
                        'auto_sentiment':   sentiment,
                        'label_confidence': confidence,
                        'manual_sentiment': '',
                    }

                    self.all_articles.append(article)
                    self.seen_urls.add(url)
                    self.seen_titles.add(title_norm)
                    count += 1

                print(f"  ✓  '{query}': {count} articles")
                time.sleep(1)

            except Exception as e:
                print(f"  ✗  '{query}' failed: {e}")

        news_api_total = len([a for a in self.all_articles if 'NewsAPI' in str(a.get('source', ''))])
        print(f"✓ Total from NewsAPI: {news_api_total} articles\n")


    # ─────────────────────────────────────────────────────────────────────
    # SAVE  (append-safe, deduplicates against existing file)
    # ─────────────────────────────────────────────────────────────────────

    def save_to_csv(self, filename: Optional[str] = None) -> Optional[pd.DataFrame]:
        if filename is None:
            script_dir = os.path.dirname(os.path.abspath(__file__))
            filename   = os.path.join(script_dir, 'datausing', 'final_labeled_project_data.csv')

        print(f"💾 Saving to {filename}...")

        if not self.all_articles:
            print("  ✗ No new articles collected — nothing to save")
            return None

        new_df = pd.DataFrame(self.all_articles)

        if os.path.exists(filename):
            print(f"  📂 Existing file found, appending...")
            existing_df = pd.read_csv(filename, encoding='utf-8')
            print(f"  📊 Existing rows: {len(existing_df)}")

            combined_df = pd.concat([existing_df, new_df], ignore_index=True)

            before = len(combined_df)

            # Dedup on URL
            combined_df = combined_df.drop_duplicates(subset=['url'], keep='first')

            # Dedup on normalized title (catches near-duplicate URLs)
            combined_df['_title_norm'] = combined_df['title'].fillna('').str.lower().str.strip()
            combined_df['_title_norm'] = combined_df['_title_norm'].str.replace(r'\s+', ' ', regex=True)
            combined_df = combined_df.drop_duplicates(subset=['_title_norm'], keep='first')
            combined_df.drop(columns=['_title_norm'], inplace=True)

            removed = before - len(combined_df)
            print(f"  🗑️  Duplicates removed (URL + title): {removed}")
            print(f"  ➕ Net new articles added: {len(new_df) - removed}")
            df = combined_df

        else:
            print(f"  📄 Creating new file...")
            df = new_df.copy()
            df['_title_norm'] = df['title'].fillna('').str.lower().str.strip()
            df = df.drop_duplicates(subset=['url'], keep='first')
            df = df.drop_duplicates(subset=['_title_norm'], keep='first')
            df.drop(columns=['_title_norm'], inplace=True)

        df.to_csv(filename, index=False, encoding='utf-8')

        # ── Summary ──────────────────────────────────────────────────────
        v = df['auto_sentiment'].value_counts()
        print(f"\n✅ Total articles in dataset: {len(df)}")
        print(f"   News:   {len(df[df['source_type'] == 'news'])}")
        print(f"   Social: {len(df[df['source_type'] == 'social'])}")
        print(f"\n   Auto-Sentiment Distribution:")
        print(f"   Positive : {v.get('Positive', 0)}")
        print(f"   Negative : {v.get('Negative', 0)}")
        print(f"   Neutral  : {v.get('Neutral',  0)}")

        # Confidence breakdown — tells you how much of the auto-labeled
        # data is actually safe to use for FinBERT training
        if 'label_confidence' in df.columns:
            c = df[df['manual_sentiment'].isna()]['label_confidence'].value_counts()
            print(f"\n   Auto-label confidence (unlabeled rows):")
            print(f"   high      : {c.get('high',     0)}  ← safe for training")
            print(f"   medium    : {c.get('medium',   0)}  ← safe for training")
            print(f"   low       : {c.get('low',      0)}  ← review before training")
            print(f"   very_low  : {c.get('very_low', 0)}  ← manual labeling queue")

        # Manual labeling progress
        manual_done    = df['manual_sentiment'].notna().sum()
        manual_pending = df['manual_sentiment'].isna().sum()
        print(f"\n   Manual labels: {manual_done} done, {manual_pending} pending")

        # Scope breakdown

        print(f"\n   Top sources:")
        print(df['source'].value_counts().head(8).to_string())

        return df


# ─────────────────────────────────────────────────────────────────────────────
# MAIN
# ─────────────────────────────────────────────────────────────────────────────

def main():
    print("=" * 60)
    print("Enhanced Indian Financial Dataset Scraper  v3.0")
    print("=" * 60)

    scraper = EnhancedIndianScraper()

    # 1. RSS — primary collection, fallback-aware
    scraper.scrape_rss_feeds(min_articles_per_group=30)

    # 2. NewsAPI — only if key is set
    if NEWS_API_KEY:
        scraper.scrape_news_api(max_articles=3000)
    else:
        print("💡 Tip: set NEWS_API_KEY env variable for 3000+ more articles")
        print("   https://newsapi.org/register (free tier)\n")

    # 3. Reddit — supplementary, unofficial .json endpoint
    #    If Reddit blocks/breaks this, RSS data is still collected above
    scraper.scrape_reddit(max_posts_per_sub=100)

    # 4. Save / append
    script_dir  = os.path.dirname(os.path.abspath(__file__))
    output_path = os.path.join(script_dir, 'datausing', 'final_labeled_project_data.csv')
    scraper.save_to_csv(output_path)

    print("\n" + "=" * 60)
    print("Check feed_health_log.csv to monitor which feeds are degrading")
    print("=" * 60)


if __name__ == "__main__":
    main()