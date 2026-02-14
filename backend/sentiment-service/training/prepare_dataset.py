"""
Dataset Preparation for Financial Sentiment Analysis
Converts Financial PhraseBank and Twitter datasets to instruction-tuning format
"""
import json
import os
from datasets import load_dataset
from sklearn.model_selection import train_test_split


def prepare_financial_phrasebank():
    """
    Download and prepare Financial PhraseBank dataset
    Returns list of formatted examples
    """
    print("Loading Financial PhraseBank dataset...")
    
    # Load the dataset with all agree split (100% expert agreement)
    dataset = load_dataset("financial_phrasebank", "sentences_allagree", trust_remote_code=True)
    
    examples = []
    label_map = {0: "Negative", 1: "Neutral", 2: "Positive"}
    
    for item in dataset['train']:
        text = item['sentence']
        label = label_map[item['label']]
        
        examples.append({
            "instruction": "Analyze the sentiment of this financial headline. Output one word: Positive, Negative, or Neutral.",
            "input": text,
            "output": label
        })
    
    print(f"✓ Loaded {len(examples)} Financial PhraseBank examples")
    return examples


def prepare_twitter_financial():
    """
    Download and prepare Twitter Financial News Sentiment dataset
    Returns list of formatted examples
    """
    print("Loading Twitter Financial News dataset...")
    
    # Load the dataset
    dataset = load_dataset("zeroshot/twitter-financial-news-sentiment", trust_remote_code=True)
    
    examples = []
    label_map = {0: "Bearish", 1: "Bullish", 2: "Neutral"}
    # Map to our format
    sentiment_map = {"Bearish": "Negative", "Bullish": "Positive", "Neutral": "Neutral"}
    
    for item in dataset['train']:
        text = item['text']
        label = label_map[item['label']]
        label = sentiment_map[label]  # Convert to our format
        
        examples.append({
            "instruction": "Analyze the sentiment of this financial headline. Output one word: Positive, Negative, or Neutral.",
            "input": text,
            "output": label
        })
    
    print(f"✓ Loaded {len(examples)} Twitter Financial examples")
    return examples


def save_to_jsonl(examples, filename):
    """
    Save examples to JSONL format
    """
    with open(filename, 'w', encoding='utf-8') as f:
        for example in examples:
            f.write(json.dumps(example) + '\n')
    print(f"✓ Saved {len(examples)} examples to {filename}")


def main():
    """
    Main function to prepare and save datasets
    """
    print("=" * 60)
    print("Financial Sentiment Dataset Preparation")
    print("=" * 60)
    
    # Create output directory
    os.makedirs("data", exist_ok=True)
    
    # Prepare datasets
    phrasebank_examples = prepare_financial_phrasebank()
    twitter_examples = prepare_twitter_financial()
    
    # Combine datasets
    all_examples = phrasebank_examples + twitter_examples
    print(f"\n✓ Total examples: {len(all_examples)}")
    
    # Split into train and validation (90/10)
    train_examples, val_examples = train_test_split(
        all_examples, 
        test_size=0.1, 
        random_state=42,
        stratify=[ex['output'] for ex in all_examples]
    )
    
    print(f"  Train: {len(train_examples)}")
    print(f"  Validation: {len(val_examples)}")
    
    # Save datasets
    save_to_jsonl(train_examples, "data/train.jsonl")
    save_to_jsonl(val_examples, "data/val.jsonl")
    
    # Print sample examples
    print("\n" + "=" * 60)
    print("Sample Examples:")
    print("=" * 60)
    for i, example in enumerate(train_examples[:3], 1):
        print(f"\nExample {i}:")
        print(f"  Input: {example['input'][:100]}...")
        print(f"  Output: {example['output']}")
    
    print("\n" + "=" * 60)
    print("✅ Dataset preparation complete!")
    print("=" * 60)
    print("\nNext steps:")
    print("1. Upload data/train.jsonl and data/val.jsonl to Google Colab")
    print("2. Run the fine-tuning notebook")
    print("3. Download the generated GGUF file")


if __name__ == "__main__":
    main()
