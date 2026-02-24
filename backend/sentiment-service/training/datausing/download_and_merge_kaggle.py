"""
Download Kaggle Indian Financial News Dataset and merge with scraped data
"""
import pandas as pd
import os

try:
    import kagglehub
    KAGGLE_AVAILABLE = True
except ImportError:
    KAGGLE_AVAILABLE = False
    print("⚠️  kagglehub not installed")
    print("   Install with: pip install kagglehub")


def download_kaggle_dataset():
    """Download Indian financial news from Kaggle"""
    if not KAGGLE_AVAILABLE:
        print("Please install kagglehub first: pip install kagglehub")
        return None
    
    print("=" * 60)
    print("Downloading Kaggle Dataset...")
    print("=" * 60)
    
    try:
        # Download latest version
        path = kagglehub.dataset_download("hkapoor/indian-financial-news-articles-20032020")
        
        print(f"\n✓ Dataset downloaded to: {path}")
        
        # Find CSV file in the downloaded path
        csv_files = [f for f in os.listdir(path) if f.endswith('.csv')]
        
        if not csv_files:
            print("✗ No CSV file found in downloaded dataset")
            return None
        
        csv_path = os.path.join(path, csv_files[0])
        print(f"✓ Found CSV: {csv_files[0]}")
        
        # Load the dataset
        print("\nLoading Kaggle dataset...")
        df_kaggle = pd.read_csv(csv_path)
        print(f"✓ Loaded {len(df_kaggle)} articles from Kaggle")
        
        return df_kaggle
        
    except Exception as e:
        print(f"✗ Error downloading Kaggle dataset: {e}")
        print("\nNote: You may need to configure Kaggle API credentials")
        print("See: https://github.com/Kaggle/kaggle-api#api-credentials")
        return None


def load_scraped_data():
    """Load your scraped Indian financial data"""
    print("\nLoading scraped dataset...")
    
    # Find the most recent scraped file
    scraped_files = [f for f in os.listdir('.') if f.startswith('indian_financial_dataset_') and f.endswith('.csv')]
    
    if not scraped_files:
        print("✗ No scraped dataset found")
        return None
    
    # Get most recent
    scraped_files.sort(reverse=True)
    latest_file = scraped_files[0]
    
    print(f"✓ Found scraped data: {latest_file}")
    
    df_scraped = pd.read_csv(latest_file)
    print(f"✓ Loaded {len(df_scraped)} articles from scraper")
    
    return df_scraped


def standardize_kaggle_format(df_kaggle):
    """Standardize Kaggle dataset to match scraped format"""
    print("\nStandardizing Kaggle dataset format...")
    
    # Check what columns Kaggle dataset has
    print(f"Kaggle columns: {list(df_kaggle.columns)}")
    
    # Common Kaggle dataset formats - adapt as needed
    standardized = pd.DataFrame()
    
    # Try to map columns (adjust based on actual Kaggle dataset structure)
    if 'headline' in df_kaggle.columns:
        standardized['title'] = df_kaggle['headline']
        standardized['text'] = df_kaggle.get('description', '')
    elif 'title' in df_kaggle.columns:
        standardized['title'] = df_kaggle['title']
        standardized['text'] = df_kaggle.get('content', df_kaggle.get('description', ''))
    else:
        # Use first text column as title
        text_col = df_kaggle.select_dtypes(include=['object']).columns[0]
        standardized['title'] = df_kaggle[text_col]
        standardized['text'] = ''
    
    # Add standard fields
    standardized['source'] = 'Kaggle-BusinessStandard'
    standardized['source_type'] = 'news'
    standardized['url'] = ''
    standardized['published'] = df_kaggle.get('date', '')
    standardized['collected_at'] = pd.Timestamp.now().isoformat()
    standardized['full_text'] = standardized['title'] + '. ' + standardized['text'].fillna('')
    standardized['auto_sentiment'] = ''
    standardized['manual_sentiment'] = ''
    
    print(f"✓ Standardized {len(standardized)} Kaggle articles")
    
    return standardized


def merge_datasets(df_kaggle, df_scraped, output_file='merged_indian_dataset.csv'):
    """Merge Kaggle and scraped datasets"""
    print("\nMerging datasets...")
    
    # Standardize Kaggle format
    df_kaggle_std = standardize_kaggle_format(df_kaggle)
    
    # Combine
    merged = pd.concat([df_kaggle_std, df_scraped], ignore_index=True)
    
    # Remove duplicates based on title (case-insensitive)
    merged['title_lower'] = merged['title'].str.lower()
    merged = merged.drop_duplicates(subset=['title_lower'], keep='first')
    merged = merged.drop(columns=['title_lower'])
    
    # Auto-label sentiment for Kaggle articles (if not already labeled)
    print("\nAuto-labeling Kaggle articles...")
    
    def auto_label(text):
        text_lower = str(text).lower()
        positive = ['gain', 'surge', 'rally', 'beat', 'profit', 'growth', 'rise', 'bullish']
        negative = ['fall', 'drop', 'loss', 'miss', 'crash', 'weak', 'bearish', 'decline']
        
        pos_count = sum(1 for w in positive if w in text_lower)
        neg_count = sum(1 for w in negative if w in text_lower)
        
        if pos_count > neg_count + 1:
            return 'Positive'
        elif neg_count > pos_count + 1:
            return 'Negative'
        return 'Neutral'
    
    # Label only if auto_sentiment is empty
    mask = merged['auto_sentiment'].fillna('') == ''
    merged.loc[mask, 'auto_sentiment'] = merged.loc[mask, 'full_text'].apply(auto_label)
    
    # Save
    merged.to_csv(output_file, index=False, encoding='utf-8')
    
    print("\n" + "=" * 60)
    print("✅ MERGE COMPLETE!")
    print("=" * 60)
    print(f"Output file: {output_file}")
    print(f"Total articles: {len(merged)}")
    print(f"  - From Kaggle: {len(df_kaggle_std)}")
    print(f"  - From scraper: {len(df_scraped)}")
    print(f"  - Duplicates removed: {len(df_kaggle_std) + len(df_scraped) - len(merged)}")
    print(f"\nSentiment distribution:")
    print(merged['auto_sentiment'].value_counts())
    print("=" * 60)
    
    return merged


def main():
    """Main execution"""
    print("\n" + "=" * 60)
    print("Kaggle Dataset Downloader & Merger")
    print("=" * 60)
    
    # 1. Download Kaggle dataset
    df_kaggle = download_kaggle_dataset()
    
    if df_kaggle is None:
        print("\n✗ Could not download Kaggle dataset")
        print("Continuing with scraped data only...")
        return
    
    # 2. Load scraped data
    df_scraped = load_scraped_data()
    
    if df_scraped is None:
        print("\n✗ No scraped data found")
        print("Using Kaggle dataset only...")
        df_scraped = pd.DataFrame()  # Empty dataframe
    
    # 3. Merge
    merged = merge_datasets(df_kaggle, df_scraped)
    
    print("\n🎉 Next steps:")
    print("1. Review: merged_indian_dataset.csv")
    print("2. Correct labels (sample 500-1000 in manual_sentiment column)")
    print("3. Convert: python convert_to_training_format.py")
    print("4. Train in Google Colab!")


if __name__ == "__main__":
    main()
