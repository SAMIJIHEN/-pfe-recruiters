# backend/applications/services/notification_service.py
import logging
from profiles.models import Notification

logger = logging.getLogger(__name__)

def create_candidature_notification(recipient, title, message, link="/dashboard"):
    try:
        Notification.objects.create(
            recipient=recipient,
            title=title,
            message=message,
            link=link
        )
        logger.info(f"Notification créée pour {recipient.email}: {title}")
    except Exception as e:
        logger.warning(f"Erreur création notification: {e}")