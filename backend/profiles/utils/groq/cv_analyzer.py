# profiles/utils/groq/cv_analyzer.py
import json
from .client import groq_chat_completion
from .json_utils import clean_ocr_text, try_parse_json, normalize_result

def cv_to_json_with_groq(raw_text: str) -> dict:
    text = clean_ocr_text(raw_text)
    if not text:
        return {"error": "Empty CV text"}

    prompt = f"""
Tu es un assistant RH expert en extraction d'informations depuis un CV.

Ta mission :
Retourner UNIQUEMENT un objet JSON valide.
Ne mets aucun texte avant.
Ne mets aucun texte après.
Ne mets pas de balises markdown.
Ne mets pas ```json.
Ne commente rien.

Règles :
- Si une information est absente, mets null.
- languages, skills, education, experience doivent toujours être des listes.
- Les URLs LinkedIn et GitHub doivent être extraites si présentes.
- Le JSON doit être strictement valide.

Schéma attendu :
{{
  "full_name": null,
  "headline": null,
  "email": null,
  "phone": null,
  "location": null,
  "linkedin_url": null,
  "github_url": null,
  "languages": [],
  "skills": [],
  "education": [
    {{
      "degree": null,
      "school": null,
      "year": null
    }}
  ],
  "experience": [
    {{
      "title": null,
      "company": null,
      "start": null,
      "end": null,
      "summary": null
    }}
  ]
}}

CV :
{text[:4000]}
""".strip()

    try:
        content = groq_chat_completion(
            messages=[
                {"role": "system", "content": "Tu retournes uniquement du JSON strict et valide."},
                {"role": "user", "content": prompt}
            ],
            temperature=0,
            max_tokens=2000
        )
        parsed, parse_error = try_parse_json(content)
        if parsed is not None:
            return normalize_result(parsed)
        return {
            "error": "Invalid JSON returned",
            "raw": content,
            "parse_error": parse_error,
        }
    except Exception as e:
        return {"error": str(e)}

def analyze_cv_richness(cv_text):
    import requests
    import os
    from .client import get_groq_api_key, GROQ_URL, MODEL_ID
    api_key = get_groq_api_key()
    print(f"🔍 analyze_cv_richness appelée, API_KEY présente = {api_key is not None}")
    if not api_key:
        return {"error": "GROQ_API_KEY non configurée", "rich": False, "skills_count": 0, "experience_years": 0}
    if not cv_text or len(cv_text.strip()) < 50:
        return {"error": "Texte du CV trop court", "rich": False, "skills_count": 0, "experience_years": 0}

    prompt = f"""Analyse ce CV de manière TRÈS PRÉCISE et réponds UNIQUEMENT en JSON.

CV:
{cv_text[:4000]}

Réponds dans ce format EXACT:
{{
  "skills_count": 0,
  "experience_years": 0,
  "domain": "domaine principal",
  "all_skills": ["compétence1", "compétence2"]
}}

📌 RÈGLES TRÈS IMPORTANTES pour CALCULER experience_years:
... (conserver tout le texte du prompt original)

Ne mets RIEN d'autre que le JSON."""

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": MODEL_ID,
        "temperature": 0.1,
        "max_tokens": 800,
        "messages": [
            {"role": "system", "content": "Tu es un expert RH spécialisé dans l'analyse de CV. Calcule précisément les années d'expérience en additionnant toutes les expériences. Pour 'Plus de X ans' ou 'X+ ans', ajoute 1. Pour les stages courts, compte 0.5 an. Arrondis à l'unité la plus proche."},
            {"role": "user", "content": prompt}
        ]
    }
    try:
        print("📡 Appel à l'API Groq pour analyse de richesse...")
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=60)
        if response.status_code != 200:
            print(f"❌ Erreur API Groq: {response.status_code}")
            return {"error": f"Erreur API: {response.status_code}", "rich": False, "skills_count": 0, "experience_years": 0}
        data = response.json()
        raw_content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        if not raw_content:
            return {"error": "Réponse vide", "rich": False, "skills_count": 0, "experience_years": 0}
        cleaned = raw_content.replace("```json", "").replace("```", "").strip()
        first_brace = cleaned.find("{")
        last_brace = cleaned.rfind("}")
        if first_brace != -1 and last_brace != -1:
            cleaned = cleaned[first_brace:last_brace + 1]
        result = json.loads(cleaned)
        skills_count = result.get("skills_count", 0)
        experience_years = result.get("experience_years", 0)
        domain = result.get("domain", "")
        all_skills = result.get("all_skills", [])
        is_rich = skills_count >= 20
        print(f"📊 Résultat analyse: skills={skills_count}, exp={experience_years} ans, rich={is_rich}, domain={domain}")
        return {
            "rich": is_rich,
            "skills_count": skills_count,
            "experience_years": experience_years,
            "domain": domain,
            "all_skills": all_skills,
            "error": None
        }
    except Exception as e:
        print(f"❌ Erreur analyze_cv_richness: {str(e)}")
        return {"error": str(e), "rich": False, "skills_count": 0, "experience_years": 0}