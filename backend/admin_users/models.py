# backend/admin_users/models.py
# ═══════════════════════════════════════════════════════════════
# ✅ MODÈLE ADMIN USER - AVEC TOKEN D'AUTHENTIFICATION
# ═══════════════════════════════════════════════════════════════

from django.db import models
from django.contrib.auth.hashers import make_password, check_password
from django.utils import timezone
import secrets

class AdminUser(models.Model):
    """
    Compte administrateur unique (authentification par token)
    """
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=255)
    auth_token = models.CharField(max_length=100, blank=True, null=True)
    token_expires_at = models.DateTimeField(null=True, blank=True)
    is_active = models.BooleanField(default=True)
    created_at = models.DateTimeField(auto_now_add=True)
    last_login = models.DateTimeField(null=True, blank=True)

    class Meta:
        db_table = "admin_users"
        verbose_name = "Administrateur"
        verbose_name_plural = "Administrateurs"

    def __str__(self):
        return self.email

    def set_password(self, raw_password):
        """Hache le mot de passe avant stockage"""
        self.password = make_password(raw_password)

    def check_password(self, raw_password):
        """Vérifie le mot de passe"""
        return check_password(raw_password, self.password)

    def generate_token(self):
        """Génère un nouveau token d'authentification"""
        self.auth_token = secrets.token_urlsafe(32)
        self.token_expires_at = timezone.now() + timezone.timedelta(days=7)
        self.save()
        return self.auth_token

    def verify_token(self, token):
        """Vérifie si le token est valide"""
        if not self.auth_token or not self.token_expires_at:
            return False
        if self.auth_token != token:
            return False
        if timezone.now() > self.token_expires_at:
            return False
        return True

    def update_last_login(self):
        """Met à jour la date de dernière connexion"""
        self.last_login = timezone.now()
        self.save(update_fields=["last_login"])