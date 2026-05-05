# backend/jobs/views.py
from django.utils import timezone
from django.views.decorators.csrf import csrf_exempt
from django.utils.decorators import method_decorator
from rest_framework import viewsets, status
from rest_framework.decorators import action
from rest_framework.permissions import AllowAny
from rest_framework.response import Response

from .models import JobOffer
from .serializers import JobOfferSerializer
from companies.models import RecruiterProfile
from profiles.models import CandidateProfile  # ✅ IMPORT AJOUTÉ
from profiles.models import TalentPool
from .services.offer_service import (
    get_recruiter_from_request,
    publish_offer,
    close_offer,
    increment_view_count,
)
from .services.recommendation_service import (
    recommend_candidates_by_skills,
    recommend_jobs_for_candidate,
    recommend_talents_for_offer,
)


@method_decorator(csrf_exempt, name="dispatch")
class JobOfferViewSet(viewsets.ModelViewSet):
    serializer_class = JobOfferSerializer
    queryset = JobOffer.objects.select_related("recruiter").all().order_by("-created_at")
    permission_classes = [AllowAny]

    def get_recruiter(self):
        return get_recruiter_from_request(self.request)

    def get_queryset(self):
        queryset = super().get_queryset()
        if self.action == "my_offers":
            recruiter = self.get_recruiter()
            if not recruiter:
                return JobOffer.objects.none()
            return queryset.filter(recruiter=recruiter)
        return queryset

    def create(self, request, *args, **kwargs):
        recruiter = self.get_recruiter()
        if not recruiter:
            return Response(
                {"error": "Recruteur introuvable ou header X-Clerk-User-Id / X-User-Email manquant"},
                status=status.HTTP_400_BAD_REQUEST
            )

        serializer = self.get_serializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        serializer.save(recruiter=recruiter)
        return Response(serializer.data, status=status.HTTP_201_CREATED)

    @action(detail=False, methods=["get"], url_path="my_offers")
    def my_offers(self, request):
        recruiter = self.get_recruiter()
        if not recruiter:
            return Response(
                {"error": "Recruteur introuvable ou header X-Clerk-User-Id / X-User-Email manquant"},
                status=status.HTTP_400_BAD_REQUEST
            )

        offers = JobOffer.objects.filter(recruiter=recruiter).order_by("-created_at")
        serializer = self.get_serializer(offers, many=True)
        return Response({"count": offers.count(), "results": serializer.data})

    @action(detail=True, methods=["post"], url_path="publish")
    def publish(self, request, pk=None):
        recruiter = self.get_recruiter()
        if not recruiter:
            return Response({"error": "Non autorisé"}, status=status.HTTP_400_BAD_REQUEST)

        offer = self.get_object()
        if offer.recruiter != recruiter:
            return Response({"error": "Cette offre ne vous appartient pas"}, status=status.HTTP_403_FORBIDDEN)

        publish_offer(offer)
        serializer = self.get_serializer(offer)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="close")
    def close(self, request, pk=None):
        recruiter = self.get_recruiter()
        if not recruiter:
            return Response({"error": "Non autorisé"}, status=status.HTTP_400_BAD_REQUEST)

        offer = self.get_object()
        if offer.recruiter != recruiter:
            return Response({"error": "Cette offre ne vous appartient pas"}, status=status.HTTP_403_FORBIDDEN)

        close_offer(offer)
        serializer = self.get_serializer(offer)
        return Response(serializer.data)

    @action(detail=True, methods=["post"], url_path="increment_view")
    def increment_view(self, request, pk=None):
        try:
            offer = self.get_object()
            new_count = increment_view_count(offer)
            return Response({"success": True, "views_count": new_count}, status=status.HTTP_200_OK)
        except Exception as e:
            return Response({"error": str(e)}, status=status.HTTP_400_BAD_REQUEST)

    # ============================================================
    # RECOMMANDATION DE CANDIDATS PAR COMPÉTENCES (POUR RECRUTEUR)
    # ============================================================
    @action(detail=False, methods=["post"], url_path="recommend-candidates-by-skills")
    def recommend_candidates_by_skills(self, request):
        clerk_user_id = request.headers.get("X-Clerk-User-Id")
        if not clerk_user_id:
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)
        except RecruiterProfile.DoesNotExist:
            return Response({"error": "Recruteur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        skills = request.data.get("skills", [])
        if not skills or not isinstance(skills, list):
            return Response({"error": "Liste de compétences requise"}, status=status.HTTP_400_BAD_REQUEST)

        results = recommend_candidates_by_skills(recruiter, skills)
        return Response(results, status=status.HTTP_200_OK)

    # ============================================================
    # RECOMMANDATION D'OFFRES POUR CANDIDAT
    # ============================================================
    @action(detail=False, methods=["post"], url_path="recommend-for-candidate")
    def recommend_for_candidate(self, request):
        clerk_user_id = request.headers.get("X-Clerk-User-Id")
        if not clerk_user_id:
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            candidate = CandidateProfile.objects.get(clerk_user_id=clerk_user_id)
        except CandidateProfile.DoesNotExist:
            return Response({"error": "Profil candidat non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        offers = JobOffer.objects.filter(status="active").select_related("recruiter")
        recommendations = recommend_jobs_for_candidate(candidate, offers)

        return Response({
            "recommendations": recommendations,
            "total": len(recommendations),
            "candidate_skills": [s.lower() for s in (candidate.skills or [])],
            "candidate_title": (candidate.title or "").lower()
        }, status=status.HTTP_200_OK)

    # ============================================================
    # RECOMMANDER LES TALENTS DU VIVIER POUR UNE OFFRE
    # ============================================================
    @action(detail=True, methods=["get"], url_path="recommend-talents")
    def recommend_talents_for_offer(self, request, pk=None):
        clerk_user_id = request.headers.get("X-Clerk-User-Id")
        if not clerk_user_id:
            return Response({"error": "Non autorisé"}, status=status.HTTP_401_UNAUTHORIZED)

        try:
            recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)
        except RecruiterProfile.DoesNotExist:
            return Response({"error": "Recruteur non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        try:
            offer = JobOffer.objects.get(pk=pk, recruiter=recruiter)
        except JobOffer.DoesNotExist:
            return Response({"error": "Offre non trouvée"}, status=status.HTTP_404_NOT_FOUND)

        talents = TalentPool.objects.filter(recruiter=recruiter).select_related('candidate')
        if not talents.exists():
            return Response({"talents": [], "message": "Aucun talent dans votre vivier"}, status=status.HTTP_200_OK)

        results = recommend_talents_for_offer(offer, talents)
        return Response({
            "talents": results,
            "total": len(results),
            "offer_skills": [s.lower() for s in (offer.skills_required or [])]
        }, status=status.HTTP_200_OK)