"""
Convert CSV dataset to training format (JSONL)
"""
import pandas as pd
import json


def csv_to_jsonl(csv_file='indian_financial_dataset.csv', output_file='indian_training_data.jsonl'):
    """Convert labeled CSV to instruction-tuning format"""
    
    print(f"Reading {csv_file}...")
    df = pd.read_csv(csv_file)
    
    # Use manual_sentiment if available, otherwise auto_sentiment
    df['sentiment'] = df['manual_sentiment'].fillna(df['auto_sentiment'])
    
    # Filter out rows without sentiment
    df = df[df['sentiment'].isin(['Positive', 'Negative', 'Neutral'])]
    
    print(f"Processing {len(df)} labeled examples...")
    
    instruction = "Analyze the sentiment of this financial headline. Output one word: Positive, Negative, or Neutral."
    
    examples = []
    for _, row in df.iterrows():
        example = {
            "instruction": instruction,
            "input": row['full_text'],
            "output": row['sentiment']
        }
        examples.append(example)
    
    # Save to JSONL
    with open(output_file, 'w', encoding='utf-8') as f:
        for example in examples:
            f.write(json.dumps(example) + '\n')
    
    print(f"\n✅ Saved {len(examples)} examples to {output_file}")
    print(f"\nSentiment distribution:")
    print(df['sentiment'].value_counts())
    
    return examples


if __name__ == "__main__":
    csv_to_jsonl()
