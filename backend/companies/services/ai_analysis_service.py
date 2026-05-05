# backend/applications/services/ai_analysis_service.py
import json
import logging
import requests
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def analyze_application_with_ai(application):
    """Analyse les réponses du candidat via Groq et met à jour ai_analysis."""
    if not application.test_result:
        return {"error": "Aucun résultat de test disponible"}

    questions = application.test_questions
    result = application.test_result
    answers = result.get("answers", [])
    details = result.get("details", [])

    candidate_name = f"{application.candidate.first_name} {application.candidate.last_name}".strip() or application.candidate.email
    job_title = application.job.title

    qa_text = ""
    qcm_correct_count = 0
    qcm_total_count = 0
    open_answers = []
    code_answers = []

    for idx, q in enumerate(questions):
        question_text = q.get("question", "")
        is_open_ended = q.get("is_open_ended", False)
        is_code_question = q.get("is_code_question", False)
        correct_index = q.get("correct_index")
        options = q.get("options", [])

        user_answer = answers[idx] if idx < len(answers) else "Non répondue"

        if is_open_ended:
            answer_text = user_answer if isinstance(user_answer, str) else str(user_answer)
            open_answers.append({
                "question": question_text,
                "answer": answer_text if answer_text and answer_text != "Non répondue" else "Aucune réponse"
            })
            qa_text += f"""
--- QUESTION OUVERTE {idx + 1} ---
Question : {question_text}
Réponse du candidat : {answer_text if answer_text else "Aucune réponse"}
---"""
        elif is_code_question:
            answer_text = user_answer if isinstance(user_answer, str) else str(user_answer)
            code_answers.append({
                "question": question_text,
                "answer": answer_text[:500] if answer_text else "Aucune réponse",
                "language": q.get("language", "python")
            })
            qa_text += f"""
--- QUESTION CODE {idx + 1} ---
Langage : {q.get("language", "python")}
Question : {question_text}
Code du candidat : 
{answer_text if answer_text else "Aucune réponse"}
---"""
        else:
            is_correct = (user_answer == correct_index) if isinstance(user_answer, int) else False
            correct_answer = options[correct_index] if correct_index is not None and correct_index < len(options) else "Non définie"
            selected_option = options[user_answer] if isinstance(user_answer, int) and user_answer < len(options) else "Non répondue"

            if is_correct:
                qcm_correct_count += 1
            qcm_total_count += 1

            qa_text += f"""
--- QUESTION QCM {idx + 1} ---
Question : {question_text}
Options : {', '.join(options)}
Bonne réponse : {correct_answer}
Réponse du candidat : {selected_option}
Correct : {'Oui' if is_correct else 'Non'}
---"""

    qcm_percentage = round((qcm_correct_count / qcm_total_count) * 100) if qcm_total_count > 0 else 0

    open_questions_summary = ""
    if open_answers:
        open_questions_summary = "\n\nRÉPONSES AUX QUESTIONS OUVERTES :\n"
        for oa in open_answers:
            open_questions_summary += f"\nQuestion: {oa['question']}\nRÉponse: {oa['answer']}\n"

    code_questions_summary = ""
    if code_answers:
        code_questions_summary = "\n\nRÉPONSES AUX QUESTIONS DE CODE :\n"
        for ca in code_answers:
            code_questions_summary += f"\nLangage: {ca['language']}\nQuestion: {ca['question']}\nCode:\n{ca['answer']}\n"

    prompt = f"""Tu es un expert en évaluation de candidats pour le recrutement. Analyse les réponses de ce candidat et fournis une évaluation détaillée.

CONTEXTE :
- Poste : {job_title}
- Candidat : {candidate_name}
- Score QCM : {qcm_correct_count}/{qcm_total_count} ({qcm_percentage}%)

DÉTAIL DES QUESTIONS ET RÉPONSES :
{qa_text}
{open_questions_summary}
{code_questions_summary}

TASK :
1. Calcule un score global SUR 100 pour ce candidat
2. Identifie 3 points forts du candidat
3. Identifie 3 points faibles ou axes d'amélioration
4. Donne une recommandation finale (parmi : "À retenir", "À revoir", "À approfondir", "Non recommandé")
5. Ajoute un commentaire général concis

RÉPONDS UNIQUEMENT EN JSON VALIDE dans ce format :
{{
  "score": 75,
  "strengths": ["Point fort 1", "Point fort 2", "Point fort 3"],
  "weaknesses": ["Point faible 1", "Point faible 2", "Point faible 3"],
  "recommendation": "À retenir",
  "comment": "Commentaire général..."
}}"""

    groq_api_key = getattr(settings, "GROQ_API_KEY", None)
    if not groq_api_key:
        return {"error": "GROQ_API_KEY non configurée"}

    try:
        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "temperature": 0.3,
                "max_tokens": 1500,
                "messages": [
                    {
                        "role": "system",
                        "content": "Tu es un expert en évaluation de candidats. Réponds UNIQUEMENT en JSON valide.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
            },
            timeout=60,
        )

        if response.status_code != 200:
            logger.error(f"Erreur API Groq: {response.status_code}")
            return {"error": f"Erreur API Groq: {response.status_code}"}

        data = response.json()
        raw_content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        cleaned = raw_content.replace("```json", "").replace("```", "").strip()
        first_brace = cleaned.find("{")
        last_brace = cleaned.rfind("}")
        if first_brace != -1 and last_brace != -1:
            cleaned = cleaned[first_brace:last_brace + 1]

        analysis = json.loads(cleaned)

        analysis["qcm_score"] = qcm_percentage
        analysis["qcm_correct"] = qcm_correct_count
        analysis["qcm_total"] = qcm_total_count
        analysis["analyzed_at"] = timezone.now().isoformat()

        application.ai_analysis = analysis
        application.save(update_fields=["ai_analysis"])

        return {"success": True, "analysis": analysis}

    except json.JSONDecodeError as e:
        logger.error(f"Erreur parsing JSON: {e}")
        return {"error": "Erreur de parsing de la réponse IA"}
    except Exception as e:
        logger.error(f"Erreur analyse IA: {str(e)}")
        return {"error": f"Erreur lors de l'analyse: {str(e)}"}