# backend/jobs/services/recommendation_service.py
from django.utils import timezone
from applications.models import Application
from profiles.models import CandidateProfile


def recommend_candidates_by_skills(recruiter, skills):
    """
    Retourne la liste des candidats (non acceptés) ayant postulé aux offres du recruteur,
    triés par correspondance avec la liste de compétences fournie.
    """
    if not skills or not isinstance(skills, list):
        return []

    # IDs des candidats ayant postulé aux offres de ce recruteur (et non acceptés)
    candidate_ids = Application.objects.filter(
        job__recruiter=recruiter
    ).exclude(status="accepted").values_list("candidate_id", flat=True).distinct()

    candidates = CandidateProfile.objects.filter(id__in=candidate_ids)

    results = []
    skills_lower = [s.lower() for s in skills]

    for candidate in candidates:
        candidate_skills = [cs.lower() for cs in (candidate.skills or [])]
        if not candidate_skills:
            continue
        matched = sum(1 for s in skills_lower if s in candidate_skills)
        score = int((matched / len(skills_lower)) * 100) if skills_lower else 0
        if score > 0:
            results.append({
                "id": candidate.id,
                "full_name": candidate.full_name,
                "email": candidate.email,
                "phone": candidate.phone,
                "skills": candidate.skills,
                "title": candidate.title,
                "experience": candidate.experience,
                "education": candidate.education,
                "location": candidate.location,
                "bio": candidate.bio,
                "match_score": score
            })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results


def recommend_jobs_for_candidate(candidate, offers):
    """
    Calcule un score de matching entre le candidat et chaque offre active.
    Retourne la liste des offres avec leur score et les compétences matchées.
    """
    candidate_skills = [s.lower() for s in (candidate.skills or [])]
    candidate_title = (candidate.title or "").lower()
    candidate_experience = candidate.experience or ""

    recommendations = []

    for offer in offers:
        offer_skills = [s.lower() for s in (offer.skills_required or [])]
        offer_title = (offer.title or "").lower()

        match_score = 0
        matched_skills = []

        # 1. Correspondance des compétences (60% du score)
        if offer_skills:
            matched = sum(1 for s in offer_skills if s in candidate_skills)
            matched_skills = [s for s in offer_skills if s in candidate_skills]
            skill_score = (matched / len(offer_skills)) * 60
        else:
            skill_score = 30

        # 2. Correspondance du titre/domaine (25% du score)
        title_score = 0
        if candidate_title and offer_title:
            candidate_words = set(candidate_title.split())
            offer_words = set(offer_title.split())
            common = candidate_words.intersection(offer_words)
            if offer_words:
                title_score = (len(common) / len(offer_words)) * 25

        # 3. Bonus localisation (5% du score)
        location_bonus = 0
        if candidate.location and offer.location:
            if (candidate.location.lower() in offer.location.lower() or
                offer.location.lower() in candidate.location.lower()):
                location_bonus = 5

        # 4. Bonus télétravail (5% du score)
        remote_bonus = 5 if offer.remote_possible else 0

        # 5. Bonus expérience (5% du score)
        experience_bonus = 0
        if candidate_experience and offer.experience_level:
            exp_levels = {"0-1": 1, "1-3": 2, "3-5": 3, "5-10": 4, "10+": 5}
            candidate_exp_value = exp_levels.get(candidate_experience, 0)
            offer_exp_value = exp_levels.get(offer.experience_level, 0)
            if candidate_exp_value >= offer_exp_value:
                experience_bonus = 5

        match_score = skill_score + title_score + location_bonus + remote_bonus + experience_bonus
        match_score = min(100, int(round(match_score)))

        if match_score >= 15:
            recommendations.append({
                "id": str(offer.id),
                "title": offer.title,
                "description": offer.description,
                "contract_type": offer.contract_type,
                "experience_level": offer.experience_level,
                "location": offer.location,
                "remote_possible": offer.remote_possible,
                "skills_required": offer.skills_required,
                "salary_min": offer.salary_min,
                "salary_max": offer.salary_max,
                "company_name": offer.recruiter.company_name if offer.recruiter else "",
                "created_at": offer.created_at,
                "match_score": match_score,
                "matched_skills": matched_skills,
                "total_skills": len(offer_skills),
                "isNew": (timezone.now() - offer.created_at).days <= 7
            })

    recommendations.sort(key=lambda x: x["match_score"], reverse=True)
    return recommendations


def recommend_talents_for_offer(offer, talents):
    """
    Calcule un score de match entre chaque talent (candidat dans le vivier)
    et l'offre, basé sur les compétences requises.
    """
    offer_skills = [s.lower() for s in (offer.skills_required or [])]

    if not offer_skills:
        results = []
        for talent in talents:
            candidate = talent.candidate
            results.append({
                "talent_id": talent.id,
                "candidate_id": candidate.id,
                "full_name": candidate.full_name or candidate.email,
                "email": candidate.email,
                "phone": candidate.phone,
                "skills": candidate.skills or [],
                "title": candidate.title or "",
                "experience": candidate.experience or "",
                "education": candidate.education or "",
                "location": candidate.location or "",
                "bio": candidate.bio or "",
                "linkedin": candidate.linkedin or "",
                "github": candidate.github or "",
                "portfolio": candidate.portfolio or "",
                "cv_url": candidate.cv.url if candidate.cv else None,
                "photo": candidate.photo.url if candidate.photo else None,
                "match_score": 0,
                "talent_score": talent.score,
                "reason": talent.reason
            })
        return results

    results = []
    for talent in talents:
        candidate = talent.candidate
        candidate_skills = [s.lower() for s in (candidate.skills or [])]
        if not candidate_skills:
            match_score = 0
        else:
            matched = sum(1 for s in offer_skills if s in candidate_skills)
            match_score = int((matched / len(offer_skills)) * 100)

        results.append({
            "talent_id": talent.id,
            "candidate_id": candidate.id,
            "full_name": candidate.full_name or candidate.email,
            "email": candidate.email,
            "phone": candidate.phone,
            "skills": candidate.skills or [],
            "title": candidate.title or "",
            "experience": candidate.experience or "",
            "education": candidate.education or "",
            "location": candidate.location or "",
            "bio": candidate.bio or "",
            "linkedin": candidate.linkedin or "",
            "github": candidate.github or "",
            "portfolio": candidate.portfolio or "",
            "cv_url": candidate.cv.url if candidate.cv else None,
            "photo": candidate.photo.url if candidate.photo else None,
            "match_score": match_score,
            "talent_score": talent.score,
            "reason": talent.reason
        })

    results.sort(key=lambda x: x["match_score"], reverse=True)
    return results