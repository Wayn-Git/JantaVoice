"""
AI Services Module for JantaVoice
Handles Groq Whisper (speech-to-text) and OpenRouter LLM (field extraction, chatbot)
"""

import os
import json
import logging
import requests
from typing import Optional, Dict, Any
from dotenv import load_dotenv

load_dotenv()

logger = logging.getLogger(__name__)

# API Configuration
GROQ_API_KEY = os.getenv("groq_api_key", "")
OPENROUTER_API_KEY = os.getenv("OPENROUTER_API_KEY", "")
OPENROUTER_BASE_URL = "https://openrouter.ai/api/v1"


class WhisperService:
    """Groq Whisper Service for English speech-to-text"""
    
    def __init__(self):
        self.api_key = GROQ_API_KEY
        self.api_url = "https://api.groq.com/openai/v1/audio/transcriptions"
    
    def transcribe_audio(self, audio_file_path: str, language: str = "en") -> Dict[str, Any]:
        """
        Transcribe audio file to text using Groq Whisper (FREE)
        
        Args:
            audio_file_path: Path to audio file
            language: Language code (default: 'en' for English)
            
        Returns:
            Dict with 'success', 'transcript', and optional 'error'
        """
        try:
            if not self.api_key:
                logger.error("Groq API key not configured")
                return {
                    "success": False,
                    "error": "Groq API key not configured in .env",
                    "transcript": ""
                }
            
            with open(audio_file_path, 'rb') as audio_file:
                headers = {
                    "Authorization": f"Bearer {self.api_key}"
                }
                files = {
                    "file": (os.path.basename(audio_file_path), audio_file),
                    "model": (None, "whisper-large-v3"),
                    "language": (None, language),
                    "response_format": (None, "json")
                }
                
                response = requests.post(
                    self.api_url,
                    headers=headers,
                    files=files,
                    timeout=60
                )
                
                if response.status_code == 200:
                    result = response.json()
                    return {
                        "success": True,
                        "transcript": result.get("text", ""),
                        "language": language
                    }
                else:
                    logger.error(f"Groq Whisper API error: {response.status_code} - {response.text}")
                    return {
                        "success": False,
                        "error": f"API error: {response.status_code}",
                        "transcript": ""
                    }
                    
        except Exception as e:
            logger.exception(f"Error transcribing audio: {e}")
            return {
                "success": False,
                "error": str(e),
                "transcript": ""
            }


class OpenRouterService:
    """OpenRouter LLM Service for field extraction and chatbot"""
    
    def __init__(self):
        self.api_key = OPENROUTER_API_KEY
        self.base_url = OPENROUTER_BASE_URL
        self.model = "meta-llama/llama-3.1-8b-instruct"  # Updated based on user feedback
    
    def _make_request(self, messages: list, max_tokens: int = 1024) -> Dict[str, Any]:
        """Make request to OpenRouter API"""
        try:
            headers = {
                "Authorization": f"Bearer {self.api_key}",
                "Content-Type": "application/json",
                "HTTP-Referer": "https://jantavoice.app",
                "X-Title": "JantaVoice"
            }
            
            payload = {
                "model": self.model,
                "messages": messages,
                "max_tokens": max_tokens,
                "temperature": 0.3
            }
            
            response = requests.post(
                f"{self.base_url}/chat/completions",
                headers=headers,
                json=payload,
                timeout=30
            )
            
            if response.status_code == 200:
                result = response.json()
                content = result.get("choices", [{}])[0].get("message", {}).get("content", "")
                return {"success": True, "content": content}
            else:
                logger.error(f"OpenRouter API error: {response.status_code} - {response.text}")
                return {"success": False, "error": f"API error: {response.status_code}"}
                
        except Exception as e:
            logger.exception(f"OpenRouter request error: {e}")
            return {"success": False, "error": str(e)}
    
    def extract_complaint_fields(self, transcript: str) -> Dict[str, Any]:
        """
        Extract structured fields from complaint text (English)
        
        Args:
            transcript: English text of the complaint
            
        Returns:
            Dict with extracted fields: name, phone, location, department, description, urgency
        """
        system_prompt = """You are an AI assistant that extracts structured information from complaints.
Extract the following fields from the complaint and respond ONLY with valid JSON:

{
    "name": "complainant name (or 'Unknown' if not mentioned)",
    "phone": "phone number if mentioned (or null)",
    "location": "location/address",
    "department": "relevant government department (e.g., 'Road Department', 'Water Department', 'Electricity Department', 'Sanitation Department', 'Health Department', 'General Administration')",
    "description": "brief description of the complaint",
    "urgency": "High/Medium/Low based on severity"
}

Urgency Guidelines:
- High: Health/safety risks, no water/electricity for days, flooding, dangerous roads
- Medium: Inconvenient but not dangerous, like potholes, garbage accumulation
- Low: Minor issues, suggestions, general complaints

Respond ONLY with the JSON object, no additional text."""

        user_prompt = f"Extract fields from this complaint:\n\n{transcript}"
        
        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_prompt}
        ]
        
        result = self._make_request(messages)
        
        if result["success"]:
            try:
                # Parse JSON from response
                content = result["content"].strip()
                # Handle markdown code blocks if present
                if content.startswith("```"):
                    content = content.split("```")[1]
                    if content.startswith("json"):
                        content = content[4:]
                    content = content.strip()
                
                fields = json.loads(content)
                return {
                    "success": True,
                    "fields": {
                        "name": fields.get("name", "Unknown"),
                        "phone": fields.get("phone"),
                        "location": fields.get("location", "Unknown"),
                        "department": fields.get("department", "General Administration"),
                        "description": fields.get("description", transcript),
                        "urgency": fields.get("urgency", "Medium")
                    }
                }
            except json.JSONDecodeError as e:
                logger.error(f"Failed to parse LLM response as JSON: {e}")
                return self._fallback_extraction(transcript)
        else:
            return self._fallback_extraction(transcript)
    
    def _fallback_extraction(self, transcript: str) -> Dict[str, Any]:
        """Fallback extraction using simple keyword matching"""
        text_lower = transcript.lower()
        
        # Determine department based on keywords
        department = "General Administration"
        if any(word in text_lower for word in ["road", "pothole", "street"]):
            department = "Road Department"
        elif any(word in text_lower for word in ["water", "tap", "pipe", "leak"]):
            department = "Water Department"
        elif any(word in text_lower for word in ["light", "electricity", "power", "pole"]):
            department = "Electricity Department"
        elif any(word in text_lower for word in ["garbage", "trash", "waste", "clean"]):
            department = "Sanitation Department"
        elif any(word in text_lower for word in ["hospital", "doctor", "health", "medicine"]):
            department = "Health Department"
        
        return {
            "success": True,
            "fields": {
                "name": "Unknown",
                "phone": None,
                "location": "Unknown",
                "department": department,
                "description": transcript,
                "urgency": "Medium"
            },
            "fallback": True
        }
    
    def chat_about_schemes(self, user_query: str) -> Dict[str, Any]:
        """
        Answer questions about government schemes in English
        
        Args:
            user_query: User's question in English
            
        Returns:
            Dict with 'success' and 'reply'
        """
        system_prompt = """You are a helpful assistant that explains Indian Government Schemes in simple English.

When a user asks about a scheme, provide the following details:
1. Name of the Scheme and a brief description
2. Eligibility (Who can apply)
3. Benefits
4. Application Process
5. Official Website (if known)

Keep the answer simple, clear, and in bullet points.
If you don't know about a specific scheme, politely say so."""

        messages = [
            {"role": "system", "content": system_prompt},
            {"role": "user", "content": user_query}
        ]
        
        result = self._make_request(messages, max_tokens=800)
        
        if result["success"]:
            return {
                "success": True,
                "reply": result["content"]
            }
        else:
            return {
                "success": False,
                "reply": "Sorry, I am facing some technical issues. Please try again later.",
                "error": result.get("error")
            }


# Create singleton instances
whisper_service = WhisperService()
openrouter_service = OpenRouterService()


def transcribe_hindi_audio(audio_file_path: str) -> Dict[str, Any]:
    """Convenience function for transcribing Hindi audio"""
    return whisper_service.transcribe_audio(audio_file_path, language="hi")


def extract_fields_from_complaint(hindi_text: str) -> Dict[str, Any]:
    """Convenience function for extracting fields from Hindi complaint"""
    return openrouter_service.extract_complaint_fields(hindi_text)


def get_scheme_info(query: str) -> Dict[str, Any]:
    """Convenience function for getting scheme information"""
    return openrouter_service.chat_about_schemes(query)
