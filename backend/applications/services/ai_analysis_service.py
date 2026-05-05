# backend/applications/services/ai_analysis_service.py
import json
import logging
import requests
from django.conf import settings
from django.utils import timezone

logger = logging.getLogger(__name__)


def analyze_application_with_ai(application):
    """
    Analyse TOUTES les réponses du candidat.
    - QCM : score automatique (0 ou 100)
    - Questions ouvertes/code : score IA ou fallback intelligent
    - Score FINAL = moyenne de TOUTES les questions
    """
    if not application.test_result:
        return {"error": "Aucun résultat de test disponible"}

    questions = application.test_questions
    result = application.test_result
    answers = result.get("answers", [])

    if not questions:
        return {"error": "Aucune question trouvée"}

    job_title = application.job.title
    required_skills = application.job.skills_required or []
    skills_text = ", ".join(required_skills) if required_skills else "Non spécifiées"

    question_scores = []
    total_score_sum = 0
    groq_api_key = getattr(settings, "GROQ_API_KEY", None)

    for idx, q in enumerate(questions):
        question_text = q.get("question", f"Question {idx + 1}")
        is_open_ended = q.get("is_open_ended", False)
        is_code_question = q.get("is_code_question", False)
        correct_index = q.get("correct_index")
        options = q.get("options", [])
        user_answer = answers[idx] if idx < len(answers) else "Non répondue"

        # ==================== QCM ====================
        if not is_open_ended and not is_code_question:
            if isinstance(user_answer, str) and user_answer.isdigit():
                user_answer = int(user_answer)
            elif not isinstance(user_answer, int):
                user_answer = -1
            is_correct = (user_answer == correct_index) if correct_index is not None else False
            score = 100 if is_correct else 0
            total_score_sum += score
            question_scores.append({
                "question_index": idx + 1,
                "question_text": question_text,
                "question_type": "qcm",
                "score": score,
                "feedback": "✅ Bonne réponse" if is_correct else "❌ Mauvaise réponse",
                "correct_answer": options[correct_index] if correct_index is not None else None,
                "user_answer": options[user_answer] if 0 <= user_answer < len(options) else "Non répondue",
                "strengths": [],
                "weaknesses": [],
                "suggestions": []
            })
            continue

        # ==================== QUESTION OUVERTE OU CODE ====================
        answer_text = user_answer if isinstance(user_answer, str) else str(user_answer)
        
        # Vérifier si la réponse est valide
        score, feedback, strengths, weaknesses, suggestions = _analyser_reponse(
            answer_text=answer_text,
            question_text=question_text,
            job_title=job_title,
            skills_text=skills_text,
            is_code=is_code_question,
            groq_api_key=groq_api_key
        )

        total_score_sum += score
        question_scores.append({
            "question_index": idx + 1,
            "question_text": question_text,
            "question_type": "code" if is_code_question else "open",
            "score": score,
            "feedback": feedback,
            "strengths": strengths[:2] if strengths else [],
            "weaknesses": weaknesses[:2] if weaknesses else [],
            "suggestions": suggestions[:2] if suggestions else []
        })

    # ==================== SCORE FINAL = MOYENNE ====================
    final_score = round(total_score_sum / len(questions)) if questions else 0

    analysis = {
        "total_score": final_score,
        "total_questions": len(questions),
        "question_scores": question_scores,
        "analyzed_at": timezone.now().isoformat(),
    }
    
    application.ai_analysis = analysis
    application.save(update_fields=["ai_analysis"])
    
    test_result = application.test_result
    if test_result:
        test_result["total_score_ia"] = final_score
        test_result["question_scores_ia"] = question_scores
        application.test_result = test_result
        application.save(update_fields=["test_result"])
    
    logger.info(f"✅ Analyse terminée: score final = {final_score}%")
    
    return {"success": True, "analysis": analysis}


def _analyser_reponse(answer_text, question_text, job_title, skills_text, is_code, groq_api_key):
    """
    Analyse une réponse et retourne (score, feedback, strengths, weaknesses, suggestions)
    """
    answer_text = answer_text.strip() if answer_text else ""
    
    # === CAS 1 : Réponse vide ou trop courte ===
    if len(answer_text) < 15:
        return (0, "❌ Réponse trop courte ou vide. Aucune information exploitable.", [], ["Réponse insuffisante"], ["Développer une réponse détaillée"])
    
    # === CAS 2 : Réponse incohérente (lettres aléatoires sans sens) ===
    mots = answer_text.split()
    mots_valides = [m for m in mots if len(m) > 2 and m.isalpha()]
    if len(mots_valides) < 2:
        return (0, "❌ Réponse incohérente ou incompréhensible.", [], ["Réponse non valide"], ["Fournir une réponse claire et structurée"])
    
    # === CAS 3 : "Je ne sais pas" ou équivalent ===
    expressions_vides = ["je ne sais pas", "je sais pas", "pas de réponse", "aucune idée", "je ne connais pas"]
    if any(expr in answer_text.lower() for expr in expressions_vides):
        return (0, "❌ Le candidat indique ne pas savoir répondre à cette question.", [], ["Manque de connaissances"], ["Réviser le sujet concerné"])
    
    # === CAS 4 : Appel IA si disponible ===
    if groq_api_key:
        try:
            prompt = f"""Score cette réponse de 0 à 100.

Poste: {job_title}
Compétences: {skills_text}

Question: {question_text}

Réponse: {answer_text[:800]}

Retourne UNIQUEMENT JSON: {{"score": 0-100, "feedback": "justification", "strengths": [], "weaknesses": [], "suggestions": []}}"""

            response = requests.post(
                "https://api.groq.com/openai/v1/chat/completions",
                headers={"Authorization": f"Bearer {groq_api_key}", "Content-Type": "application/json"},
                json={
                    "model": "llama-3.3-70b-versatile",
                    "temperature": 0.3,
                    "max_tokens": 400,
                    "messages": [
                        {"role": "system", "content": "Expert. Réponds UNIQUEMENT en JSON."},
                        {"role": "user", "content": prompt}
                    ],
                },
                timeout=90,
            )
            
            if response.status_code == 200:
                data = response.json()
                raw = data["choices"][0]["message"]["content"]
                raw = raw.replace("```json", "").replace("```", "").strip()
                start, end = raw.find("{"), raw.rfind("}")
                if start != -1 and end != -1:
                    raw = raw[start:end+1]
                result = json.loads(raw)
                score = min(100, max(0, result.get("score", 50)))
                feedback = result.get("feedback", f"Score IA: {score}%")
                strengths = result.get("strengths", [])
                weaknesses = result.get("weaknesses", [])
                suggestions = result.get("suggestions", [])
                return (score, feedback, strengths, weaknesses, suggestions)
        except Exception as e:
            logger.error(f"Erreur IA: {e}")
    
    # === CAS 5 : Fallback intelligent (pas d'IA ou erreur) ===
    score, feedback, strengths, weaknesses, suggestions = _fallback_intelligent(answer_text, is_code, question_text, job_title)
    return (score, feedback, strengths, weaknesses, suggestions)


def _fallback_intelligent(answer_text, is_code, question_text, job_title):
    """Fallback qui donne des scores cohérents basés sur la qualité visible"""
    
    longueur = len(answer_text)
    
    # Score basé sur la longueur
    if longueur < 30:
        base_score = 10
    elif longueur < 80:
        base_score = 30
    elif longueur < 150:
        base_score = 50
    elif longueur < 300:
        base_score = 65
    else:
        base_score = 75
    
    # Mots techniques à valoriser
    mots_techniques = [
        "API", "cache", "Redis", "microservices", "JWT", "OAuth", "chiffrement",
        "scalabilité", "load balancer", "GPU", "TPU", "index", "partition",
        "asynchrone", "queue", "WebSocket", "polling", "callback", "middleware",
        "authentification", "autorisation", "logging", "monitoring", "CI/CD"
    ]
    
    bonus = 0
    answer_lower = answer_text.lower()
    for mot in mots_techniques:
        if mot.lower() in answer_lower:
            bonus += 8
    
    # Bonus pour structure (présence de listes ou numérotation)
    if any(c in answer_text for c in ["1.", "2.", "3.", "- ", "•", "* "]):
        bonus += 10
    
    # Bonus pour phrases complètes (présence de points et virgules)
    if "." in answer_text and "," in answer_text:
        bonus += 5
    
    score = min(100, base_score + bonus)
    
    # Génération du feedback
    if score >= 80:
        feedback = f"✅ Bonne réponse ({score}%). " + (
            "Réponse bien structurée avec des termes techniques pertinents."
            if bonus > 15 else
            "Bonne réponse, mais pourrait inclure plus de détails techniques."
        )
    elif score >= 60:
        feedback = f"📝 Réponse correcte ({score}%). " + (
            "Contient des éléments techniques intéressants mais manque de profondeur."
            if bonus < 15 else
            "Bonne structure, mais certains points mériteraient d'être développés."
        )
    elif score >= 40:
        feedback = f"⚠️ Réponse moyenne ({score}%). Réponse superficielle, manque de précision technique."
    elif score >= 20:
        feedback = f"⚠️ Réponse insuffisante ({score}%). Trop courte ou vague."
    else:
        feedback = f"❌ Réponse très insuffisante ({score}%). Ne répond pas correctement à la question."
    
    # Génération des forces/faiblesses/suggestions
    strengths = []
    weaknesses = []
    suggestions = []
    
    if longueur > 150:
        strengths.append("Réponse développée et structurée")
    else:
        weaknesses.append("Réponse trop courte")
        suggestions.append("Développer davantage la réponse")
    
    if bonus > 15:
        strengths.append("Utilisation de termes techniques pertinents")
    else:
        weaknesses.append("Manque de vocabulaire technique spécifique")
        suggestions.append("Utiliser plus de termes techniques liés au poste")
    
    if not any(c in answer_text for c in ["1.", "2.", "- ", "•"]):
        suggestions.append("Structurer la réponse en points clés pour plus de clarté")
    
    # Pour les questions de code
    if is_code:
        if "def " in answer_text or "function " in answer_text or "class " in answer_text:
            strengths.append("Code bien structuré")
        else:
            weaknesses.append("Code non structuré ou incomplet")
            suggestions.append("Organiser le code avec des fonctions ou classes claires")
    
    return (score, feedback, strengths[:2], weaknesses[:2], suggestions[:2])