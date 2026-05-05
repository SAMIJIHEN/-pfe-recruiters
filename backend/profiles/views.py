# backend/profiles/views.py
# ═══════════════════════════════════════════════════════════════
# ✅ CORRECTION: Import correct de la fonction invite_talents_to_apply
# ═══════════════════════════════════════════════════════════════

import json
import datetime
import logging
import requests
from django.conf import settings
from rest_framework import status, viewsets
from rest_framework.decorators import api_view, action, permission_classes
from rest_framework.response import Response
from rest_framework.permissions import BasePermission, AllowAny
from django.db.models import Count

from .models import CandidateProfile, Notification, TalentPool
from .serializers import (
    CandidateProfileSerializer,
    NotificationSerializer,
    TalentPoolSerializer,
    AddToTalentPoolSerializer,
    InviteTalentsSerializer,
)

from .services.profile_service import get_or_create_profile_from_request, get_profile_by_clerk_id
from .services.upload_service import save_uploaded_file, update_profile_photo, update_profile_cv, ALLOWED_EXT
from .services.talent_pool_service import (
    add_candidate_to_talent_pool,
    remove_candidate_from_talent_pool,
    get_talent_pool_queryset,
    get_recommendations_for_offer,
)

# ✅ CORRECTION: Import de la fonction depuis le service, pas une récursion
from .services.invite_service import invite_talents_to_apply as invite_talents_service

from .utils.groq_client import cv_to_json_with_groq

# Import des modèles pour les statistiques publiques
from jobs.models import JobOffer
from applications.models import Application
from companies.models import RecruiterProfile

logger = logging.getLogger(__name__)


# ============================================================================
# PROFIL CANDIDAT
# ============================================================================

@api_view(["GET", "POST"])
def profile_view(request):
    print("\n" + "=" * 60)
    print("🔍 NOUVELLE REQUÊTE REÇUE DANS LE BACKEND")
    print(f"🕒 {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📌 Méthode HTTP: {request.method}")
    print(f"📍 URL: {request.build_absolute_uri()}")

    if request.method == "GET":
        clerk_user_id = request.headers.get("X-Clerk-User-Id")
        if not clerk_user_id:
            return Response({"error": "Informations utilisateur manquantes - ID requis"}, status=400)
        profile = get_profile_by_clerk_id(clerk_user_id)
        if not profile:
            return Response({"error": "Profil non trouvé"}, status=404)
        serializer = CandidateProfileSerializer(profile)
        return Response(serializer.data)

    # POST
    profile, created, error = get_or_create_profile_from_request(request)
    if error:
        return Response(error, status=status.HTTP_400_BAD_REQUEST if "requis" in error.get("error", "") else 500)
    serializer = CandidateProfileSerializer(profile)
    return Response(serializer.data, status=status.HTTP_201_CREATED if created else status.HTTP_200_OK)


@api_view(["POST"])
def upload_file(request, file_type):
    print("\n" + "=" * 60)
    print("📁 REQUÊTE D'UPLOAD DE FICHIER")
    print(f"🕒 {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")
    print(f"📌 Type de fichier: {file_type}")

    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    user_email = request.headers.get("X-User-Email")
    if not clerk_user_id:
        return Response({"error": "Utilisateur non identifié"}, status=400)

    if file_type not in ["photo", "cv"]:
        return Response({"error": "Type de fichier invalide"}, status=400)

    file = request.FILES.get(file_type)
    if not file:
        return Response({"error": "Aucun fichier fourni"}, status=400)

    try:
        saved_path = save_uploaded_file(file, file_type, clerk_user_id)
    except ValueError as e:
        return Response({"error": str(e)}, status=400)
    except Exception as e:
        logger.exception("Erreur sauvegarde fichier")
        return Response({"error": f"Erreur upload fichier: {str(e)}"}, status=500)

    print(f"📁 Fichier sauvegardé: {saved_path}")
    print(f"🔗 URL finale sera: /media/{saved_path}")

    profile, _ = CandidateProfile.objects.get_or_create(
        clerk_user_id=clerk_user_id,
        defaults={"email": user_email or f"{clerk_user_id}@temp.local"},
    )

    try:
        if file_type == "photo":
            update_profile_photo(profile, saved_path)
            response_data = {"url": profile.photo_url, "file_name": file.name}
        else:
            cv_structured = update_profile_cv(profile, saved_path, file.name)
            response_data = {
                "url": profile.cv_url,
                "file_name": file.name,
                "structured": cv_structured,
                "cv_parsed": cv_structured,
            }
        return Response(response_data, status=200)
    except Exception as e:
        logger.exception("Erreur mise à jour profil")
        return Response({"error": f"Erreur mise à jour profil: {str(e)}"}, status=500)


@api_view(["POST"])
def parse_cv(request):
    print("\n" + "=" * 60)
    print("🧠 REQUÊTE PARSE CV")
    print(f"🕒 {datetime.datetime.now().strftime('%Y-%m-%d %H:%M:%S')}")

    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    if not clerk_user_id:
        return Response({"error": "Utilisateur non identifié"}, status=400)

    profile = get_profile_by_clerk_id(clerk_user_id)
    if not profile:
        return Response({"error": "Profil non trouvé"}, status=404)

    if not profile.cv_text or len(profile.cv_text.strip()) < 40:
        return Response(
            {"error": "Aucun texte CV exploitable trouvé. Uploadez un CV d'abord."},
            status=400,
        )

    try:
        parsed = cv_to_json_with_groq(profile.cv_text)
        profile.cv_parsed = parsed
        profile.cv_parsed_at = datetime.datetime.now()
        profile.save(update_fields=["cv_parsed", "cv_parsed_at", "updated_at"])
        return Response({"success": True, "structured": parsed}, status=200)
    except Exception as e:
        logger.exception("Erreur parse_cv")
        return Response({"error": f"Erreur lors de l'analyse du CV: {str(e)}"}, status=500)


# ============================================================================
# GÉNÉRATION DE BIO SIMPLE PAR IA (SANS CV)
# ============================================================================

@api_view(["POST"])
def generate_simple_bio(request):
    """
    Génère une bio simple à partir du titre et des compétences (sans CV)
    Body: { "title": "...", "skills": [...], "experience": "...", "education": "..." }
    """
    try:
        data = json.loads(request.body)
        title = data.get("title", "")
        skills = data.get("skills", [])
        experience = data.get("experience", "")
        education = data.get("education", "")

        if not title and len(skills) == 0:
            return Response(
                {"error": "Veuillez renseigner au moins le titre ou une compétence"},
                status=status.HTTP_400_BAD_REQUEST
            )

        groq_api_key = getattr(settings, "GROQ_API_KEY", None)
        if not groq_api_key:
            return Response(
                {"error": "GROQ_API_KEY non configurée sur le serveur"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        skills_text = ", ".join(skills[:5]) if skills and len(skills) > 0 else "Non spécifiées"
        exp_text = experience if experience else "Non spécifiée"
        edu_text = education if education else "Non spécifiée"
        title_text = title if title else "Non spécifié"

        prompt = f"""Génère une courte présentation professionnelle (bio) pour un candidat.

Titre du poste : {title_text}
Compétences principales : {skills_text}
Expérience : {exp_text}
Formation : {edu_text}

RÈGLES :
- Rédige 2-3 phrases courtes (60-100 mots maximum)
- Style professionnel mais naturel
- Ne dépasse pas 400 caractères
- Commence par "Je suis..."
- Soit positif et engageant

Réponds UNIQUEMENT en JSON dans ce format : {{"bio": "La présentation générée ici..."}}"""

        response = requests.post(
            "https://api.groq.com/openai/v1/chat/completions",
            headers={
                "Authorization": f"Bearer {groq_api_key}",
                "Content-Type": "application/json",
            },
            json={
                "model": "llama-3.3-70b-versatile",
                "temperature": 0.6,
                "max_tokens": 500,
                "messages": [
                    {
                        "role": "system",
                        "content": "Tu es un assistant RH. Réponds UNIQUEMENT en JSON valide. Pas de texte avant ou après.",
                    },
                    {
                        "role": "user",
                        "content": prompt,
                    },
                ],
            },
            timeout=30,
        )

        if response.status_code != 200:
            logger.error(f"Erreur API Groq: {response.status_code}")
            return Response(
                {"error": f"Erreur API Groq: {response.status_code}"},
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

        data = response.json()
        raw_content = data.get("choices", [{}])[0].get("message", {}).get("content", "")

        cleaned = raw_content.replace("```json", "").replace("```", "").strip()
        start = cleaned.find("{")
        end = cleaned.rfind("}")
        if start != -1 and end != -1:
            cleaned = cleaned[start:end+1]

        result = json.loads(cleaned)
        bio = result.get("bio", "")

        if len(bio) > 400:
            bio = bio[:397] + "..."

        return Response({
            "success": True,
            "bio": bio
        }, status=status.HTTP_200_OK)

    except json.JSONDecodeError:
        return Response({"error": "JSON invalide"}, status=status.HTTP_400_BAD_REQUEST)
    except requests.exceptions.Timeout:
        logger.error("Timeout API Groq")
        return Response(
            {"error": "L'API IA a mis trop de temps à répondre. Veuillez réessayer."},
            status=status.HTTP_504_GATEWAY_TIMEOUT
        )
    except Exception as e:
        logger.error(f"Erreur generate_simple_bio: {str(e)}")
        return Response(
            {"error": f"Erreur lors de la génération: {str(e)}"},
            status=status.HTTP_500_INTERNAL_SERVER_ERROR
        )


# ============================================================================
# NOTIFICATIONS
# ============================================================================

class NotificationViewSet(viewsets.ModelViewSet):
    serializer_class = NotificationSerializer
    permission_classes = []

    def get_queryset(self):
        clerk_user_id = self.request.headers.get("X-Clerk-User-Id")
        if not clerk_user_id:
            return Notification.objects.none()
        try:
            candidate = CandidateProfile.objects.get(clerk_user_id=clerk_user_id)
            return Notification.objects.filter(recipient=candidate)
        except CandidateProfile.DoesNotExist:
            pass
        try:
            from companies.models import RecruiterProfile
            RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)
            return Notification.objects.none()
        except RecruiterProfile.DoesNotExist:
            pass
        return Notification.objects.none()

    @action(detail=True, methods=['patch'])
    def mark_as_read(self, request, pk=None):
        notification = self.get_object()
        notification.is_read = True
        notification.save()
        return Response({'status': 'read'})


# ============================================================================
# VIVIER DE TALENTS (TALENT POOL)
# ============================================================================

class IsRecruiterUser(BasePermission):
    def has_permission(self, request, view):
        clerk_id = request.headers.get("X-Clerk-User-Id")
        if not clerk_id:
            return False
        try:
            from companies.models import RecruiterProfile
            recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_id)
            request.recruiter = recruiter
            return True
        except Exception:
            return False


class TalentPoolViewSet(viewsets.ModelViewSet):
    serializer_class = TalentPoolSerializer
    permission_classes = [IsRecruiterUser]

    def get_queryset(self):
        if hasattr(self.request, 'recruiter') and self.request.recruiter:
            return get_talent_pool_queryset(self.request.recruiter)
        return TalentPool.objects.none()

    def get_serializer_context(self):
        context = super().get_serializer_context()
        context["request"] = self.request
        return context

    def create(self, request, *args, **kwargs):
        serializer = AddToTalentPoolSerializer(data=request.data)
        if not serializer.is_valid():
            return Response(serializer.errors, status=400)

        candidate_id = serializer.validated_data['candidate_id']
        reason = serializer.validated_data.get('reason', '')
        score = serializer.validated_data.get('score', 0)

        talent, error = add_candidate_to_talent_pool(request.recruiter, candidate_id, reason, score)
        if error:
            return Response({"error": error}, status=404)
        output_serializer = TalentPoolSerializer(talent, context={'request': request})
        return Response(output_serializer.data, status=201)

    @action(detail=False, methods=['delete'], url_path='remove')
    def remove_talent(self, request):
        candidate_id = request.data.get('candidate_id')
        if not candidate_id:
            return Response({"error": "candidate_id requis"}, status=400)
        success, error = remove_candidate_from_talent_pool(request.recruiter, candidate_id)
        if not success:
            return Response({"error": error}, status=404)
        return Response({"message": "Talent supprimé avec succès"}, status=200)

    @action(detail=False, methods=['get'], url_path='count')
    def count_talents(self, request):
        count = self.get_queryset().count()
        return Response({"count": count}, status=200)

    @action(detail=False, methods=['post'], url_path='recommend-for-offer')
    def recommend_for_offer(self, request):
        offer_title = request.data.get('title', '')
        offer_skills = request.data.get('skills_required', [])
        if not offer_title and not offer_skills:
            return Response(
                {"error": "Veuillez fournir le titre ou les compétences de l'offre"},
                status=400,
            )
        recommendations, error = get_recommendations_for_offer(
            request.recruiter, offer_title, offer_skills
        )
        if error:
            return Response({"recommendations": [], "message": error}, status=200)
        return Response({
            "recommendations": recommendations,
            "total": len(recommendations),
            "offer_title": offer_title,
            "offer_skills": offer_skills,
        }, status=200)


# ============================================================================
# INVITER DES TALENTS À POSTULER
# ============================================================================

@api_view(["POST"])
def invite_talents_to_apply(request):
    """Invite des talents à postuler à une offre d'emploi"""
    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    if not clerk_user_id:
        return Response({"error": "Non autorisé - X-Clerk-User-Id manquant"}, status=401)

    try:
        from companies.models import RecruiterProfile
        recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)
    except RecruiterProfile.DoesNotExist:
        return Response({"error": "Recruteur non trouvé"}, status=404)

    serializer = InviteTalentsSerializer(data=request.data)
    if not serializer.is_valid():
        return Response(serializer.errors, status=400)

    job_offer_id = serializer.validated_data['job_offer_id']
    talent_ids = serializer.validated_data.get('talent_ids', [])
    send_email = serializer.validated_data.get('send_email', True)

    # ✅ CORRECTION: Utiliser la fonction importée du service
    result, error = invite_talents_service(recruiter, job_offer_id, talent_ids, send_email)
    
    if error:
        return Response({"error": error}, status=404)

    return Response({"success": True, **result}, status=200)


# ============================================================================
# ENDPOINT PUBLIC POUR LES STATISTIQUES (PAGE D'ACCUEIL)
# ============================================================================

@api_view(["GET"])
@permission_classes([AllowAny])
def public_stats(request):
    """
    Endpoint public pour les statistiques de la plateforme
    Utilisé par les pages publiques (SolutionCandidats, SolutionRecruteurs, etc.)
    """
    try:
        # Nombre total d'offres actives
        total_offres_actives = JobOffer.objects.filter(status="active").count()
        
        # Nombre total de candidats inscrits
        total_candidats = CandidateProfile.objects.count()
        
        # Nombre total de candidatures
        total_candidatures = Application.objects.count()
        
        # Nombre TOTAL de recruteurs inscrits
        total_recruteurs = RecruiterProfile.objects.count()
        
        # Calcul du taux de satisfaction
        total_applications = Application.objects.count()
        total_accepted = Application.objects.filter(status="accepted").count()
        taux_satisfaction = round((total_accepted / total_applications) * 100) if total_applications > 0 else 95
        
        return Response({
            "total_offres": total_offres_actives,
            "total_candidats": total_candidats,
            "total_candidatures": total_candidatures,
            "total_recruteurs": total_recruteurs,
            "taux_satisfaction": taux_satisfaction,
        })
    except Exception as e:
        logger.error(f"Erreur public_stats: {str(e)}")
        return Response({
            "total_offres": 0,
            "total_candidats": 0,
            "total_candidatures": 0,
            "total_recruteurs": 0,
            "taux_satisfaction": 95,
        }, status=200)