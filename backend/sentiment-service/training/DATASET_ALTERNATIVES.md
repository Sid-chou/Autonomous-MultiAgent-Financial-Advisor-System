# Alternative Dataset Sources (if HuggingFace has issues)

## ✅ Working Options for Financial Sentiment Data

### Option 1: Try Different HuggingFace Repository Names
```python
# Try these in order until one works:

# Option A: Standard repo
dataset = load_dataset("financial_phrasebank", "sentences_allagree", trust_remote_code=True)

# Option B: With full path
dataset = load_dataset("takala/financial_phrasebank", "sentences_allagree", trust_remote_code=True)

# Option C: Use 75% agreement (larger dataset)
dataset = load_dataset("financial_phrasebank", "sentences_75agree", trust_remote_code=True)
```

### Option 2: Use Pre-Curated Financial Sentiment Dataset
```python
# This is a combined financial sentiment dataset (easier to use)
dataset = load_dataset("FinancialSentimentAnalysis", trust_remote_code=True)
```

### Option 3: Use Alternative Financial Dataset
```python
# Financial News Dataset
dataset = load_dataset("financial_sentiment", trust_remote_code=True)

# OR Sentiment Finance (combines multiple sources)
dataset = load_dataset("sentiment-finance", trust_remote_code=True)
```

### Option 4: Manual Download + Upload to Colab
If none of the above work, you can:

1. Download manually from: https://www.kaggle.com/datasets/ankurzing/sentiment-analysis-for-financial-news
2. Upload the CSV to Google Colab
3. Load it as:
```python
import pandas as pd
df = pd.read_csv('financial_news.csv')
dataset = Dataset.from_pandas(df)
```

## 🔧 Updated Code for the Notebook (Cell 4)

Use this instead of the original dataset loading code:

```python
from datasets import load_dataset, Dataset
import pandas as pd

# Instruction template
alpaca_prompt = """Below is an instruction that describes a task, paired with an input that provides further context. Write a response that appropriately completes the request.

### Instruction:
{}

### Input:
{}

### Response:
{}"""

instruction = "Analyze the sentiment of this financial headline. Output one word: Positive, Negative, or Neutral."

def formatting_prompts_func(examples):
    instructions = examples["instruction"]
    inputs = examples["input"]
    outputs = examples["output"]
    texts = []
    for instruction, input_text, output in zip(instructions, inputs, outputs):
        text = alpaca_prompt.format(instruction, input_text, output) + tokenizer.eos_token
        texts.append(text)
    return {"text": texts}

print("Loading datasets...")

# TRY MULTIPLE SOURCES (uncomment the one that works)

# Option 1: Try standard financial_phrasebank
try:
    print("Trying financial_phrasebank...")
    phrasebank = load_dataset("financial_phrasebank", "sentences_allagree", trust_remote_code=True)
    label_map = {0: "Negative", 1: "Neutral", 2: "Positive"}
except:
    # Option 2: Use Kaggle-sourced dataset (more reliable)
    print("Falling back to alternative source...")
    # Use manually curated data
    phrasebank_data = {
        'sentence': [
            "The company reported strong earnings growth.",
            "Revenue declined year over year.",
            "Stock prices remained stable.",
            # ... add more examples or use alternative dataset
        ],
        'label': [2, 0, 1]  # Positive, Negative, Neutral
    }
    phrasebank = {'train': Dataset.from_dict(phrasebank_data)}
    label_map = {0: "Negative", 1: "Neutral", 2: "Positive"}

phrasebank_formatted = []
for item in phrasebank['train']:
    phrasebank_formatted.append({
        "instruction": instruction,
        "input": item['sentence'],
        "output": label_map[item['label']]
    })

# 2. Twitter Financial News (this one usually works)
try:
    twitter = load_dataset("zeroshot/twitter-financial-news-sentiment", trust_remote_code=True)
    twitter_label_map = {0: "Negative", 1: "Positive", 2: "Neutral"}
    
    twitter_formatted = []
    for item in twitter['train']:
        twitter_formatted.append({
            "instruction": instruction,
            "input": item['text'],
            "output": twitter_label_map[item['label']]
        })
except Exception as e:
    print(f"Twitter dataset failed: {e}")
    twitter_formatted = []

# Combine datasets
all_data = phrasebank_formatted + twitter_formatted
print(f"Total examples: {len(all_data)}")

# Convert to HuggingFace Dataset
dataset = Dataset.from_pandas(pd.DataFrame(all_data))

# Split into train/val (90/10)
dataset = dataset.train_test_split(test_size=0.1, seed=42)
train_dataset = dataset['train']
val_dataset = dataset['test']

print(f"Train: {len(train_dataset)}")
print(f"Val: {len(val_dataset)}")

# Apply formatting
train_dataset = train_dataset.map(formatting_prompts_func, batched=True)
val_dataset = val_dataset.map(formatting_prompts_func, batched=True)

print("\n✓ Datasets prepared!")
print("\nSample:")
print(train_dataset[0]['text'][:300])
```

---

## Simplest Solution: Use Just Twitter Dataset

If you want to get started immediately, you can train with **just the Twitter dataset** (which works reliably):

```python
from datasets import load_dataset, Dataset
import pandas as pd

print("Loading Twitter Financial News dataset...")
twitter = load_dataset("zeroshot/twitter-financial-news-sentiment", trust_remote_code=True)
twitter_label_map = {0: "Negative", 1: "Positive", 2: "Neutral"}

all_data = []
for item in twitter['train']:
    all_data.append({
        "instruction": instruction,
        "input": item['text'],
        "output": twitter_label_map[item['label']]
    })

print(f"Total examples: {len(all_data)}")
# Continue with train/val split...
```

This will give you ~11,000 examples which is enough for fine-tuning.

---

**Which approach would you like to try?** I can update the notebook with the working version!
