"""
Model Testing and Benchmarking Script
Tests and compares Ollama fine-tuned model vs FinBERT
"""
import argparse
import json
import time
from datetime import datetime
from typing import List, Dict
import requests

# Model configuration
OLLAMA_API_URL = "http://localhost:11434/api/generate"
SERVICE_API_URL = "http://localhost:5000"


def test_ollama_availability():
    """Check if Ollama is running"""
    try:
        response = requests.get("http://localhost:11434/api/tags", timeout=2)
        return response.status_code == 200
    except:
        return False


def test_service_health():
    """Check sentiment service health"""
    try:
        response = requests.get(f"{SERVICE_API_URL}/health", timeout=2)
        if response.status_code == 200:
            data = response.json()
            return data
        return None
    except:
        return None


def test_format_compliance(samples=100):
    """Test that model outputs are in correct format"""
    print("\n" + "="*60)
    print("FORMAT COMPLIANCE TEST")
    print("="*60)
    
    test_texts = [
        "The company reported strong earnings growth.",
        "Stock prices declined sharply today.",
        "Quarterly revenue remained flat.",
        "The CEO announced a major restructuring plan.",
        "Operating margins improved slightly.",
    ]
    
    # Extend test texts to reach desired sample count
    all_tests = (test_texts * (samples // len(test_texts) + 1))[:samples]
    
    valid_outputs = ["Positive", "Negative", "Neutral"]
    compliant = 0
    non_compliant = []
    
    for i, text in enumerate(all_tests, 1):
        try:
            response = requests.post(
                f"{SERVICE_API_URL}/api/v1/test-finetuned",
                json={"text": text},
                timeout=10
            )
            
            if response.status_code == 200:
                data = response.json()
                sentiment = data.get("sentiment", "")
                
                if sentiment in valid_outputs:
                    compliant += 1
                else:
                    non_compliant.append({
                        "text": text,
                        "output": sentiment
                    })
        except Exception as e:
            print(f"Error on sample {i}: {e}")
    
    compliance_rate = (compliant / samples) * 100
    
    print(f"\nResults:")
    print(f"  Total samples: {samples}")
    print(f"  Compliant: {compliant}")
    print(f"  Non-compliant: {len(non_compliant)}")
    print(f"  Compliance rate: {compliance_rate:.2f}%")
    
    if non_compliant:
        print(f"\nNon-compliant samples:")
        for item in non_compliant[:5]:
            print(f"  - {item}")
    
    return compliance_rate >= 100.0


def test_latency(samples=20):
    """Test response latency"""
    print("\n" + "="*60)
    print("LATENCY TEST")
    print("="*60)
    
    test_texts = [
        "The company beat earnings expectations.",
        "Revenue declined year over year.",
        "The stock price remained stable.",
    ]
    
   all_tests = (test_texts * (samples // len(test_texts) + 1))[:samples]
    
    latencies = []
    
    for text in all_tests:
        try:
            start = time.time()
            response = requests.post(
                f"{SERVICE_API_URL}/api/v1/test-finetuned",
                json={"text": text},
                timeout=10
            )
            end = time.time()
            
            if response.status_code == 200:
                latency = (end - start) * 1000  # Convert to ms
                latencies.append(latency)
        except Exception as e:
            print(f"Error: {e}")
    
    if latencies:
        avg_latency = sum(latencies) / len(latencies)
        min_latency = min(latencies)
        max_latency = max(latencies)
        
        print(f"\nResults:")
        print(f"  Samples tested: {len(latencies)}")
        print(f"  Average latency: {avg_latency:.0f}ms")
        print(f"  Min latency: {min_latency:.0f}ms")
        print(f"  Max latency: {max_latency:.0f}ms")
        print(f"  Target: <500ms")
        
        if avg_latency < 500:
            print(f"  ✓ Latency requirement met!")
            return True
        else:
            print(f"  ✗ Latency exceeds target")
            return False
    
    return False


def get_model_info():
    """Get information about active model"""
    try:
        response = requests.get(f"{SERVICE_API_URL}/api/v1/model-info", timeout=2)
        if response.status_code == 200:
            return response.json()
        return None
    except:
        return None


def main():
    parser = argparse.ArgumentParser(description="Test financial sentiment model")
    parser.add_argument("--check-availability", action="store_true",
                        help="Check if models are available")
    parser.add_argument("--test-format-compliance", action="store_true",
                        help="Test output format compliance")
    parser.add_argument("--test-latency", action="store_true",
                        help="Test response latency")
    parser.add_argument("--samples", type=int, default=20,
                        help="Number of samples to test")
    parser.add_argument("--all", action="store_true",
                        help="Run all tests")
    
    args = parser.parse_args()
    
    print("\n" + "="*60)
    print("FINANCIAL SENTIMENT MODEL - TEST SUITE")
    print("="*60)
    print(f"Timestamp: {datetime.now().isoformat()}")
    
    # Check availability
    if args.check_availability or args.all:
        print("\n" + "="*60)
        print("AVAILABILITY CHECK")
        print("="*60)
        
        ollama_available = test_ollama_availability()
        print(f"Ollama status: {'✓ Available' if ollama_available else '✗ Not available'}")
        
        service_health = test_service_health()
        if service_health:
            print(f"Service status: ✓ Running")
            print(f"Active model: {service_health.get('active_model', 'unknown')}")
            print(f"Model name: {service_health.get('model', 'unknown')}")
            print(f"Provider: {service_health.get('provider', 'unknown')}")
        else:
            print(f"Service status: ✗ Not running")
            print("\nPlease start the service: python app.py")
            return
        
        model_info = get_model_info()
        if model_info:
            print(f"\nDetailed Model Info:")
            print(json.dumps(model_info, indent=2))
    
    # Service must be running for other tests
    if not test_service_health():
        print("\n✗ Service not running. Please start: python app.py")
        return
    
    # Format compliance test
    if args.test_format_compliance or args.all:
        test_format_compliance(args.samples if args.test_format_compliance else 100)
    
    # Latency test
    if args.test_latency or args.all:
        test_latency(args.samples)
    
    print("\n" + "="*60)
    print("TESTS COMPLETE")
    print("="*60)


if __name__ == "__main__":
    main()
