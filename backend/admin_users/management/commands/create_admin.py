# backend/admin_users/management/commands/create_admin.py
# ═══════════════════════════════════════════════════════════════
# ✅ COMMANDE POUR CRÉER LE COMPTE ADMIN UNIQUE
# Usage: python manage.py create_admin
# ═══════════════════════════════════════════════════════════════

from django.core.management.base import BaseCommand
from admin_users.models import AdminUser

class Command(BaseCommand):
    help = "Crée le compte administrateur unique"

    def add_arguments(self, parser):
        parser.add_argument(
            '--email',
            type=str,
            default='admin@ajrecruiters.com',
            help='Email de l\'administrateur'
        )
        parser.add_argument(
            '--password',
            type=str,
            default='Admin123!',
            help='Mot de passe de l\'administrateur'
        )

    def handle(self, *args, **options):
        email = options['email']
        password = options['password']

        admin, created = AdminUser.objects.get_or_create(
            email=email,
            defaults={"is_active": True}
        )

        if created:
            admin.set_password(password)
            admin.save()
            self.stdout.write(
                self.style.SUCCESS(f"✅ Compte admin créé : {email} / {password}")
            )
            self.stdout.write(self.style.WARNING(
                "⚠️ IMPORTANT : Changez le mot de passe après première connexion !"
            ))
        else:
            self.stdout.write(
                self.style.WARNING(f"ℹ️ Le compte admin existe déjà : {email}")
            )