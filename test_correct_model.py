#!/usr/bin/env python3
import requests
import json

API_KEY = "AIzaSyBlHsuuM-DI9ZkRa9NsrB3ZtZEEk6fgqnU"

# Test with the correct model name
model = "gemini-2.5-flash"
url = f"https://generativelanguage.googleapis.com/v1beta/models/{model}:generateContent?key={API_KEY}"

payload = {
    "contents": [{
        "parts": [{
            "text": "Say hello"
        }]
    }]
}

print(f"Testing model: {model}")
print(f"URL: {url}\n")

try:
    response = requests.post(url, json=payload, timeout=10)
    print(f"Status: {response.status_code}")
    
    if response.status_code == 200:
        data = response.json()
        text = data['candidates'][0]['content']['parts'][0]['text']
        print(f"✅ SUCCESS!\nResponse: {text}")
    else:
        print(f"❌ ERROR:\n{response.text}")
except Exception as e:
    print(f"❌ EXCEPTION: {e}")
