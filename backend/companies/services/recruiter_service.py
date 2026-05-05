# backend/companies/services/recruiter_service.py
import logging
from django.db import models
from django.utils import timezone
from ..models import RecruiterProfile
from jobs.models import JobOffer
from jobs.serializers import JobOfferSerializer
from .validation_service import get_value

logger = logging.getLogger(__name__)


def register_or_update_recruiter(identity, data):
    """
    Crée ou met à jour un recruteur à partir des données d'identité et du body.
    Retourne (profile, created_flag, error_message)
    """
    clerk_user_id = identity["clerk_user_id"]
    email = identity["email"]
    first_name = identity["first_name"]
    last_name = identity["last_name"]

    if not email:
        return None, False, "Email requis"

    # Chercher un profil existant
    existing = None
    if clerk_user_id:
        existing = RecruiterProfile.objects.filter(clerk_user_id=clerk_user_id).first()
    if not existing:
        existing = RecruiterProfile.objects.filter(email=email).first()

    profile_data = {
        "email": email,
        "first_name": first_name,
        "last_name": last_name,
        "position": get_value(data, "position", "position"),
        "phone": get_value(data, "phone", "phone"),
        "company_name": get_value(data, "company_name", "companyName"),
        "company_size": get_value(data, "company_size", "companySize"),
        "sector": get_value(data, "sector", "sector"),
        "website": get_value(data, "website", "website"),
    }

    try:
        if existing:
            # Mise à jour du profil existant
            if clerk_user_id and existing.clerk_user_id != clerk_user_id:
                existing.clerk_user_id = clerk_user_id
            for field, value in profile_data.items():
                setattr(existing, field, value)
            if not existing.status:
                existing.status = "pending"
            existing.save()
            return existing, False, None
        else:
            # Création d'un nouveau profil
            create_data = {
                "clerk_user_id": clerk_user_id or "",
                "status": "pending",
                **profile_data,
            }
            profile = RecruiterProfile.objects.create(**create_data)
            return profile, True, None
    except Exception as e:
        logger.exception(f"Erreur enregistrement recruteur: {str(e)}")
        return None, False, str(e)


def get_recruiter_stats(profile):
    """
    Calcule les statistiques pour un recruteur donné.
    """
    total_offers = JobOffer.objects.filter(recruiter=profile).count()
    active_offers = JobOffer.objects.filter(recruiter=profile, status="active").count()
    total_applications = JobOffer.objects.filter(recruiter=profile).aggregate(
        total=models.Sum("applications_count")
    )["total"] or 0
    total_views = JobOffer.objects.filter(recruiter=profile).aggregate(
        total=models.Sum("views_count")
    )["total"] or 0
    recent_offers = JobOffer.objects.filter(recruiter=profile).order_by("-created_at")[:5]
    offers_serializer = JobOfferSerializer(recent_offers, many=True)

    return {
        "total_offers": total_offers,
        "active_offers": active_offers,
        "total_applications": total_applications,
        "total_views": total_views,
        "status": profile.status,
        "company_name": profile.company_name,
        "position": profile.position,
        "recent_offers": offers_serializer.data,
    }