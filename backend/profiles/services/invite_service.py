# backend/profiles/services/invite_service.py
import logging
from django.conf import settings
from django.core.mail import send_mail
from ..models import Notification, TalentPool
from applications.models import Application
from jobs.models import JobOffer
from companies.models import RecruiterProfile

logger = logging.getLogger(__name__)


def invite_talents_to_apply(recruiter, job_offer_id, talent_ids=None, send_email=True):
    try:
        job_offer = JobOffer.objects.get(id=job_offer_id, recruiter=recruiter)
    except JobOffer.DoesNotExist:
        return None, "Offre non trouvée ou non autorisée"

    if talent_ids:
        talents = TalentPool.objects.filter(recruiter=recruiter, id__in=talent_ids).select_related('candidate')
    else:
        talents = TalentPool.objects.filter(recruiter=recruiter).select_related('candidate')

    if not talents.exists():
        return None, "Aucun talent trouvé dans votre vivier"

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
    job_url = f"{frontend_url}/jobs/{job_offer_id}"

    invited_count = 0
    email_sent_count = 0
    results = []

    for talent in talents:
        candidate = talent.candidate
        already_applied = Application.objects.filter(job=job_offer, candidate=candidate).exists()
        if already_applied:
            results.append({
                "candidate_id": candidate.id,
                "candidate_name": candidate.full_name or candidate.email,
                "invited": False,
                "reason": "Déjà postulé"
            })
            continue

        invited_count += 1

        # Notification interne
        try:
            Notification.objects.create(
                recipient=candidate,
                title=f"Invitation à postuler - {job_offer.title}",
                message=f"Le recruteur {recruiter.company_name} vous invite à postuler à l'offre : {job_offer.title}. Cliquez pour plus de détails.",
                link=job_url
            )
        except Exception as e:
            logger.warning(f"Erreur création notification: {e}")

        # Email
        email_sent = False
        if send_email:
            try:
                subject = f"Invitation à postuler - {job_offer.title} chez {recruiter.company_name}"
                message = f"""
Bonjour {candidate.full_name or candidate.email},

Le recruteur {recruiter.company_name} a remarqué votre profil et vous invite à postuler à l'offre suivante :

📌 {job_offer.title}
📍 {job_offer.location or 'Localisation non spécifiée'}
📝 {job_offer.contract_type or 'Type de contrat non spécifié'}

👉 Consultez votre dashboard et postulez chez {recruiter.company_name}.

Cordialement,
L'équipe AJ Recruiters
"""
                send_mail(
                    subject=subject,
                    message=message,
                    from_email=settings.DEFAULT_FROM_EMAIL,
                    recipient_list=[candidate.email],
                    fail_silently=False
                )
                email_sent = True
                email_sent_count += 1
            except Exception as e:
                logger.warning(f"Erreur envoi email à {candidate.email}: {e}")

        results.append({
            "candidate_id": candidate.id,
            "candidate_name": candidate.full_name or candidate.email,
            "invited": True,
            "email_sent": email_sent
        })

    return {
        "job_offer_id": str(job_offer_id),
        "job_title": job_offer.title,
        "total_talents": talents.count(),
        "invited_count": invited_count,
        "email_sent_count": email_sent_count,
        "results": results
    }, None