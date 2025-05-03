import os
import google.generativeai as genai
from typing import List
from dotenv import load_dotenv

# Load environment variables
load_dotenv()
# API_Key = AIzaSyANuLeBJN9QpHcCbqtwo8MJDiUlvA7AUOA
# Initialize Gemini client
genai.configure(api_key=os.getenv("GOOGLE_API_KEY"))
model = None

def initialize_gemini():
    """Initialize the Gemini model"""
    global model
    try:
        # Use Gemini Pro model
        model = genai.GenerativeModel('gemini-pro')
    except Exception as e:
        print(f"Failed to initialize Gemini model: {str(e)}")
        raise

async def generate_response(messages):
    """Generate a response using Gemini API"""
    if not model:
        initialize_gemini()
    
    try:
        # Format messages for Gemini
        formatted_messages = []
        for msg in messages:
            role = "user" if msg.role == "user" else "model"
            formatted_messages.append({"role": role, "parts": [msg.content]})
        
        # Create a chat session
        chat = model.start_chat(history=formatted_messages[:-1])
        
        # Get the last user message
        last_message = formatted_messages[-1]["parts"][0]
        
        # Generate response
        response = chat.send_message(last_message)
        return response.text
    except Exception as e:
        print(f"Error generating response: {str(e)}")
        raise Exception(f"Failed to generate response: {str(e)}")