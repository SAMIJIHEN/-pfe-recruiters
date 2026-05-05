# profiles/utils/groq/client.py
import os
import requests
from pathlib import Path
from dotenv import load_dotenv

# Charger le .env
BACKEND_DIR = Path(__file__).resolve().parents[3]
ENV_PATH = BACKEND_DIR / ".env"
load_dotenv(ENV_PATH, override=True)

GROQ_URL = "https://api.groq.com/openai/v1/chat/completions"
MODEL_ID = "llama-3.3-70b-versatile"

def get_groq_api_key():
    return os.getenv("GROQ_API_KEY")

def groq_chat_completion(messages, temperature=0, max_tokens=2000, timeout=60):
    """Envoie une requête à Groq et retourne le contenu textuel."""
    api_key = get_groq_api_key()
    if not api_key:
        raise ValueError("GROQ_API_KEY non configurée")
    headers = {
        "Authorization": f"Bearer {api_key}",
        "Content-Type": "application/json",
    }
    payload = {
        "model": MODEL_ID,
        "messages": messages,
        "temperature": temperature,
        "max_tokens": max_tokens,
    }
    response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=timeout)
    response.raise_for_status()
    data = response.json()
    return data["choices"][0]["message"]["content"].strip()