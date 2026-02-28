import os
import httpx
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Gemini API configuration
API_KEY = None
MODEL_NAME = "gemini-2.5-flash"  # Latest and fastest model
BASE_URL = "https://generativelanguage.googleapis.com/v1beta"

def initialize_gemini():
    """Initialize Gemini API configuration"""
    global API_KEY
    
    API_KEY = os.getenv("GEMINI_API_KEY")
    if not API_KEY:
        print("❌ ERROR: GEMINI_API_KEY not found in environment variables!")
        return False
    
    print(f"🔑 API Key configured: {API_KEY[:20]}... (length: {len(API_KEY)})")
    print(f"📦 Using model: {MODEL_NAME}")
    print(f"✅ Gemini API initialized successfully!")
    return True

async def generate_response(messages):
    """Generate a response using Gemini REST API"""
    global API_KEY
    
    if not API_KEY:
        print("🔄 API Key not configured, initializing...")
        success = initialize_gemini()
        if not success:
            return "Failed to initialize Gemini API. Please check your API key."
    
    try:
        # Get the last user message
        last_message = messages[-1]
        user_input = last_message.content
        
        if not user_input:
            return "Empty input received. Please provide a message."
        
        print(f"💬 Generating response for: '{user_input[:50]}...'")
        
        # Build API URL
        url = f"{BASE_URL}/models/{MODEL_NAME}:generateContent"
        
        # Build request payload
        payload = {
            "contents": [{
                "parts": [{
                    "text": user_input
                }]
            }]
        }
        
        # Make async HTTP request
        async with httpx.AsyncClient(timeout=15.0) as client:
            response = await client.post(
                url,
                json=payload,
                params={"key": API_KEY}
            )
            
            if response.status_code == 200:
                data = response.json()
                
                # Extract text from response
                if 'candidates' in data and len(data['candidates']) > 0:
                    candidate = data['candidates'][0]
                    if 'content' in candidate and 'parts' in candidate['content']:
                        result_text = candidate['content']['parts'][0]['text']
                        print(f"✅ Response generated ({len(result_text)} chars)")
                        return result_text
                
                print(f"⚠️ Unexpected response format: {data}")
                return "Received unexpected response format from API."
            
            else:
                error_data = response.json() if response.text else {}
                error_msg = error_data.get('error', {}).get('message', str(error_data))
                print(f"❌ API Error ({response.status_code}): {error_msg}")
                
                # Handle specific errors
                if response.status_code == 404:
                    return f"Model '{MODEL_NAME}' not found. Please contact support."
                elif response.status_code == 401:
                    return "Invalid API key. Please check your Gemini API key."
                elif response.status_code == 429:
                    return "Rate limit exceeded. Please wait a moment and try again."
                elif response.status_code == 400:
                    return f"Bad request: {error_msg[:100]}"
                else:
                    return f"API Error: {error_msg[:200]}"
        
    except httpx.TimeoutException:
        print("⏱️ Request timed out after 15 seconds")
        return "Sorry, the request took too long. Please try again."
    
    except Exception as e:
        error_message = str(e)
        print(f"❌ Unexpected error: {error_message}")
        return f"An unexpected error occurred: {error_message[:200]}"