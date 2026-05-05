# backend/profiles/services/profile_service.py
import logging
from ..models import CandidateProfile
from ..serializers import CandidateProfileSerializer

logger = logging.getLogger(__name__)


def get_or_create_profile_from_request(request):
    """
    Récupère ou crée un profil candidat à partir des headers Clerk.
    Retourne (profile, created, error_response).
    """
    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    user_email = request.headers.get("X-User-Email")
    user_firstname = request.headers.get("X-User-Firstname", "")
    user_lastname = request.headers.get("X-User-Lastname", "")

    if not clerk_user_id:
        return None, None, {"error": "Informations utilisateur manquantes - ID requis"}

    if request.method == "POST" and not user_email:
        return None, None, {"error": "Informations utilisateur manquantes - Email requis"}

    profile_data = {
        "clerk_user_id": clerk_user_id,
        "email": user_email,
        "first_name": user_firstname,
        "last_name": user_lastname,
        **request.data,
    }

    try:
        profile, created = CandidateProfile.objects.update_or_create(
            clerk_user_id=clerk_user_id, defaults=profile_data
        )
        return profile, created, None
    except Exception as e:
        logger.exception(f"Erreur sauvegarde profil: {str(e)}")
        return None, None, {"error": f"Erreur de sauvegarde: {str(e)}"}


def get_profile_by_clerk_id(clerk_user_id):
    try:
        return CandidateProfile.objects.get(clerk_user_id=clerk_user_id)
    except CandidateProfile.DoesNotExist:
        return None