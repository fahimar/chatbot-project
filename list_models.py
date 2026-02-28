#!/usr/bin/env python3
"""
List all available Gemini models for this API key
"""
import requests

API_KEY = "AIzaSyBlHsuuM-DI9ZkRa9NsrB3ZtZEEk6fgqnU"

print("📋 Listing available Gemini models...\n")

url = f"https://generativelanguage.googleapis.com/v1beta/models?key={API_KEY}"

try:
    response = requests.get(url, timeout=10)
    
    if response.status_code == 200:
        data = response.json()
        
        if 'models' in data:
            print(f"✅ Found {len(data['models'])} models:\n")
            
            for model in data['models']:
                name = model.get('name', 'Unknown')
                display_name = model.get('displayName', '')
                supported_methods = model.get('supportedGenerationMethods', [])
                
                print(f"📦 {name}")
                print(f"   Display Name: {display_name}")
                print(f"   Supported: {', '.join(supported_methods)}")
                
                if 'generateContent' in supported_methods:
                    print(f"   ✅ Can use for chat!")
                print()
        else:
            print("No models found in response")
            print(data)
    else:
        print(f"❌ Error: {response.status_code}")
        print(response.text)
        
except Exception as e:
    print(f"❌ ERROR: {e}")
