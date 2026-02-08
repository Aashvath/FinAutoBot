"""
Test script for the event detection system.
This script will check if the Gemini API integration is working properly.

To use this script:
1. Set your Google API key in the environment:
   export GOOGLE_API_KEY="your-api-key-here"
2. Run: python test_event_detection.py
"""

import os
import json
from event_detection import analyze_transactions_api
from google import generativeai as genai

def test_event_detection():
    genai.configure(api_key=os.environ.get("GOOGLE_API_KEY", "YOUR_API_KEY"))
    print("Testing transaction analysis and life event detection...")
    
    # Check if Google API key is set
    api_key = os.environ.get("GOOGLE_API_KEY")
    if not api_key or api_key == "YOUR_API_KEY":
        print("Warning: GOOGLE_API_KEY environment variable not set or is default value.")
        print("Set it with: export GOOGLE_API_KEY='your-api-key-here'")
    
    # Make sure the data file exists
    data_path = "uploads/data.csv"
    if not os.path.exists(data_path):
        print(f"Error: Test data file not found at {data_path}")
        print("Please place a transaction CSV file at this location before testing.")
        return
        
    # Run the analysis
    try:
        results = analyze_transactions_api()
        
        # Print summary of results
        print("\n====== TEST RESULTS ======")
        print(f"Analysis status: {results.get('status', 'unknown')}")
        
        # Check for event detection results
        if 'event_detection' in results:
            event_detection = results['event_detection']
            print(f"\nDetected event: {event_detection.get('eventName', 'unknown')}")
            print(f"Reasoning: {event_detection.get('reasoning', 'No reasoning provided')}")
        else:
            print("\nNo event detection results found.")
            
        # Print full results as JSON in debug mode
        if os.environ.get("DEBUG") == "1":
            print("\n====== FULL RESULTS (DEBUG MODE) ======")
            print(json.dumps(results, indent=2))
            
        print("\nTest completed successfully.")
        
    except Exception as e:
        print(f"Error during testing: {str(e)}")
        
if __name__ == "__main__":
    test_event_detection() 