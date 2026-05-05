# backend/companies/views.py
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import AllowAny
from django.utils import timezone
from django.db import models

from .models import RecruiterProfile
from .serializers import RecruiterProfileDetailSerializer
from .services.validation_service import get_request_identity, to_bool
from .services.email_service import send_approval_email
from .services.recruiter_service import register_or_update_recruiter, get_recruiter_stats as get_recruiter_stats_service

import logging

logger = logging.getLogger(__name__)


# ============================================================================
# VUES API
# ============================================================================

@api_view(["POST"])
@permission_classes([AllowAny])
def register_recruiter(request):
    logger.info("=" * 50)
    logger.info("INSCRIPTION RECRUTEUR")

    identity = get_request_identity(request)
    logger.info(f"Email: {identity['email']}")
    logger.info(f"Clerk ID: {identity['clerk_user_id']}")

    profile, created, error = register_or_update_recruiter(identity, request.data)

    if error:
        return Response(
            {"error": error, "code": "EMAIL_REQUIRED" if error == "Email requis" else "UNKNOWN"},
            status=status.HTTP_400_BAD_REQUEST,
        )

    serializer = RecruiterProfileDetailSerializer(profile)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_pending_recruiters(request):
    try:
        pending = RecruiterProfile.objects.filter(status="pending").order_by("-created_at")
        serializer = RecruiterProfileDetailSerializer(pending, many=True)
        logger.info(f"{pending.count()} recruteurs en attente")
        return Response({
            "count": pending.count(),
            "results": serializer.data,
        })
    except Exception as e:
        logger.exception(f"Erreur get_pending_recruiters: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["POST"])
@permission_classes([AllowAny])
def approve_recruiter(request, recruiter_id):
    try:
        profile = RecruiterProfile.objects.get(id=recruiter_id)
        action = request.data.get("action")
        force_email = to_bool(request.data.get("force_email"))
        email_sent = False

        if action == "approve":
            was_already_approved = profile.status == "approved"

            profile.status = "approved"
            profile.rejection_reason = None
            profile.save()

            if (not was_already_approved) or force_email:
                logger.info(f"Tentative d'envoi d'email à {profile.email}...")
                email_sent = send_approval_email(profile)

            if was_already_approved and not force_email:
                message = "Compte recruteur déjà approuvé (email non renvoyé)"
            else:
                message = "Compte recruteur approuvé avec succès"

            if email_sent:
                message += " et email de confirmation envoyé"
            elif (not was_already_approved) or force_email:
                message += " mais l'email n'a pas pu être envoyé"

        elif action == "reject":
            profile.status = "rejected"
            profile.rejection_reason = request.data.get("reason", "")
            profile.save()
            message = "Compte recruteur rejeté"
            logger.info(f"Recruteur {profile.email} rejeté")
        else:
            return Response({"error": "Action invalide"}, status=status.HTTP_400_BAD_REQUEST)

        return Response({
            "message": message,
            "status": profile.status,
            "email_sent": email_sent if action == "approve" else None,
            "recruiter_id": profile.id,
            "email": profile.email,
        })

    except RecruiterProfile.DoesNotExist:
        logger.error(f"Recruteur {recruiter_id} non trouvé")
        return Response({"error": "Recruteur non trouvé"}, status=status.HTTP_404_NOT_FOUND)
    except Exception as e:
        logger.exception(f"Erreur approve_recruiter: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


@api_view(["GET"])
@permission_classes([AllowAny])
def get_recruiter_stats(request):
    try:
        identity = get_request_identity(request)
        clerk_user_id = identity["clerk_user_id"]
        email = identity["email"]

        logger.info(f"Stats demandées pour clerk_id: {clerk_user_id} | email: {email}")

        if not clerk_user_id and not email:
            return Response({"error": "Identité utilisateur manquante"}, status=status.HTTP_400_BAD_REQUEST)

        query = RecruiterProfile.objects.none()
        if clerk_user_id and email:
            query = RecruiterProfile.objects.filter(
                models.Q(clerk_user_id=clerk_user_id) | models.Q(email=email)
            )
        elif clerk_user_id:
            query = RecruiterProfile.objects.filter(clerk_user_id=clerk_user_id)
        else:
            query = RecruiterProfile.objects.filter(email=email)

        profile = query.first()
        if not profile:
            logger.warning("Profil non trouvé")
            return Response({"error": "Profil non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        # ✅ Utilisation de l'alias pour éviter le conflit de nom
        stats = get_recruiter_stats_service(profile)
        return Response(stats)

    except Exception as e:
        logger.exception(f"Erreur get_recruiter_stats: {str(e)}")
        return Response({"error": str(e)}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class RecruiterProfileViewSet(viewsets.ModelViewSet):
    serializer_class = RecruiterProfileDetailSerializer
    permission_classes = [AllowAny]

    def get_queryset(self):
        identity = get_request_identity(self.request)
        clerk_user_id = identity["clerk_user_id"]
        email = identity["email"]

        if not clerk_user_id and not email:
            return RecruiterProfile.objects.none()
        if clerk_user_id and email:
            return RecruiterProfile.objects.filter(
                models.Q(clerk_user_id=clerk_user_id) | models.Q(email=email)
            )
        if clerk_user_id:
            return RecruiterProfile.objects.filter(clerk_user_id=clerk_user_id)
        return RecruiterProfile.objects.filter(email=email)

    def get_object(self):
        return self.get_queryset().first()

    def list(self, request):
        profile = self.get_object()
        if profile:
            serializer = self.get_serializer(profile)
            return Response({
                **serializer.data,
                "is_approved": profile.status == "approved",
            })
        return Response({"error": "Profil non trouvé"}, status=status.HTTP_404_NOT_FOUND)

    def partial_update(self, request, *args, **kwargs):
        profile = self.get_object()
        if not profile:
            return Response({"error": "Profil non trouvé"}, status=status.HTTP_404_NOT_FOUND)

        serializer = self.get_serializer(profile, data=request.data, partial=True)
        if serializer.is_valid():
            serializer.save(updated_at=timezone.now())
            return Response(serializer.data)
        return Response(serializer.errors, status=status.HTTP_400_BAD_REQUEST)