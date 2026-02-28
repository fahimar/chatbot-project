#!/usr/bin/env python3
import os
import google.generativeai as genai

# Test Gemini API key
api_key = "AIzaSyBKytRZQLJLLZE6xm0_OtSMWhOflrGDneA"
print(f"Testing API key: {api_key[:20]}...")

try:
    genai.configure(api_key=api_key)
    model = genai.GenerativeModel("gemini-1.5-flash")
    
    print("Generating test response...")
    response = model.generate_content("Say hello in one word")
    
    print(f"✅ Success! Response: {response.text}")
except Exception as e:
    print(f"❌ Error: {e}")
