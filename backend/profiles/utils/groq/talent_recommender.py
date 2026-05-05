# profiles/utils/groq/talent_recommender.py
import json
import requests
from .client import get_groq_api_key, GROQ_URL, MODEL_ID

def recommend_talents_for_offer(offer_title, offer_skills, talents_list):
    api_key = get_groq_api_key()
    if not api_key:
        print("❌ GROQ_API_KEY non configurée dans recommend_talents_for_offer")
        return []
    if not talents_list:
        return []

    talents_text = ""
    for idx, talent in enumerate(talents_list):
        talents_text += f"""
Talent {idx + 1}:
- ID: {talent.get('id')}
- Domaine: {talent.get('domain', 'Non spécifié')}
- Compétences: {', '.join(talent.get('all_skills', []))}
- Années expérience: {talent.get('years_experience', 0)}
"""

    prompt = f"""Tu es un expert en recrutement. Compare cette offre avec la liste des talents et retourne les meilleurs matches.

OFFRE:
- Titre: {offer_title}
- Compétences requises: {', '.join(offer_skills) if offer_skills else 'Non spécifiées'}

TALENTS DISPONIBLES:
{talents_text}

Pour chaque talent, calcule un score de matching (0-100) basé sur:
- Correspondance du domaine (30%)
- Correspondance des compétences (50%)
- Années d'expérience (20%)

Réponds UNIQUEMENT en JSON dans ce format:
[
  {{
    "talent_id": 1,
    "match_score": 85,
    "reason": "Courte explication"
  }},
  ...
]

Ne retourne que les talents avec un score > 30. Trie du plus haut score au plus bas.
Ne mets RIEN d'autre que le JSON."""

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": MODEL_ID,
        "temperature": 0.2,
        "max_tokens": 1500,
        "messages": [
            {"role": "system", "content": "Tu es un expert en recrutement. Réponds UNIQUEMENT en JSON valide."},
            {"role": "user", "content": prompt}
        ]
    }
    try:
        print("📡 Appel à l'API Groq pour recommandation...")
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=60)
        if response.status_code != 200:
            print(f"❌ Erreur API Groq: {response.status_code}")
            return []
        data = response.json()
        raw_content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        if not raw_content:
            return []
        cleaned = raw_content.replace("```json", "").replace("```", "").strip()
        first_bracket = cleaned.find("[")
        last_bracket = cleaned.rfind("]")
        if first_bracket != -1 and last_bracket != -1:
            cleaned = cleaned[first_bracket:last_bracket + 1]
        recommendations = json.loads(cleaned)
        if not isinstance(recommendations, list):
            return []
        print(f"✅ {len(recommendations)} recommandations générées")
        return recommendations
    except Exception as e:
        print(f"❌ Erreur recommend_talents_for_offer: {e}")
        return []