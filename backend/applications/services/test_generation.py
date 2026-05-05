# backend/applications/services/test_generation.py
import json
import re
import requests
import logging
from django.conf import settings

logger = logging.getLogger(__name__)

def generate_test_questions_with_groq(application, config=None):
    print("=" * 60)
    print("🔍 GÉNÉRATION DU TEST AVEC GROQ")
    
    job = application.job
    job_title = getattr(job, "title", "") or "Poste non précisé"
    job_description = getattr(job, "description", "") or ""
    
    print(f"📌 Poste: {job_title}")
    
    groq_api_key = getattr(settings, "GROQ_API_KEY", None)
    
    if not groq_api_key:
        print("⚠️ GROQ_API_KEY non configurée, utilisation des questions par défaut")
        return get_default_questions(job_title)
    
    prompt = f"""Génère exactement 10 questions à choix multiples pour évaluer un candidat pour ce poste :

Titre du poste : {job_title}
Description : {job_description[:800] if job_description else "Non spécifiée"}

IMPORTANT : Réponds UNIQUEMENT avec un JSON valide dans ce format EXACT :
[
  {{
    "question": "Texte de la question",
    "options": ["option1", "option2", "option3", "option4"],
    "correct_index": 0
  }},
  ...
]

Règles :
- correct_index doit être un entier entre 0 et 3
- Ne mets aucun texte avant ou après le JSON
- Les questions doivent être variées et adaptées au poste"""

    try:
        print("📡 Appel à l'API Groq...")
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "temperature": 0.4,
                "max_tokens": 2500,
                "messages": [
                    {
                        "role": "system",
                        "content": "Tu es un expert RH. Tu génères uniquement du JSON valide.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
            },
            timeout=45,
        )
        
        if response.status_code != 200:
            print(f"❌ Erreur Groq: {response.status_code}")
            return get_default_questions(job_title)

        data = response.json()
        raw_content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        
        if not raw_content:
            return get_default_questions(job_title)

        cleaned = raw_content.replace("```json", "").replace("```", "").strip()
        
        match = re.search(r"(\[\s*{.*}\s*\])", cleaned, re.DOTALL)
        if match:
            cleaned = match.group(1)
        
        try:
            questions = json.loads(cleaned)
        except json.JSONDecodeError:
            return get_default_questions(job_title)

        if not isinstance(questions, list):
            return get_default_questions(job_title)
        
        if len(questions) != 10:
            if len(questions) > 10:
                questions = questions[:10]
            else:
                default_q = get_default_questions(job_title)
                questions.extend(default_q[:10 - len(questions)])

        normalized = []
        for i, q in enumerate(questions):
            question_text = q.get("question", f"Question {i+1}")
            options = q.get("options", [])
            if len(options) != 4:
                options = ["Option A", "Option B", "Option C", "Option D"]
            correct_index = q.get("correct_index", 0)
            if not isinstance(correct_index, int) or correct_index < 0 or correct_index > 3:
                correct_index = 0
            
            normalized.append({
                "question": str(question_text).strip(),
                "options": [str(opt).strip() for opt in options],
                "correct_index": correct_index,
                "is_open_ended": False,
                "estimated_time": 60,
                "difficulty": "medium",
            })
        
        print(f"✅ {len(normalized)} questions générées")
        return normalized
        
    except Exception as e:
        print(f"❌ Erreur: {str(e)}")
        return get_default_questions(job_title)


def get_default_questions(job_title):
    return [
        {
            "question": f"Quelle est la compétence technique la plus importante pour un(e) {job_title} ?",
            "options": ["Maîtrise des outils spécifiques", "Capacité d'analyse", "Résolution de problèmes", "Créativité"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        },
        {
            "question": "Comment gérez-vous une situation de stress intense ?",
            "options": ["Je prends du recul et j'analyse", "Je demande de l'aide à mes collègues", "Je travaille plus pour résoudre", "Je délègue une partie du travail"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        },
        {
            "question": "Quelle est votre approche face à un problème complexe jamais rencontré ?",
            "options": ["Analyse et décomposition en sous-problèmes", "Recherche de solutions existantes", "Consultation d'experts", "Essai-erreur itératif"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        },
        {
            "question": "Comment priorisez-vous vos tâches quotidiennes ?",
            "options": ["Urgence et importance", "Date limite uniquement", "Facilité d'exécution", "Préférence personnelle"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        },
        {
            "question": "Quelle valeur est la plus importante en entreprise selon vous ?",
            "options": ["Intégrité", "Innovation", "Performance", "Collaboration"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        },
        {
            "question": "Comment réagissez-vous face à un feedback négatif ?",
            "options": ["Je l'accepte et cherche à m'améliorer", "Je le conteste immédiatement", "Je le prends personnellement", "Je l'ignore"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        },
        {
            "question": "Quelle est votre méthode pour apprendre une nouvelle technologie rapidement ?",
            "options": ["Pratique sur un projet personnel", "Formation en ligne", "Documentation officielle", "Aide d'un collègue"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        },
        {
            "question": "Comment gérez-vous un désaccord avec un collègue ?",
            "options": ["Discussion constructive", "Évitement", "Confrontation directe", "Recours à un supérieur"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        },
        {
            "question": "Quelle est votre vision du travail en équipe ?",
            "options": ["Collaboration et partage", "Autonomie complète", "Division stricte des tâches", "Leadership unique"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        },
        {
            "question": "Comment mesurez-vous votre succès dans un projet ?",
            "options": ["Atteinte des objectifs", "Respect des délais", "Satisfaction client", "Qualité du livrable"],
            "correct_index": 0,
            "is_open_ended": False,
            "estimated_time": 60,
            "difficulty": "medium"
        }
    ]