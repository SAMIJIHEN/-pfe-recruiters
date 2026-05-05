from django.contrib import admin, messages
from .models import RecruiterProfile
from .views import send_approval_email

import logging

logger = logging.getLogger(__name__)


@admin.register(RecruiterProfile)
class RecruiterProfileAdmin(admin.ModelAdmin):
    list_display = ["company_name", "email", "status", "created_at"]
    list_filter = ["status", "company_size", "sector"]
    search_fields = ["company_name", "email", "first_name", "last_name"]
    actions = ["approve_recruiters", "resend_approval_emails", "reject_recruiters"]
    ordering = ("-created_at",)

    @admin.action(description="Approuver les recruteurs sélectionnés (avec email)")
    def approve_recruiters(self, request, queryset):
        """
        Approuve les recruteurs sélectionnés et envoie l'email.
        Si un recruteur est déjà approuvé, on renvoie quand même l'email.
        """
        approved_now = 0
        already_approved = 0
        emails_sent = 0
        email_failed = 0

        for recruiter in queryset:
            try:
                was_already_approved = recruiter.status == "approved"

                if was_already_approved:
                    already_approved += 1
                else:
                    recruiter.status = "approved"
                    recruiter.rejection_reason = None
                    recruiter.save()
                    approved_now += 1

                # On envoie / renvoie l'email dans tous les cas
                email_sent = send_approval_email(recruiter)

                if email_sent:
                    emails_sent += 1
                    logger.info(f"Email envoyé depuis admin à {recruiter.email}")
                else:
                    email_failed += 1
                    logger.warning(f"Echec envoi email depuis admin à {recruiter.email}")

            except Exception as e:
                email_failed += 1
                logger.exception(f"Erreur action approve_recruiters pour {recruiter.email}: {str(e)}")

        if approved_now > 0:
            self.message_user(
                request,
                f"{approved_now} recruteur(s) approuvé(s) avec succès.",
                level=messages.SUCCESS,
            )

        if already_approved > 0:
            self.message_user(
                request,
                f"{already_approved} recruteur(s) étaient déjà approuvés (email renvoyé).",
                level=messages.INFO,
            )

        if emails_sent > 0:
            self.message_user(
                request,
                f"{emails_sent} email(s) de confirmation envoyé(s).",
                level=messages.SUCCESS,
            )

        if email_failed > 0:
            self.message_user(
                request,
                f"{email_failed} email(s) n'ont pas pu être envoyés.",
                level=messages.WARNING,
            )

    @admin.action(description="Renvoyer l'email d'approbation")
    def resend_approval_emails(self, request, queryset):
        """
        Renvoie uniquement l'email d'approbation aux recruteurs sélectionnés.
        """
        emails_sent = 0
        email_failed = 0

        for recruiter in queryset:
            try:
                email_sent = send_approval_email(recruiter)
                if email_sent:
                    emails_sent += 1
                    logger.info(f"Email d'approbation renvoyé à {recruiter.email}")
                else:
                    email_failed += 1
                    logger.warning(f"Echec renvoi email à {recruiter.email}")
            except Exception as e:
                email_failed += 1
                logger.exception(f"Erreur resend_approval_emails pour {recruiter.email}: {str(e)}")

        if emails_sent > 0:
            self.message_user(
                request,
                f"{emails_sent} email(s) d'approbation renvoyé(s).",
                level=messages.SUCCESS,
            )

        if email_failed > 0:
            self.message_user(
                request,
                f"{email_failed} email(s) n'ont pas pu être renvoyés.",
                level=messages.WARNING,
            )

    @admin.action(description="Rejeter les recruteurs sélectionnés")
    def reject_recruiters(self, request, queryset):
        """
        Rejette les recruteurs sélectionnés.
        """
        updated = queryset.update(status="rejected")
        self.message_user(
            request,
            f"{updated} recruteur(s) rejeté(s).",
            level=messages.INFO,
        )

    def save_model(self, request, obj, form, change):
        """
        Si un recruteur passe manuellement de non-approuvé à approuvé
        depuis la page d'édition admin, envoyer l'email automatiquement.
        """
        old_status = None

        if change and obj.pk:
            try:
                old_obj = RecruiterProfile.objects.get(pk=obj.pk)
                old_status = old_obj.status
            except RecruiterProfile.DoesNotExist:
                old_status = None

        super().save_model(request, obj, form, change)

        if change and old_status != "approved" and obj.status == "approved":
            try:
                email_sent = send_approval_email(obj)
                if email_sent:
                    self.message_user(
                        request,
                        f"Email de confirmation envoyé à {obj.email}",
                        level=messages.SUCCESS,
                    )
                else:
                    self.message_user(
                        request,
                        f"{obj.company_name} approuvé mais échec d'envoi d'email.",
                        level=messages.WARNING,
                    )
            except Exception as e:
                logger.exception(f"Erreur save_model email pour {obj.email}: {str(e)}")
                self.message_user(
                    request,
                    f"{obj.company_name} approuvé mais erreur email : {str(e)}",
                    level=messages.WARNING,
                )