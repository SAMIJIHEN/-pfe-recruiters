# backend/companies/services/email_service.py
import logging
from django.conf import settings
from django.core.mail import EmailMultiAlternatives

logger = logging.getLogger(__name__)


def send_approval_email(recruiter):
    """
    Envoie un email de confirmation au recruteur approuvé
    avec un bouton qui mène vers le dashboard recruteur.
    """
    if not recruiter:
        logger.error("Impossible d'envoyer l'email : recruteur manquant")
        return False

    recipient = (recruiter.email or "").strip()
    if not recipient:
        logger.error("Impossible d'envoyer l'email : email recruteur manquant")
        return False

    subject = "Votre compte recruteur a été approuvé !"

    frontend_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173").rstrip("/")
    dashboard_url = f"{frontend_url}/recruiter-dashboard"

    from_email = getattr(
        settings,
        "DEFAULT_FROM_EMAIL",
        getattr(settings, "EMAIL_HOST_USER", None),
    )

    logger.info(f"FRONTEND_URL utilisée: {frontend_url}")
    logger.info(f"Dashboard URL envoyée: {dashboard_url}")
    logger.info(f"Expéditeur utilisé: {from_email}")

    full_name = f"{recruiter.first_name} {recruiter.last_name}".strip()
    company_name = recruiter.company_name or "votre entreprise"

    text_message = f"""
Bonjour {full_name},

Félicitations ! Votre compte recruteur pour {company_name} a été officiellement approuvé.

Vous avez maintenant accès à votre espace recruteur où vous pourrez :
• Créer et gérer vos offres d'emploi
• Recevoir et traiter les candidatures
• Suivre les statistiques de vos annonces
• Gérer le profil de votre entreprise

Accédez directement à votre espace recruteur :
{dashboard_url}

Prochaines étapes :
1. Connectez-vous à votre compte
2. Complétez le profil de votre entreprise
3. Créez votre première offre d'emploi
4. Commencez à recevoir des candidatures

Cordialement,
L'équipe AJ Recruiters
""".strip()

    html_message = f"""
<!DOCTYPE html>
<html>
<head>
    <meta charset="utf-8">
    <title>Compte approuvé</title>
</head>
<body style="font-family: Arial, sans-serif; line-height: 1.6; color: #333; background: #f5f7f8; margin: 0; padding: 20px;">
    <div style="max-width: 600px; margin: 0 auto;">
        <div style="background: linear-gradient(135deg, #1F7A5A 0%, #0EA371 100%); color: white; padding: 30px; text-align: center; border-radius: 10px 10px 0 0;">
            <h1 style="margin: 0;">Compte approuvé !</h1>
            <p style="margin-top: 10px;">Bienvenue dans AJ Recruiters</p>
        </div>

        <div style="background: #ffffff; padding: 30px; border-radius: 0 0 10px 10px;">
            <h2>Bonjour {full_name},</h2>

            <p>
                <strong>Félicitations !</strong> Votre compte recruteur pour
                <strong>{company_name}</strong> a été officiellement approuvé.
            </p>

            <p>Vous avez maintenant accès à votre espace recruteur :</p>

            <ul>
                <li>Créer et gérer vos offres d'emploi</li>
                <li>Recevoir et traiter les candidatures</li>
                <li>Suivre les statistiques de vos annonces</li>
                <li>Gérer le profil de votre entreprise</li>
            </ul>

            <div style="text-align: center; margin: 30px 0;">
                <a href="{dashboard_url}" target="_blank" style="display:inline-block; padding:14px 28px; background:#16a34a; color:#ffffff; text-decoration:none; border-radius:12px; font-weight:700;">
                    ACCÉDER AU DASHBOARD RECRUTEUR
                </a>
            </div>

            <div style="background:#f8fafc; padding:20px; border-radius:8px; margin-top:20px;">
                <h3 style="margin-top:0;">Prochaines étapes :</h3>
                <ol>
                    <li>Connectez-vous à votre compte</li>
                    <li>Complétez le profil de votre entreprise</li>
                    <li>Créez votre première offre d'emploi</li>
                    <li>Commencez à recevoir des candidatures</li>
                </ol>
            </div>
        </div>

        <div style="text-align:center; margin-top:20px; font-size:12px; color:#666;">
            <p>© 2026 AJ Recruiters - Tous droits réservés</p>
            <p>Cet email a été envoyé automatiquement.</p>
        </div>
    </div>
</body>
</html>
""".strip()

    try:
        email = EmailMultiAlternatives(
            subject=subject,
            body=text_message,
            from_email=from_email,
            to=[recipient],
            reply_to=[from_email] if from_email else None,
        )
        email.attach_alternative(html_message, "text/html")

        sent_count = email.send(fail_silently=False)

        if sent_count == 1:
            logger.info(f"Email de confirmation envoyé avec succès à {recipient}")
            return True

        logger.warning(f"Aucun email envoyé à {recipient} (sent_count={sent_count})")
        return False

    except Exception as e:
        logger.exception(f"Erreur envoi email à {recipient}: {str(e)}")
        return False