#!/usr/bin/env python3
"""
Direct test of Gemini API without our application layers
"""
import requests
import json

API_KEY = "AIzaSyBlHsuuM-DI9ZkRa9NsrB3ZtZEEk6fgqnU"

print("🧪 Testing direct HTTP API call to Gemini...")
print(f"API Key: {API_KEY[:20]}...")

url = f"https://generativelanguage.googleapis.com/v1beta/models/gemini-pro:generateContent?key={API_KEY}"

payload = {
    "contents": [{
        "parts": [{
            "text": "Say hello in one word"
        }]
    }]
}

headers = {
    "Content-Type": "application/json"
}

try:
    print("\n📡 Sending request...")
    response = requests.post(url, json=payload, headers=headers, timeout=10)
    
    print(f"Status Code: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        if 'candidates' in data:
            text = data['candidates'][0]['content']['parts'][0]['text']
            print(f"\n✅ SUCCESS! Response: {text}")
        else:
            print(f"\n⚠️  Response: {json.dumps(data, indent=2)}")
    else:
        print(f"\n❌ ERROR Response:")
        print(response.text)
        
except requests.exceptions.Timeout:
    print("\n⏱️  TIMEOUT: Could not reach Gemini API within 10 seconds")
    print("Possible causes:")
    print("  - Firewall blocking Google APIs")
    print("  - Network connectivity issues")
    print("  - VPN/Proxy interference")
    
except requests.exceptions.ConnectionError as e:
    print(f"\n❌ CONNECTION ERROR: {e}")
    print("Cannot connect to Google's servers")
    
except Exception as e:
    print(f"\n❌ ERROR: {e}")
