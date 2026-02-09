import os
import traceback
from groq import Groq
from dotenv import load_dotenv

load_dotenv()
api_key = os.getenv("GROQ_API_KEY") or os.getenv("groq_api_key")
print(f"API Key found: {api_key is not None}")

if api_key:
    try:
        client = Groq(api_key=api_key)
        print("Sending request...")
        chat_completion = client.chat.completions.create(
            messages=[{"role": "user", "content": "Say hello"}],
            model="llama-3.3-70b-versatile",
        )
        print(f"Response: {chat_completion.choices[0].message.content}")
    except Exception as e:
        print(f"Error: {e}")
        traceback.print_exc()
else:
    print("No API Key found")
