# backend/jobs/services/offer_service.py
from django.utils import timezone
from companies.models import RecruiterProfile


def get_recruiter_from_request(request):
    """
    Récupère le recruteur à partir des headers.
    Priorité au clerk_user_id, puis fallback par email.
    """
    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    email = request.headers.get("X-User-Email")

    if clerk_user_id:
        recruiter = RecruiterProfile.objects.filter(clerk_user_id=clerk_user_id).first()
        if recruiter:
            return recruiter

    if email:
        return RecruiterProfile.objects.filter(email=email).first()

    return None


def publish_offer(offer):
    """Publie l'offre (statut active, published_at à maintenant)."""
    offer.status = "active"
    if not offer.published_at:
        offer.published_at = timezone.now()
    offer.save(update_fields=["status", "published_at", "updated_at"])
    return offer


def close_offer(offer):
    """Ferme l'offre (statut closed)."""
    offer.status = "closed"
    offer.save(update_fields=["status", "updated_at"])
    return offer


def increment_view_count(offer):
    """Incrémente le compteur de vues de l'offre."""
    offer.views_count += 1
    offer.save(update_fields=["views_count"])
    return offer.views_count