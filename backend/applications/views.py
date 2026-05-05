# backend/applications/views.py
import logging
from django.db import models
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.response import Response

from .models import Application
from jobs.models import JobOffer
from profiles.models import CandidateProfile
from .serializers import ApplicationSerializer

# Services
from .services.notification_service import create_candidature_notification
from .services.talent_pool_service import auto_add_to_talent_pool_if_rich
from .services.ai_analysis_service import analyze_application_with_ai

# Actions de test et entretien (inchangées)
from .views_test import (
    send_test_invitation,
    submit_test,
    get_test,
    execute_code,
)
from .views_interview import schedule_interview, accept_candidate

logger = logging.getLogger(__name__)


class ApplicationViewSet(viewsets.ModelViewSet):
    queryset = Application.objects.select_related(
        "job", "candidate", "job__recruiter"
    ).all()
    serializer_class = ApplicationSerializer

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def get_queryset(self):
        queryset = Application.objects.select_related(
            "job", "candidate", "job__recruiter"
        ).all()

        clerk_user_id = self.request.headers.get("X-Clerk-User-Id")
        if not clerk_user_id:
            return queryset.none()

        try:
            candidate = CandidateProfile.objects.get(clerk_user_id=clerk_user_id)
            return queryset.filter(candidate=candidate)
        except CandidateProfile.DoesNotExist:
            pass

        try:
            from companies.models import RecruiterProfile
            recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)
            return queryset.filter(job__recruiter=recruiter)
        except RecruiterProfile.DoesNotExist:
            pass

        return queryset.none()

    def partial_update(self, request, *args, **kwargs):
        instance = self.get_object()
        new_status = request.data.get("status")

        if new_status not in [choice[0] for choice in Application.STATUS_CHOICES]:
            return Response({"error": "Statut invalide"}, status=400)

        old_status = instance.status
        instance.status = new_status
        instance.save(update_fields=["status"])

        if old_status != new_status:
            try:
                candidate = instance.candidate
                job_title = instance.job.title
                status_labels = {
                    "pending": "en attente",
                    "reviewed": "examinée",
                    "interview": "test en attente",
                    "accepted": "acceptée",
                    "rejected": "refusée",
                    "programme_entretien": "entretien programmé",
                }
                label = status_labels.get(new_status, new_status)
                create_candidature_notification(
                    recipient=candidate,
                    title="Statut de candidature mis à jour",
                    message=f"Votre candidature pour le poste '{job_title}' est maintenant {label}.",
                    link="/dashboard"
                )
            except Exception as e:
                logger.warning(f"Erreur création notification statut: {e}")

        serializer = self.get_serializer(instance)
        return Response(serializer.data)

    def create(self, request, *args, **kwargs):
        print("=" * 60)
        print("🔥 METHODE CREATE APPELEE")
        print("=" * 60)
        
        clerk_user_id = request.headers.get("X-Clerk-User-Id")
        job_id = request.data.get("job")

        if not clerk_user_id or not job_id:
            return Response(
                {"error": "Informations manquantes"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        try:
            candidate = CandidateProfile.objects.get(clerk_user_id=clerk_user_id)
            job = JobOffer.objects.get(id=job_id)

            if Application.objects.filter(job=job, candidate=candidate).exists():
                return Response(
                    {"error": "Vous avez déjà postulé à cette offre"},
                    status=status.HTTP_400_BAD_REQUEST,
                )

            application = Application.objects.create(
                job=job,
                candidate=candidate,
                cover_letter=request.data.get("cover_letter", ""),
            )

            create_candidature_notification(
                recipient=candidate,
                title="Candidature envoyée",
                message=f"Votre candidature pour le poste '{job.title}' a bien été envoyée.",
                link="/dashboard"
            )

            print("🔥🔥🔥 AVANT appel stockage")
            auto_add_to_talent_pool_if_rich(candidate, job)
            print("🔥🔥🔥 APRÈS appel stockage")

            serializer = self.get_serializer(application)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except CandidateProfile.DoesNotExist:
            return Response(
                {"error": "Profil candidat introuvable"},
                status=status.HTTP_400_BAD_REQUEST,
            )
        except JobOffer.DoesNotExist:
            return Response(
                {"error": "Offre non trouvée"},
                status=status.HTTP_404_NOT_FOUND,
            )

    @action(detail=False, methods=["get"], url_path="my-applications")
    def my_applications(self, request):
        clerk_user_id = request.headers.get("X-Clerk-User-Id")
        if not clerk_user_id:
            return Response({"error": "Header X-Clerk-User-Id manquant"}, status=400)

        try:
            candidate = CandidateProfile.objects.get(clerk_user_id=clerk_user_id)
            applications = (
                Application.objects
                .select_related("job", "candidate", "job__recruiter")
                .filter(candidate=candidate)
                .order_by("-applied_at")
            )
            serializer = self.get_serializer(applications, many=True)
            return Response({
                "count": applications.count(),
                "results": serializer.data
            })
        except CandidateProfile.DoesNotExist:
            return Response({"error": "Profil non trouvé"}, status=404)

    @action(detail=False, methods=["get"], url_path="for-recruiter")
    def for_recruiter(self, request):
        clerk_user_id = request.headers.get("X-Clerk-User-Id")
        if not clerk_user_id:
            return Response({"error": "Header X-Clerk-User-Id manquant"}, status=400)

        try:
            from companies.models import RecruiterProfile
            recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)

            applications = (
                Application.objects
                .select_related("job", "candidate", "job__recruiter")
                .filter(job__recruiter=recruiter)
                .order_by("-applied_at")
            )

            serializer = self.get_serializer(applications, many=True)
            return Response({
                "count": applications.count(),
                "results": serializer.data
            })

        except RecruiterProfile.DoesNotExist:
            return Response({"error": "Recruteur non trouvé"}, status=404)
        except Exception as e:
            logger.error(f"Erreur dans for_recruiter: {str(e)}")
            return Response({"error": f"Erreur serveur : {str(e)}"}, status=500)

    # ==================== ACTIONS DE TEST ====================
    
    @action(detail=True, methods=["post"], url_path="send-test-invitation")
    def send_test_invitation(self, request, pk=None):
        return send_test_invitation(self, request, pk)

    @action(detail=True, methods=["post"], url_path="submit-test")
    def submit_test(self, request, pk=None):
        return submit_test(self, request, pk)

    @action(detail=True, methods=["get"], url_path="get-test")
    def get_test(self, request, pk=None):
        return get_test(self, request, pk)

    @action(detail=True, methods=["post"], url_path="execute-code")
    def execute_code(self, request, pk=None):
        return execute_code(self, request, pk)

    # ==================== ACTIONS D'ANALYSE IA ====================
    
    @action(detail=True, methods=["post"], url_path="analyze-with-ai")
    def analyze_with_ai(self, request, pk=None):
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
            return Response({"error": "Accès refusé"}, status=403)

        result = analyze_application_with_ai(application)
        if result.get("error"):
            return Response({"error": result["error"]}, status=500)

        return Response(result, status=200)

    # ==================== ACTIONS D'ENTRETIEN ====================
    
    @action(detail=True, methods=["post"], url_path="schedule-interview")
    def schedule_interview(self, request, pk=None):
        return schedule_interview(self, request, pk)

    @action(detail=True, methods=["post"], url_path="accept-candidate")
    def accept_candidate(self, request, pk=None):
        return accept_candidate(self, request, pk)