# backend/profiles/utils/groq/answer_scorer.py
import json
import logging
from .client import groq_chat_completion

logger = logging.getLogger(__name__)


def score_open_answers(open_answers_list, job_title, experience_level):
    """
    Score les réponses aux questions ouvertes avec l'IA Groq.
    
    Args:
        open_answers_list: Liste de dicts avec 'question_index', 'question_text', 'answer'
        job_title: Titre du poste
        experience_level: Niveau d'expérience requis
    
    Returns:
        Dict avec average_score et question_feedbacks
    """
    if not open_answers_list:
        return {
            "average_score": 0,
            "question_feedbacks": [],
            "overall_assessment": "Aucune question ouverte à analyser"
        }
    
    question_feedbacks = []
    total_score = 0
    
    for item in open_answers_list:
        question_text = item.get("question_text", "")
        answer = item.get("answer", "")
        
        if not answer or len(answer.strip()) < 10:
            question_feedbacks.append({
                "question_index": item.get("question_index", 0),
                "score": 0,
                "comment": "Réponse trop courte ou vide",
                "strengths": [],
                "weaknesses": ["Réponse insuffisante"]
            })
            continue
        
        prompt = f"""Tu es un expert en recrutement. Analyse cette réponse à une question ouverte.

POSTE: {job_title}
NIVEAU REQUIS: {experience_level} ans

QUESTION:
{question_text}

RÉPONSE DU CANDIDAT:
{answer}

RÉPONDS UNIQUEMENT EN JSON:
{{
    "score": 0-100,
    "comment": "Commentaire détaillé (2-3 phrases)",
    "strengths": ["Force 1", "Force 2"],
    "weaknesses": ["Faiblesse 1", "Faiblesse 2"]
}}

CRITÈRES: Pertinence (40%), Profondeur (30%), Clarté (20%), Connaissances (10%)"""

        try:
            response_text = groq_chat_completion(
                messages=[
                    {"role": "system", "content": "Tu es un expert en évaluation. Réponds UNIQUEMENT en JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=600,
                timeout=45
            )
            
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1:
                cleaned = cleaned[start:end+1]
            
            result = json.loads(cleaned)
            
            score = min(100, max(0, result.get("score", 50)))
            total_score += score
            
            question_feedbacks.append({
                "question_index": item.get("question_index", 0),
                "score": score,
                "comment": result.get("comment", "Analyse non disponible"),
                "strengths": result.get("strengths", [])[:2],
                "weaknesses": result.get("weaknesses", [])[:2]
            })
            
        except Exception as e:
            logger.error(f"Erreur analyse question ouverte: {str(e)}")
            question_feedbacks.append({
                "question_index": item.get("question_index", 0),
                "score": 50,
                "comment": "Analyse temporairement indisponible",
                "strengths": [],
                "weaknesses": []
            })
            total_score += 50
    
    avg_score = round(total_score / len(open_answers_list)) if open_answers_list else 0
    
    # Générer une évaluation globale
    overall = "Réponses de qualité moyenne"
    if avg_score >= 80:
        overall = "Excellent candidat, réponses très pertinentes et détaillées"
    elif avg_score >= 60:
        overall = "Bon candidat, réponses correctes mais perfectibles"
    elif avg_score >= 40:
        overall = "Candidat moyen, certaines réponses manquent de profondeur"
    else:
        overall = "Candidat faible, réponses insuffisantes ou hors sujet"
    
    return {
        "average_score": avg_score,
        "question_feedbacks": question_feedbacks,
        "overall_assessment": overall
    }


def score_code_answers(code_answers_list, job_title, experience_level):
    """
    Score les réponses aux questions de code avec l'IA Groq.
    
    Args:
        code_answers_list: Liste de dicts avec 'question_index', 'question_text', 'code', 'language'
        job_title: Titre du poste
        experience_level: Niveau d'expérience requis
    
    Returns:
        Dict avec average_score et question_feedbacks
    """
    if not code_answers_list:
        return {
            "average_score": 0,
            "question_feedbacks": [],
            "overall_assessment": "Aucune question de code à analyser"
        }
    
    question_feedbacks = []
    total_score = 0
    
    for item in code_answers_list:
        question_text = item.get("question_text", "")
        code = item.get("code", "")
        language = item.get("language", "python")
        
        if not code or len(code.strip()) < 20:
            question_feedbacks.append({
                "question_index": item.get("question_index", 0),
                "score": 0,
                "comment": "Code vide ou trop court",
                "strengths": [],
                "weaknesses": ["Code non fourni ou incomplet"]
            })
            continue
        
        prompt = f"""Tu es un expert technique. Analyse ce code.

POSTE: {job_title}
LANGAGE: {language}

QUESTION:
{question_text}

CODE DU CANDIDAT:
{code[:1000]}

RÉPONDS UNIQUEMENT EN JSON:
{{
    "score": 0-100,
    "comment": "Commentaire technique détaillé (2-3 phrases)",
    "strengths": ["Force technique 1", "Force 2"],
    "weaknesses": ["Faiblesse technique 1", "Faiblesse 2"]
}}

CRITÈRES: Exactitude (40%), Qualité du code (25%), Gestion cas limites (15%), Performance (10%), Style (10%)"""

        try:
            response_text = groq_chat_completion(
                messages=[
                    {"role": "system", "content": "Tu es un expert technique. Réponds UNIQUEMENT en JSON."},
                    {"role": "user", "content": prompt}
                ],
                temperature=0.3,
                max_tokens=700,
                timeout=60
            )
            
            cleaned = response_text.strip()
            if cleaned.startswith("```json"):
                cleaned = cleaned[7:]
            if cleaned.startswith("```"):
                cleaned = cleaned[3:]
            if cleaned.endswith("```"):
                cleaned = cleaned[:-3]
            cleaned = cleaned.strip()
            
            start = cleaned.find("{")
            end = cleaned.rfind("}")
            if start != -1 and end != -1:
                cleaned = cleaned[start:end+1]
            
            result = json.loads(cleaned)
            
            score = min(100, max(0, result.get("score", 50)))
            total_score += score
            
            question_feedbacks.append({
                "question_index": item.get("question_index", 0),
                "score": score,
                "comment": result.get("comment", "Analyse non disponible"),
                "strengths": result.get("strengths", [])[:2],
                "weaknesses": result.get("weaknesses", [])[:2]
            })
            
        except Exception as e:
            logger.error(f"Erreur analyse code: {str(e)}")
            question_feedbacks.append({
                "question_index": item.get("question_index", 0),
                "score": 50,
                "comment": "Analyse temporairement indisponible",
                "strengths": [],
                "weaknesses": []
            })
            total_score += 50
    
    avg_score = round(total_score / len(code_answers_list)) if code_answers_list else 0
    
    overall = "Code de qualité moyenne"
    if avg_score >= 80:
        overall = "Excellent code, bonne logique et structure"
    elif avg_score >= 60:
        overall = "Bon code, fonctionnel mais perfectible"
    elif avg_score >= 40:
        overall = "Code correct mais avec des lacunes"
    else:
        overall = "Code insuffisant, nécessite des améliorations majeures"
    
    return {
        "average_score": avg_score,
        "question_feedbacks": question_feedbacks,
        "overall_assessment": overall
    }