# backend/applications/views_test.py
import logging
from django.conf import settings
from django.utils import timezone
from rest_framework import status
from rest_framework.response import Response
from .models import Application
from profiles.models import CandidateProfile
from .services.test_generation import generate_test_questions_with_groq
from .services.test_submission import submit_application_test
from .services.code_execution import execute_python_code, execute_javascript_code
from .services.email_notification import send_test_invitation_email, create_notification
from .services.ai_analysis_service import analyze_application_with_ai

logger = logging.getLogger(__name__)


def send_test_invitation(self, request, pk=None):
    """
    Envoie une invitation de test au candidat.
    """
    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    if not clerk_user_id:
        return Response({"error": "Non autorisé"}, status=400)

    try:
        from companies.models import RecruiterProfile
        recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)
    except RecruiterProfile.DoesNotExist:
        return Response({"error": "Recruteur non trouvé"}, status=404)

    try:
        application = Application.objects.select_related(
            "job", "candidate", "job__recruiter"
        ).get(pk=pk)
    except Application.DoesNotExist:
        return Response({"error": "Candidature introuvable"}, status=404)

    if application.job.recruiter != recruiter:
        return Response({"error": "Accès refusé à cette candidature"}, status=403)

    custom_questions = request.data.get("questions", None)

    if custom_questions and len(custom_questions) > 0:
        questions = []
        for q in custom_questions:
            is_code_question = q.get("is_code_question", False)
            if is_code_question:
                question_data = {
                    "question": q.get("text", ""),
                    "is_code_question": True,
                    "language": q.get("language", "python"),
                    "initial_code": q.get("initial_code", ""),
                    "expected_completion": q.get("expected_completion", ""),
                    "test_cases": q.get("test_cases", []),
                    "hint": q.get("hint", ""),
                    "estimated_time": q.get("estimatedTime", 300),
                    "difficulty": q.get("difficulty", "medium"),
                    "is_open_ended": False,
                    "options": [],
                    "correct_index": None,
                }
            else:
                is_open_ended = q.get("isOpenEnded", False)
                question_data = {
                    "question": q.get("text", ""),
                    "options": q.get("options", []),
                    "correct_index": q.get("correctIndex", 0) if not is_open_ended else None,
                    "is_open_ended": is_open_ended,
                    "is_code_question": False,
                    "estimated_time": q.get("estimatedTime", 60),
                    "difficulty": q.get("difficulty", "medium"),
                }
            questions.append(question_data)

        application.test_questions = questions
        application.status = "interview"
        application.test_sent_at = timezone.now()
        application.test_result = None
        application.test_completed_at = None
        application.save()

        candidate = application.candidate
        job = application.job
        company_name = recruiter.company_name if recruiter else "Notre entreprise"
        candidate_name = f"{getattr(candidate, 'first_name', '')} {getattr(candidate, 'last_name', '')}".strip() or candidate.email

        send_test_invitation_email(candidate, job.title, company_name, candidate_name)
        create_notification(
            recipient=candidate,
            title="Test technique disponible",
            message=f"Un test technique pour le poste '{job.title}' vous attend.",
            link="/dashboard"
        )

        serializer = self.get_serializer(application)
        return Response({"success": True, "application": serializer.data}, status=200)
    else:
        try:
            questions = generate_test_questions_with_groq(application)
        except Exception as e:
            return Response({"error": f"Erreur génération test : {str(e)}"}, status=500)

        application.test_questions = questions
        application.status = "interview"
        application.test_sent_at = timezone.now()
        application.save()

        serializer = self.get_serializer(application)
        return Response({"success": True, "application": serializer.data}, status=200)


def submit_test(self, request, pk=None):
    """
    Soumission du test par le candidat.
    ✅ Stocke les réponses et DÉCLENCHE AUTOMATIQUEMENT L'ANALYSE IA
    """
    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    if not clerk_user_id:
        return Response({"error": "Non autorisé"}, status=400)

    try:
        candidate = CandidateProfile.objects.get(clerk_user_id=clerk_user_id)
    except CandidateProfile.DoesNotExist:
        return Response({"error": "Candidat non trouvé"}, status=404)

    try:
        application = Application.objects.select_related("job", "candidate").get(pk=pk, candidate=candidate)
    except Application.DoesNotExist:
        return Response({"error": "Candidature introuvable"}, status=404)

    if not application.test_questions:
        return Response({"error": "Aucun test disponible"}, status=400)

    answers = request.data.get("answers", [])
    if not isinstance(answers, list):
        return Response({"error": "Le champ 'answers' doit être une liste"}, status=400)

    if len(answers) != len(application.test_questions):
        return Response({"error": f"Le nombre de réponses doit être exactement {len(application.test_questions)}"}, status=400)

    # ✅ Normalisation des réponses
    normalized_answers = []
    questions = application.test_questions

    for idx, q in enumerate(questions):
        user_answer = answers[idx] if idx < len(answers) else None
        is_code_question = q.get("is_code_question", False)
        is_open_ended = q.get("is_open_ended", False)

        if is_code_question:
            if isinstance(user_answer, dict):
                code_content = user_answer.get("code", "")
                normalized_answers.append(code_content if code_content else "")
            elif isinstance(user_answer, str):
                normalized_answers.append(user_answer)
            else:
                normalized_answers.append(str(user_answer) if user_answer else "")
        
        elif is_open_ended:
            if isinstance(user_answer, str):
                normalized_answers.append(user_answer)
            elif isinstance(user_answer, dict):
                normalized_answers.append(user_answer.get("answer", "") or user_answer.get("text", "") or str(user_answer))
            else:
                normalized_answers.append(str(user_answer) if user_answer else "")
        
        else:
            try:
                if isinstance(user_answer, str) and user_answer.isdigit():
                    normalized_answers.append(int(user_answer))
                elif isinstance(user_answer, int):
                    normalized_answers.append(user_answer)
                else:
                    normalized_answers.append(-1)
            except (ValueError, TypeError):
                normalized_answers.append(-1)

    # ✅ 1. Sauvegarde du test (score QCM)
    result_data = submit_application_test(application, normalized_answers)

    # ✅ 2. DÉCLENCHEMENT AUTOMATIQUE DE L'ANALYSE IA (pour toutes les questions)
    logger.info(f"📊 Déclenchement automatique de l'analyse IA pour la candidature {application.id}")
    
    try:
        ai_result = analyze_application_with_ai(application)
        
        if ai_result.get("success"):
            analysis = ai_result["analysis"]
            logger.info(f"✅ Analyse IA réussie : score total = {analysis.get('total_score', 0)}%")
            logger.info(f"   - Questions analysées: {analysis.get('total_questions', 0)}")
            
            # Log des scores par question
            for qs in analysis.get("question_scores", []):
                logger.info(f"   - Q{qs['question_index']} ({qs['question_type']}): {qs['score']}% - {qs['feedback'][:50]}")
        else:
            logger.warning(f"⚠️ Échec de l'analyse IA : {ai_result.get('error')}")
    except Exception as e:
        logger.error(f"❌ Erreur lors de l'analyse IA: {str(e)}")

    # ✅ 3. Rafraîchir l'application pour avoir les dernières données
    application.refresh_from_db()

    serializer = self.get_serializer(application)
    return Response({
        "success": True,
        "message": "Test soumis avec succès",
        "result": result_data,
        "application": serializer.data,
    }, status=200)


def get_test(self, request, pk=None):
    """
    Récupère les questions du test pour un candidat ou un recruteur.
    """
    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    if not clerk_user_id:
        return Response({"error": "Non autorisé"}, status=400)

    try:
        application = Application.objects.get(pk=pk)
    except Application.DoesNotExist:
        return Response({"error": "Candidature introuvable"}, status=404)

    is_candidate = False
    is_recruiter = False

    try:
        candidate = CandidateProfile.objects.get(clerk_user_id=clerk_user_id)
        if application.candidate == candidate:
            is_candidate = True
    except CandidateProfile.DoesNotExist:
        pass

    if not is_candidate:
        try:
            from companies.models import RecruiterProfile
            recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)
            if application.job.recruiter == recruiter:
                is_recruiter = True
        except RecruiterProfile.DoesNotExist:
            pass

    if not is_candidate and not is_recruiter:
        return Response({"error": "Non autorisé"}, status=403)

    if not application.test_questions:
        return Response({"error": "Aucun test disponible"}, status=404)

    transformed_questions = []
    for q in application.test_questions:
        if q.get("is_code_question", False):
            transformed_questions.append({
                "question": q.get("question", ""),
                "is_code_question": True,
                "language": q.get("language", "python"),
                "initial_code": q.get("initial_code", ""),
                "expected_completion": q.get("expected_completion", ""),
                "test_cases": q.get("test_cases", []),
                "hint": q.get("hint", ""),
                "estimated_time": q.get("estimated_time", 300),
                "difficulty": q.get("difficulty", "medium"),
            })
        else:
            transformed_questions.append({
                "question": q.get("question", ""),
                "options": q.get("options", []),
                "correct_index": q.get("correct_index"),
                "is_open_ended": q.get("is_open_ended", False),
                "estimated_time": q.get("estimated_time", 60),
                "difficulty": q.get("difficulty", "medium"),
            })

    # ✅ Inclure les résultats d'analyse IA si disponibles
    response_data = {
        'test_questions': transformed_questions,
        'test_result': application.test_result,
        'ai_analysis': application.ai_analysis,
        'has_submitted': bool(application.test_result),
        'total_questions': len(transformed_questions)
    }
    
    # Ajouter les scores IA si disponibles
    if application.ai_analysis:
        response_data['ai_scores'] = {
            'total_score': application.ai_analysis.get('total_score'),
            'question_scores': application.ai_analysis.get('question_scores'),
            'recommendation': application.ai_analysis.get('recommendation'),
            'global_comment': application.ai_analysis.get('global_comment')
        }
    
    return Response(response_data, status=status.HTTP_200_OK)


def execute_code(self, request, pk=None):
    """
    Exécute du code candidat (Python/JavaScript) en sandbox.
    """
    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    if not clerk_user_id:
        return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)

    try:
        application = Application.objects.get(pk=pk, candidate__clerk_user_id=clerk_user_id)
    except Application.DoesNotExist:
        return Response({"error": "Candidature introuvable"}, status=status.HTTP_404_NOT_FOUND)

    language = request.data.get("language", "python")
    code = request.data.get("code", "")
    test_cases = request.data.get("test_cases", [])

    if not code:
        return Response({"error": "Code vide"}, status=status.HTTP_400_BAD_REQUEST)

    results = []
    for i, test_case in enumerate(test_cases):
        try:
            if language == "python":
                result = execute_python_code(code, test_case)
            elif language == "javascript":
                result = execute_javascript_code(code, test_case)
            else:
                result = {"error": f"Langage {language} non supporté"}

            results.append({
                "test_index": i,
                "input": test_case.get("input"),
                "expected": test_case.get("expected"),
                "output": result.get("output"),
                "passed": result.get("output") == test_case.get("expected") if not result.get("error") else False,
                "error": result.get("error")
            })
        except Exception as e:
            results.append({
                "test_index": i,
                "error": str(e),
                "passed": False
            })

    passed_count = sum(1 for r in results if r.get("passed"))
    total_count = len(test_cases)

    return Response({
        "results": results,
        "passed": passed_count,
        "total": total_count,
        "score": int((passed_count / total_count) * 100) if total_count > 0 else 0
    }, status=status.HTTP_200_OK)