import os
import google.generativeai as genai
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

# Initialize Gemini client
genai.configure(api_key=os.getenv("GEMINI_API_KEY"))
model = None

def initialize_gemini():
    """Initialize the Gemini model"""
    global model
    try:
        # Use gemini-1.5-flash - recommended replacement for deprecated gemini-pro-vision
        model_name = "gemini-1.5-flash"
        print(f"Attempting to initialize model: {model_name}")
        
        model = genai.GenerativeModel(model_name)
        print(f"Gemini model initialized successfully: {model_name}")
        return True
    except Exception as e:
        print(f"Failed to initialize Gemini model: {str(e)}")
        
        # Try alternative models if first choice fails
        alternatives = [
            "gemini-1.5-pro",
            "gemini-pro",  # Try original non-vision model
            "gemini-1.0-pro"  # Try with explicit version
        ]
        
        for alt_model in alternatives:
            try:
                print(f"Trying alternative model: {alt_model}")
                model = genai.GenerativeModel(alt_model)
                print(f"Successfully initialized alternative model: {alt_model}")
                return True
            except Exception as alt_err:
                print(f"Failed to initialize alternative model {alt_model}: {str(alt_err)}")
        
        # If all attempts fail, print debugging info
        print(f"API Key set: {bool(os.getenv('GEMINI_API_KEY'))}")
        print(f"API Key length: {len(os.getenv('GEMINI_API_KEY') or '')}")
        return False

async def generate_response(messages):
    """Generate a response using Gemini API"""
    global model
    
    if not model:
        success = initialize_gemini()
        if not success:
            return "Failed to initialize Gemini model. The Gemini 1.0 Pro Vision model has been deprecated. Please check logs for details."
    
    try:
        # Get the last user message for simplicity during debugging
        last_message = messages[-1]
        user_input = last_message.content
        
        # Check if content is empty
        if not user_input:
            return "Empty input received. Please provide a message."
        
        # Generate a direct response
        response = model.generate_content(user_input)
        
        # Return the text from the response
        return response.text
    except Exception as e:
        error_message = str(e)
        print(f"Error generating response: {error_message}")
        
        if "404" in error_message and "deprecated" in error_message:
            # If we get a deprecation message, try to use a different model
            try:
                model = genai.GenerativeModel("gemini-1.5-flash")
                return model.generate_content(user_input).text
            except Exception as retry_err:
                return f"Model deprecation error. Please update your code to use 'gemini-1.5-flash' instead of deprecated models. Error: {str(retry_err)}"
        elif "401" in error_message:
            return "Authentication error. Please check your API key and ensure it has access to the Gemini models."
        elif "429" in error_message:
            return "Rate limit exceeded. Please try again later."
        else:
            return f"Failed to generate response: {error_message}"