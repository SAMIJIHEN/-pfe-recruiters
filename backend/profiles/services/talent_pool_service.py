# backend/profiles/services/talent_pool_service.py
import logging
from django.core.mail import send_mail
from django.conf import settings
from ..models import TalentPool, CandidateProfile, Notification
from applications.models import Application
from jobs.models import JobOffer
from companies.models import RecruiterProfile
from ..utils.groq_client import recommend_talents_for_offer

logger = logging.getLogger(__name__)


def add_candidate_to_talent_pool(recruiter, candidate_id, reason="", score=0):
    try:
        candidate = CandidateProfile.objects.get(id=candidate_id)
    except CandidateProfile.DoesNotExist:
        return None, "Candidat non trouvé"

    talent, created = TalentPool.objects.get_or_create(
        recruiter=recruiter,
        candidate=candidate,
        defaults={"reason": reason, "score": score}
    )
    if not created:
        talent.reason = reason
        talent.score = score
        talent.save()
    return talent, None


def remove_candidate_from_talent_pool(recruiter, candidate_id):
    try:
        talent = TalentPool.objects.get(recruiter=recruiter, candidate_id=candidate_id)
        talent.delete()
        return True, None
    except TalentPool.DoesNotExist:
        return False, "Talent non trouvé"


def get_talent_pool_queryset(recruiter):
    return TalentPool.objects.filter(recruiter=recruiter).select_related('candidate')


def get_recommendations_for_offer(recruiter, offer_title, offer_skills):
    talents = TalentPool.objects.filter(recruiter=recruiter).select_related('candidate')
    if not talents.exists():
        return [], "Aucun talent dans votre vivier"

    talents_list = []
    for talent in talents:
        candidate = talent.candidate
        talents_list.append({
            "id": talent.id,
            "candidate_id": candidate.id,
            "domain": talent.domain or "",
            "all_skills": candidate.skills or [],
            "years_experience": talent.years_experience,
            "candidate_name": candidate.full_name or candidate.email,
            "reason": talent.reason or ""
        })

    recommendations = recommend_talents_for_offer(offer_title, offer_skills, talents_list)
    enriched = []
    for rec in recommendations:
        talent_id = rec.get('talent_id')
        match_score = rec.get('match_score', 0)
        reason = rec.get('reason', '')
        talent_data = next((t for t in talents_list if t['id'] == talent_id), None)
        if talent_data:
            enriched.append({
                "talent_id": talent_id,
                "candidate_id": talent_data['candidate_id'],
                "candidate_name": talent_data['candidate_name'],
                "domain": talent_data['domain'],
                "skills": talent_data['all_skills'],
                "years_experience": talent_data['years_experience'],
                "match_score": match_score,
                "match_reason": reason,
                "added_reason": talent_data['reason']
            })
    enriched.sort(key=lambda x: x['match_score'], reverse=True)
    return enriched, None