# backend/profiles/serializers.py
# ═══════════════════════════════════════════════════════════════
# ✅ VERSION COMPLÈTE CORRIGÉE
# ✅ CORRECTION : Utilise les propriétés cv_url et photo_url du modèle
# ✅ TOUTES LES FONCTIONNALITÉS CONSERVÉES
# ═══════════════════════════════════════════════════════════════

from rest_framework import serializers
from .models import CandidateProfile, Notification, TalentPool


class CandidateProfileSerializer(serializers.ModelSerializer):
    """Sérializer pour les profils candidats"""
    
    full_name = serializers.ReadOnlyField()
    completion_percentage = serializers.ReadOnlyField()
    # ✅ NOUVEAU: Utilise les propriétés du modèle pour éviter les doubles /media/
    photo = serializers.SerializerMethodField()
    cv = serializers.SerializerMethodField()
    
    class Meta:
        model = CandidateProfile
        fields = [
            'id', 'clerk_user_id', 'email', 'first_name', 'last_name', 'full_name',
            'phone', 'location', 'birth_date',
            'photo', 'cv', 'cv_file_name',
            'title', 'experience', 'education',
            'skills', 'bio',
            'linkedin', 'github', 'portfolio',
            'completion_percentage',
            'created_at', 'updated_at'
        ]
        read_only_fields = ['id', 'clerk_user_id', 'created_at', 'updated_at']
    
    def get_photo(self, obj):
        """Retourne l'URL complète de la photo sans double /media/"""
        return obj.photo_url
    
    def get_cv(self, obj):
        """Retourne l'URL complète du CV sans double /media/"""
        return obj.cv_url


class CandidateProfileUpdateSerializer(serializers.ModelSerializer):
    """Sérializer pour la mise à jour (sans champs read_only)"""
    
    class Meta:
        model = CandidateProfile
        fields = [
            'phone', 'location', 'birth_date',
            'photo', 'cv', 'cv_file_name',
            'title', 'experience', 'education',
            'skills', 'bio',
            'linkedin', 'github', 'portfolio'
        ]


class NotificationSerializer(serializers.ModelSerializer):
    """Sérializer pour les notifications internes"""
    
    class Meta:
        model = Notification
        fields = ['id', 'title', 'message', 'is_read', 'created_at', 'link']
        read_only_fields = ['id', 'created_at']


# ============================================================
# ✅ SÉRIALIZER POUR LE VIVIER DE TALENTS (TALENT POOL)
# ============================================================
class TalentPoolSerializer(serializers.ModelSerializer):
    """Sérializer pour le vivier de talents"""
    
    candidate_name = serializers.SerializerMethodField()
    candidate_email = serializers.SerializerMethodField()
    candidate_title = serializers.SerializerMethodField()
    candidate_skills = serializers.SerializerMethodField()
    candidate_photo = serializers.SerializerMethodField()
    candidate_location = serializers.SerializerMethodField()
    candidate_experience = serializers.SerializerMethodField()
    candidate_education = serializers.SerializerMethodField()
    candidate_bio = serializers.SerializerMethodField()
    candidate_linkedin = serializers.SerializerMethodField()
    candidate_github = serializers.SerializerMethodField()
    candidate_portfolio = serializers.SerializerMethodField()
    candidate_cv_url = serializers.SerializerMethodField()
    recruiter_company = serializers.SerializerMethodField()
    
    class Meta:
        model = TalentPool
        fields = [
            'id', 'recruiter', 'candidate', 'reason', 'score', 'added_at',
            'candidate_name', 'candidate_email', 'candidate_title', 'candidate_skills',
            'candidate_photo', 'candidate_location', 'candidate_experience',
            'candidate_education', 'candidate_bio', 'candidate_linkedin',
            'candidate_github', 'candidate_portfolio', 'candidate_cv_url',
            'recruiter_company'
        ]
        read_only_fields = ['id', 'added_at']
    
    def get_candidate_name(self, obj):
        return obj.candidate.full_name or obj.candidate.email
    
    def get_candidate_email(self, obj):
        return obj.candidate.email
    
    def get_candidate_title(self, obj):
        return obj.candidate.title or ""
    
    def get_candidate_skills(self, obj):
        return obj.candidate.skills or []
    
    def get_candidate_photo(self, obj):
        """Utilise la propriété photo_url du modèle"""
        return obj.candidate.photo_url
    
    def get_candidate_location(self, obj):
        return obj.candidate.location or ""
    
    def get_candidate_experience(self, obj):
        return obj.candidate.experience or ""
    
    def get_candidate_education(self, obj):
        return obj.candidate.education or ""
    
    def get_candidate_bio(self, obj):
        return obj.candidate.bio or ""
    
    def get_candidate_linkedin(self, obj):
        return obj.candidate.linkedin or ""
    
    def get_candidate_github(self, obj):
        return obj.candidate.github or ""
    
    def get_candidate_portfolio(self, obj):
        return obj.candidate.portfolio or ""
    
    # ✅ CORRECTION SIMPLIFIÉE - Utilise la propriété cv_url du modèle
    def get_candidate_cv_url(self, obj):
        """Retourne l'URL propre du CV"""
        return obj.candidate.cv_url
    
    def get_recruiter_company(self, obj):
        return obj.recruiter.company_name


class AddToTalentPoolSerializer(serializers.Serializer):
    """Sérializer pour ajouter un candidat au vivier de talents"""
    candidate_id = serializers.IntegerField()
    reason = serializers.CharField(required=False, allow_blank=True)
    score = serializers.IntegerField(required=False, min_value=0, max_value=100, default=0)


class InviteTalentsSerializer(serializers.Serializer):
    """Sérializer pour inviter des talents à postuler à une offre"""
    talent_ids = serializers.ListField(
        child=serializers.IntegerField(),
        required=False,
        help_text="IDs des talents à inviter (laissez vide pour inviter tous les talents)"
    )
    job_offer_id = serializers.CharField(required=True, help_text="ID de l'offre d'emploi")
    send_email = serializers.BooleanField(default=True, help_text="Envoyer un email aux talents")