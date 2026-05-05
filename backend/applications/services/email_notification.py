# backend/applications/services/email_notification.py
import logging
from django.conf import settings
from django.core.mail import send_mail
from profiles.models import Notification

logger = logging.getLogger(__name__)

def send_test_invitation_email(candidate, job_title, company_name, candidate_name):
    subject = f"📝 Un test vous attend — {job_title} chez {company_name}"
    body = f"""Bonjour {candidate_name},

Un test technique vous attend pour le poste de {job_title}.

Connectez-vous à votre espace candidat pour le passer.

Cordialement,
L'équipe RH — {company_name}
"""
    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            fail_silently=False
        )
        logger.info(f"Email test envoyé à {candidate.email}")
    except Exception as e:
        logger.warning(f"Erreur envoi email test: {e}")


def create_notification(recipient, title, message, link=None):
    try:
        Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            link=link
        )
    except Exception as e:
        logger.warning(f"Erreur création notification: {e}")