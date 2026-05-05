# backend/applications/views_interview.py
import logging
from datetime import datetime

from django.conf import settings
from django.core.mail import send_mail
from django.utils import timezone

from rest_framework import status
from rest_framework.response import Response

from .models import Application
from profiles.models import Notification

logger = logging.getLogger(__name__)


def schedule_interview(self, request, pk=None):
    """
    Programme un entretien pour un candidat.
    Reçoit : interview_date, interview_time, interview_link (optionnel)
    Met à jour le statut → "interview_scheduled"
    Envoie un email au candidat
    """
    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    if not clerk_user_id:
        return Response({"error": "Non autorisé"}, status=401)

    try:
        from companies.models import RecruiterProfile
        recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)
    except RecruiterProfile.DoesNotExist:
        return Response({"error": "Recruteur non trouvé"}, status=404)

    try:
        application = Application.objects.select_related(
            "job", "candidate", "job__recruiter"
        ).get(pk=pk)
    except Application.DoesNotExist:
        return Response({"error": "Candidature introuvable"}, status=404)

    if application.job.recruiter != recruiter:
        return Response({"error": "Accès refusé"}, status=403)

    interview_date = request.data.get("interview_date")
    interview_time = request.data.get("interview_time")
    interview_link = request.data.get("interview_link", "")
    interview_notes = request.data.get("interview_notes", "")

    if not interview_date or not interview_time:
        return Response({"error": "La date et l'heure de l'entretien sont requises"}, status=400)

    interview_datetime_str = f"{interview_date} {interview_time}"
    try:
        interview_datetime = datetime.strptime(interview_datetime_str, "%Y-%m-%d %H:%M")
    except ValueError:
        return Response({"error": "Format de date/heure invalide (YYYY-MM-DD HH:MM)"}, status=400)

    # Mise à jour de la candidature
    application.interview_date = interview_datetime
    application.interview_link = interview_link
    application.interview_notes = interview_notes
    application.interview_status = "scheduled"
    application.status = "programme_entretien"
    application.save()

    candidate = application.candidate
    job = application.job
    company_name = recruiter.company_name

    # Formatage de la date en français
    interview_date_formatted = interview_datetime.strftime("%A %d %B %Y à %H:%M")
    
    jours_fr = {
        "Monday": "Lundi", "Tuesday": "Mardi", "Wednesday": "Mercredi",
        "Thursday": "Jeudi", "Friday": "Vendredi", "Saturday": "Samedi", "Sunday": "Dimanche"
    }
    mois_fr = {
        "January": "janvier", "February": "février", "March": "mars",
        "April": "avril", "May": "mai", "June": "juin",
        "July": "juillet", "August": "août", "September": "septembre",
        "October": "octobre", "November": "novembre", "December": "décembre"
    }
    for en, fr in jours_fr.items():
        interview_date_formatted = interview_date_formatted.replace(en, fr)
    for en, fr in mois_fr.items():
        interview_date_formatted = interview_date_formatted.replace(en, fr)

    # ✅ EMAIL D'INVITATION
    subject = f"📅 Invitation à un entretien - {job.title} chez {company_name}"
    body = f"""
Bonjour {candidate.first_name} {candidate.last_name},

Félicitations ! Votre candidature pour le poste de {job.title} chez {company_name} a été retenue pour un entretien.

📅 Date et heure : {interview_date_formatted}
📍 Lien de visioconférence : {interview_link if interview_link else "Un lien vous sera communiqué ultérieurement"}

📝 Informations complémentaires :
{interview_notes if interview_notes else "Aucune information supplémentaire"}

Merci de confirmer votre disponibilité en répondant à cet email.

Cordialement,
L'équipe RH de {company_name}
"""

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            fail_silently=False
        )
        logger.info(f"Email d'invitation entretien envoyé à {candidate.email}")
    except Exception as e:
        logger.warning(f"Erreur envoi email entretien: {e}")

    # ✅ NOTIFICATION INTERNE
    try:
        Notification.objects.create(
            recipient=candidate,
            title="📅 Entretien programmé",
            message=f"Un entretien a été programmé pour le poste '{job.title}' le {interview_date_formatted}.",
            link=f"/dashboard?tab=interviews"
        )
    except Exception as e:
        logger.warning(f"Erreur création notification entretien: {e}")

    serializer = self.get_serializer(application)
    return Response({
        "success": True,
        "message": "Entretien programmé avec succès",
        "application": serializer.data
    }, status=200)


def accept_candidate(self, request, pk=None):
    """
    Accepte un candidat, envoie un email pour l'entretien
    et programme automatiquement l'entretien
    """
    clerk_user_id = request.headers.get("X-Clerk-User-Id")
    if not clerk_user_id:
        return Response({"error": "Non autorisé"}, status=401)

    try:
        from companies.models import RecruiterProfile
        recruiter = RecruiterProfile.objects.get(clerk_user_id=clerk_user_id)
    except RecruiterProfile.DoesNotExist:
        return Response({"error": "Recruteur non trouvé"}, status=404)

    try:
        application = Application.objects.select_related(
            "job", "candidate", "job__recruiter"
        ).get(pk=pk)
    except Application.DoesNotExist:
        return Response({"error": "Candidature introuvable"}, status=404)

    if application.job.recruiter != recruiter:
        return Response({"error": "Accès refusé"}, status=403)

    interview_date = request.data.get("interview_date")
    interview_time = request.data.get("interview_time")
    interview_link = request.data.get("interview_link", "")
    interview_notes = request.data.get("interview_notes", "")

    if not interview_date or not interview_time:
        return Response(
            {"error": "Veuillez sélectionner une date et une heure pour l'entretien"},
            status=400
        )

    interview_datetime_str = f"{interview_date} {interview_time}"
    try:
        interview_datetime = datetime.strptime(interview_datetime_str, "%Y-%m-%d %H:%M")
    except ValueError:
        return Response(
            {"error": "Format de date/heure invalide"},
            status=400
        )

    application.status = "programme_entretien"
    application.interview_date = interview_datetime
    application.interview_link = interview_link
    application.interview_notes = interview_notes
    application.interview_status = "scheduled"
    application.save()

    candidate = application.candidate
    job = application.job
    company_name = recruiter.company_name

    interview_date_formatted = interview_datetime.strftime("%A %d %B %Y à %H:%M")
    
    jours_fr = {
        "Monday": "Lundi", "Tuesday": "Mardi", "Wednesday": "Mercredi",
        "Thursday": "Jeudi", "Friday": "Vendredi", "Saturday": "Samedi", "Sunday": "Dimanche"
    }
    mois_fr = {
        "January": "janvier", "February": "février", "March": "mars",
        "April": "avril", "May": "mai", "June": "juin",
        "July": "juillet", "August": "août", "September": "septembre",
        "October": "octobre", "November": "novembre", "December": "décembre"
    }
    for en, fr in jours_fr.items():
        interview_date_formatted = interview_date_formatted.replace(en, fr)
    for en, fr in mois_fr.items():
        interview_date_formatted = interview_date_formatted.replace(en, fr)

    subject = f"🎉 Félicitations ! Entretien programmé - {job.title}"
    body = f"""
Bonjour {candidate.first_name} {candidate.last_name},

Félicitations ! Votre candidature pour le poste de **{job.title}** chez **{company_name}** a été retenue.

Nous vous invitons à un entretien pour faire plus ample connaissance.

📅 **Date et heure :** {interview_date_formatted}
📍 **Lien de visioconférence :** {interview_link if interview_link else "Un lien vous sera envoyé ultérieurement"}

📝 **Informations complémentaires :**
{interview_notes if interview_notes else "Aucune information supplémentaire"}

Merci de confirmer votre présence en répondant à cet email.

Cordialement,
L'équipe RH de {company_name}
"""

    try:
        send_mail(
            subject=subject,
            message=body,
            from_email=settings.DEFAULT_FROM_EMAIL,
            recipient_list=[candidate.email],
            fail_silently=False
        )
    except Exception as e:
        logger.warning(f"Erreur envoi email: {e}")

    try:
        Notification.objects.create(
            recipient=candidate,
            title="🎉 Candidature acceptée !",
            message=f"Votre candidature pour le poste '{job.title}' a été acceptée. Un entretien a été programmé.",
            link=f"/dashboard?tab=interviews"
        )
    except Exception as e:
        logger.warning(f"Erreur notification: {e}")

    serializer = self.get_serializer(application)
    return Response({
        "success": True,
        "message": "Candidat accepté et entretien programmé",
        "application": serializer.data
    }, status=200)