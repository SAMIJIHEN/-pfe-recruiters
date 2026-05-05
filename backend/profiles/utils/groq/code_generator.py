# profiles/utils/groq/code_generator.py
import json
import requests
from .client import get_groq_api_key, GROQ_URL, MODEL_ID

def generate_code_completion_questions(offer_title, offer_description, required_skills, config):
    api_key = get_groq_api_key()
    if not api_key:
        print("❌ GROQ_API_KEY non configurée")
        return []

    language = config.get("language", "python")
    question_count = config.get("question_count", 3)
    difficulty = config.get("difficulty", "medium")

    difficulty_map = {
        "easy": "FACILE - concepts de base, syntaxe simple",
        "medium": "MOYEN - algorithmes standards, manipulation de données",
        "hard": "DIFFICILE - algorithmes avancés, optimisation, structures complexes"
    }
    language_examples = {
        "python": "def solution(arr):\n    # TODO: implémenter\n    pass",
        "javascript": "function solution(arr) {\n    // TODO: implement\n    return null;\n}",
        "sql": "-- TODO: écrire la requête SQL\nSELECT * FROM table;"
    }

    prompt = f"""Tu es un expert technique en recrutement. Génère {question_count} questions de COMPLÉTION DE CODE en {language.upper()} pour un test technique.

CONTEXTE DE L'OFFRE :
- Titre du poste : {offer_title}
- Description : {offer_description[:500] if offer_description else "Non fournie"}
- Compétences requises : {', '.join(required_skills) if required_skills else 'Non spécifiées'}

NIVEAU DE DIFFICULTÉ : {difficulty_map.get(difficulty, difficulty_map['medium'])}

Pour CHAQUE question, tu dois retourner un objet JSON avec :
- "text": l'énoncé de la question (ce que le candidat doit faire)
- "initial_code": le code de départ (avec des trous "TODO" ou "___" à compléter)
- "expected_completion": la solution complète attendue
- "language": "{language}"
- "test_cases": une liste de 2-3 tests pour valider la solution (chaque test a "input" et "expected")
- "hint": un petit indice (optionnel, 1 phrase)
- "estimated_time": temps estimé en secondes (entre 180 et 600 selon difficulté)

RÈGLES IMPORTANTES :
1. Le code doit être fonctionnel et exécutable
2. La fonction doit s'appeler "solution" (python/js) ou être une requête SQL
3. Les test_cases doivent permettre de valider complètement la solution
4. Niveau adapté à un recrutement technique professionnel
5. Ne mets AUCUN texte avant ou après le JSON

Réponds UNIQUEMENT en JSON dans ce format EXACT :
{{
  "questions": [
    {{
      "text": "Écrivez une fonction qui prend une liste de nombres et retourne la somme des nombres pairs.",
      "initial_code": "{language_examples.get(language, language_examples['python'])}",
      "expected_completion": "def solution(arr):\\n    return sum(x for x in arr if x % 2 == 0)",
      "language": "{language}",
      "test_cases": [
        {{"input": [1, 2, 3, 4, 5], "expected": 6}},
        {{"input": [2, 4, 6], "expected": 12}},
        {{"input": [], "expected": 0}}
      ],
      "hint": "Pensez à utiliser la compréhension de liste avec une condition modulo 2",
      "estimated_time": 300
    }}
  ]
}}"""

    headers = {"Authorization": f"Bearer {api_key}", "Content-Type": "application/json"}
    payload = {
        "model": MODEL_ID,
        "temperature": 0.4,
        "max_tokens": 4000,
        "messages": [
            {"role": "system", "content": "Tu es un expert technique en recrutement. Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant ou après."},
            {"role": "user", "content": prompt}
        ]
    }
    try:
        print(f"📡 Génération de {question_count} questions de code {language}...")
        response = requests.post(GROQ_URL, headers=headers, json=payload, timeout=90)
        if response.status_code != 200:
            print(f"❌ Erreur API Groq: {response.status_code}")
            return []
        data = response.json()
        raw_content = data.get("choices", [{}])[0].get("message", {}).get("content", "").strip()
        if not raw_content:
            return []
        cleaned = raw_content.replace("```json", "").replace("```", "").strip()
        first_brace = cleaned.find("{")
        last_brace = cleaned.rfind("}")
        if first_brace != -1 and last_brace != -1:
            cleaned = cleaned[first_brace:last_brace + 1]
        result = json.loads(cleaned)
        questions = result.get("questions", [])
        normalized = []
        for q in questions:
            normalized.append({
                "text": q.get("text", "Question sans énoncé"),
                "initial_code": q.get("initial_code", ""),
                "expected_completion": q.get("expected_completion", ""),
                "language": q.get("language", language),
                "test_cases": q.get("test_cases", []),
                "hint": q.get("hint", ""),
                "estimated_time": q.get("estimated_time", 300),
                "difficulty": difficulty,
                "is_code_question": True,
            })
        print(f"✅ {len(normalized)} questions de code générées")
        return normalized
    except Exception as e:
        print(f"❌ Erreur generate_code_completion_questions: {str(e)}")
        return []