PRD: Financial Sentiment Analyst Agent (Fine-Tuned)
Version: 1.0 Status: Draft Owner: [Your Name] Tech Stack: Python, Unsloth (for fast fine-tuning), Llama-3 (8B) or Mistral (7B).

1. Executive Summary
The Sentiment Analyst Agent is a specialized "Small Language Model" (SLM) designed to classify financial news, tweets, and headlines into three strict categories: Bullish (Positive), Bearish (Negative), or Neutral. Unlike general-purpose LLMs, this model is fine-tuned to understand financial jargon, sarcasm, and "market-speak."

2. Problem Statement
The Issue: Standard models (like GPT-3.5) struggle with financial context.

Example: "Operating costs increased, but margins expanded."

Generic Model: "Negative" (saw "costs increased").

Financial Reality: "Positive" (margins are what matter).

The Goal: Create a model with >85% accuracy on financial text classification to serve as a reliable input for the Portfolio Manager.

3. Data Strategy (The "Fuel")
This section answers: "Where will we gather the relevant dataset?"

We will use High-Quality, Labeled Financial Datasets. We do not need to scrape raw data ourselves for training; we should use established academic datasets to ensure the "Ground Truth" is accurate.

Primary Datasets (Open Source)
Financial PhraseBank (The Gold Standard)

Source: HuggingFace - Financial PhraseBank

Content: 4,840 sentences from financial news, annotated by 16 experts.

Selection: Use the sentences_allagree split (100% expert agreement) for the highest quality.

Twitter Financial News Sentiment (The "Social" Angle)

Source: HuggingFace - zeroshot/twitter-financial-news-sentiment

Content: Annotated tweets about stocks.

Why: To capture the informal, hype-driven language of retail investors.

Data Preparation Steps
We must convert these datasets into a unified Instruction Tuning Format (JSONL).

Target Format (Alpaca/ShareGPT Style):

JSON
{
  "instruction": "Analyze the sentiment of this financial headline. Output one word: Positive, Negative, or Neutral.",
  "input": "Technip was awarded a contract, but the value was not disclosed.",
  "output": "Neutral"
}
4. Technical Implementation Steps
This section answers: "What steps to fine-tune the model?"

We will use QLoRA (Quantized Low-Rank Adaptation). This allows us to fine-tune a powerful 8-billion parameter model on a free Google Colab (T4 GPU).

Step 1: Setup & Environment
Platform: Google Colab (Free Tier) or Kaggle Kernels.

Library: Unsloth (Highly recommended - 2x faster, 60% less memory) or HuggingFace TRL.

Base Model: unsloth/llama-3-8b-bnb-4bit (Pre-quantized for efficiency).

Step 2: The Training Pipeline
Load Model: Load Llama-3 in 4-bit precision.

Attach LoRA Adapters:

Rank (r): 16 (Standard for classification tasks).

Alpha: 32.

Target Modules: q_proj, k_proj, v_proj, o_proj (Attention layers).

Load Dataset: Import the prepared JSONL file from the Data Strategy section.

Training Parameters:

Epochs: 1 (Keep it low to avoid overfitting on small data).

Learning Rate: 2e-4.

Batch Size: 2 (Small for stability).

Step 3: Export & Serving
Merge: Merge the trained LoRA adapters back into the base model.

Convert: Convert the model to GGUF format.

Why: To run it locally on your laptop using Ollama.

Serve: Create a custom Modelfile for Ollama:

Dockerfile
FROM ./my-financial-sentiment-model.gguf
SYSTEM "You are a senior financial analyst. Respond ONLY with: Positive, Negative, or Neutral."
5. Success Metrics (How we know it works)
Accuracy: >85% on a holdout test set (data the model has never seen).

Latency: <500ms per inference (essential for real-time analysis).

Format Compliance: 100% of outputs must be exactly one word (Positive/Negative/Neutral). No "I think it is..." fluff.