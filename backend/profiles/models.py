# backend/profiles/models.py
# ═══════════════════════════════════════════════════════════════
# MODÈLES COMPLETS POUR PROFILES
# Inclut CandidateProfile, Notification, TalentPool
# ✅ CORRECTION DÉFINITIVE: Suppression du double /media/ dans les URLs
# ═══════════════════════════════════════════════════════════════

import os
from django.db import models


def _clean_media_path(name: str) -> str:
    """
    Utilitaire interne : supprime tout préfixe /media/ ou media/
    pour ne garder que le chemin relatif (ex: "cvs/file.pdf").
    Protège contre les doubles /media/ quelle que soit l'origine.
    """
    name = name.lstrip('/')
    while name.startswith('media/'):
        name = name[len('media/'):]
    return name


def user_photo_path(instance, filename):
    """Génère un chemin unique pour les photos de profil"""
    _, ext = os.path.splitext(filename)
    ext = ext.lower() if ext else ""
    filename = f"photo_{instance.clerk_user_id}{ext}"
    return os.path.join("photos", filename)


def user_cv_path(instance, filename):
    """Génère un chemin unique pour les CV"""
    _, ext = os.path.splitext(filename)
    ext = ext.lower() if ext else ""
    filename = f"cv_{instance.clerk_user_id}{ext}"
    return os.path.join("cvs", filename)


class CandidateProfile(models.Model):
    """Profil candidat lié à Clerk"""

    clerk_user_id = models.CharField(max_length=255, unique=True, db_index=True)

    email = models.EmailField()
    first_name = models.CharField(max_length=100, blank=True)
    last_name = models.CharField(max_length=100, blank=True)

    phone = models.CharField(max_length=20, blank=True)
    location = models.CharField(max_length=100, blank=True)
    birth_date = models.DateField(null=True, blank=True)

    photo = models.ImageField(upload_to=user_photo_path, null=True, blank=True)
    cv = models.FileField(upload_to=user_cv_path, null=True, blank=True)
    cv_file_name = models.CharField(max_length=255, blank=True)
    cv_text = models.TextField(blank=True, null=True)

    # Champs pour stocker le parsing du CV
    cv_parsed = models.JSONField(null=True, blank=True)
    cv_parsed_at = models.DateTimeField(null=True, blank=True)

    title = models.CharField(max_length=200, blank=True)

    EXPERIENCE_CHOICES = [
        ("0-1", "Moins d'un an"),
        ("1-3", "1 à 3 ans"),
        ("3-5", "3 à 5 ans"),
        ("5-10", "5 à 10 ans"),
        ("10+", "Plus de 10 ans"),
    ]
    experience = models.CharField(max_length=10, choices=EXPERIENCE_CHOICES, blank=True)

    EDUCATION_CHOICES = [
        ("bac", "Baccalauréat"),
        ("bac+2", "Bac+2 (BTS, DUT)"),
        ("bac+3", "Bac+3 (Licence)"),
        ("bac+5", "Bac+5 (Master, Ingénieur)"),
        ("bac+8", "Bac+8 (Doctorat)"),
    ]
    education = models.CharField(max_length=10, choices=EDUCATION_CHOICES, blank=True)

    skills = models.JSONField(default=list, blank=True)

    bio = models.TextField(max_length=500, blank=True)

    linkedin = models.URLField(blank=True, null=True)
    github = models.URLField(blank=True, null=True)
    portfolio = models.URLField(blank=True, null=True)

    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        verbose_name = "Profil candidat"
        verbose_name_plural = "Profils candidats"

    def __str__(self):
        return f"Profil de {self.email}"

    def save(self, *args, **kwargs):
        if self.cv and not self.cv_file_name:
            try:
                self.cv_file_name = os.path.basename(self.cv.name)
            except Exception:
                pass
        super().save(*args, **kwargs)

    @property
    def completion_percentage(self):
        fields = [
            self.phone,
            self.location,
            self.title,
            self.experience,
            self.education,
            self.bio,
            self.skills,
        ]
        filled = sum(1 for field in fields if field)
        total = len(fields)
        return int((filled / total) * 100) if total > 0 else 0

    @property
    def full_name(self):
        return f"{self.first_name} {self.last_name}".strip()

    @property
    def cv_url(self):
        """
        Retourne l'URL complète du CV.
        ✅ CORRECTION: _clean_media_path() supprime tout préfixe media/ existant
        avant d'ajouter /media/ → impossible d'avoir /media/media/cvs/file.pdf
        """
        if self.cv and self.cv.name:
            clean = _clean_media_path(self.cv.name)
            return f"/media/{clean}"
        return None

    @property
    def photo_url(self):
        """
        Retourne l'URL complète de la photo.
        ✅ CORRECTION: même logique que cv_url
        """
        if self.photo and self.photo.name:
            clean = _clean_media_path(self.photo.name)
            return f"/media/{clean}"
        return None


class Notification(models.Model):
    """Notification interne pour les candidats (messagerie / alertes)"""

    recipient = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="notifications"
    )
    title = models.CharField(max_length=200)
    message = models.TextField()
    is_read = models.BooleanField(default=False)
    created_at = models.DateTimeField(auto_now_add=True)
    link = models.URLField(blank=True, null=True)

    class Meta:
        ordering = ["-created_at"]
        verbose_name = "Notification"
        verbose_name_plural = "Notifications"

    def __str__(self):
        return f"{self.title} - {self.recipient.email}"


class TalentPool(models.Model):
    """
    Candidats marqués comme "excellent CV" par l'IA.
    Stocke automatiquement les candidats riches (≥8 compétences, ≥3 ans expérience)
    """

    recruiter = models.ForeignKey(
        "companies.RecruiterProfile",
        on_delete=models.CASCADE,
        related_name="talent_pool"
    )
    candidate = models.ForeignKey(
        CandidateProfile,
        on_delete=models.CASCADE,
        related_name="talent_pool_entries"
    )
    domain = models.CharField(
        max_length=200, blank=True, null=True,
        help_text="Domaine principal du candidat (ex: Développeur Full Stack, Data Scientist)"
    )
    years_experience = models.IntegerField(
        default=0,
        help_text="Années d'expérience extraites du CV"
    )
    reason = models.TextField(
        blank=True, null=True,
        help_text="Pourquoi ce candidat a été ajouté au vivier ?"
    )
    score = models.IntegerField(
        default=0,
        help_text="Score de qualité du CV (0-100)"
    )
    added_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        db_table = "talent_pool"
        ordering = ["-score", "-added_at"]
        unique_together = ["recruiter", "candidate"]
        verbose_name = "Talent (vivier)"
        verbose_name_plural = "Talents (vivier)"

    def __str__(self):
        candidate_name = self.candidate.full_name or self.candidate.email
        return f"{candidate_name} - {self.domain or 'Domaine inconnu'} (score: {self.score})"
