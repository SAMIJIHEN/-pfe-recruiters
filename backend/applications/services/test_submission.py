# backend/applications/services/test_submission.py
from django.utils import timezone
from .email_notification import create_notification

def submit_application_test(application, answers):
    """
    Calcule le score QCM, crée les détails et met à jour l'application.
    Retourne le résultat (dict) à renvoyer au frontend.
    
    IMPORTANT : answers est une liste où chaque élément correspond à la réponse
    pour la question à l'index correspondant.
    - Pour QCM : integer (index de l'option)
    - Pour question ouverte : string (texte)
    - Pour code : string (code complet)
    """
    questions = application.test_questions
    total = len(questions)
    qcm_score = 0
    qcm_total = 0
    details = []

    for index, question in enumerate(questions):
        is_open_ended = question.get("is_open_ended", False)
        is_code_question = question.get("is_code_question", False)
        correct_index = question.get("correct_index")
        user_answer = answers[index] if index < len(answers) else None
        
        # Normalisation des réponses
        if is_code_question:
            if isinstance(user_answer, dict):
                user_answer = user_answer.get("code", "")
            elif not isinstance(user_answer, str):
                user_answer = str(user_answer) if user_answer else ""
        
        if is_open_ended or is_code_question:
            # Pas de correction automatique pour ouvert/code (l'IA s'en chargera)
            is_correct = None
            score_received = None
            details.append({
                "question": question.get("question", ""),
                "selected_index": None,
                "selected_text": user_answer if user_answer else "Aucune réponse",
                "correct_index": correct_index,
                "is_correct": None,
                "score_received": None,
                "is_open_ended": is_open_ended,
                "is_code_question": is_code_question,
            })
        else:
            # QCM : correction automatique
            if isinstance(user_answer, str) and user_answer.isdigit():
                user_answer = int(user_answer)
            elif not isinstance(user_answer, int):
                user_answer = -1  # Non répondue
            
            is_correct = (user_answer == correct_index) if correct_index is not None else False
            score_received = 1 if is_correct else 0
            qcm_score += score_received
            qcm_total += 1
            
            # Récupérer le texte de l'option sélectionnée
            options = question.get("options", [])
            selected_text = options[user_answer] if 0 <= user_answer < len(options) else "Non répondue"
            
            details.append({
                "question": question.get("question", ""),
                "selected_index": user_answer,
                "selected_text": selected_text,
                "correct_index": correct_index,
                "is_correct": is_correct,
                "score_received": score_received,
                "is_open_ended": False,
                "is_code_question": False,
            })

    qcm_percentage = round((qcm_score / qcm_total) * 100) if qcm_total > 0 else 0

    result_data = {
        "answers": answers,  # ✅ Stocke les réponses brutes pour l'IA
        "score": qcm_score,
        "total": total,
        "qcm_count": qcm_total,
        "percentage": qcm_percentage,
        "details": details,
    }

    # Mise à jour de l'application
    application.test_result = result_data
    application.status = "reviewed"
    application.test_completed_at = timezone.now()
    application.save(update_fields=["test_result", "status", "test_completed_at"])

    # Notification au candidat
    create_notification(
        recipient=application.candidate,
        title="Test technique complété",
        message=f"Votre test pour le poste '{application.job.title}' a été soumis.",
        link="/dashboard"
    )

    return result_data