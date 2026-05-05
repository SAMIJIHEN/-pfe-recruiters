from django.contrib import admin
from .models import CandidateProfile, Notification, TalentPool


@admin.register(CandidateProfile)
class CandidateProfileAdmin(admin.ModelAdmin):
    # Colonnes affichées dans la liste
    list_display = (
        'id', 
        'email', 
        'first_name', 
        'last_name', 
        'phone', 
        'location',
        'title', 
        'experience', 
        'education',
        'completion_percentage',
        'created_at'
    )
    
    # Colonnes sur lesquelles on peut cliquer pour modifier
    list_display_links = ('id', 'email', 'first_name', 'last_name')
    
    # Filtres sur le côté droit
    list_filter = (
        'experience', 
        'education', 
        'created_at',
        'location'
    )
    
    # Champs recherchables
    search_fields = (
        'email', 
        'first_name', 
        'last_name', 
        'phone', 
        'title',
        'skills'
    )
    
    # Organisation des champs dans la page de détail
    fieldsets = (
        ('Informations Clerk', {
            'fields': ('clerk_user_id', 'email', 'first_name', 'last_name')
        }),
        ('Informations personnelles', {
            'fields': ('phone', 'location', 'birth_date')
        }),
        ('Fichiers', {
            'fields': ('photo', 'cv', 'cv_file_name')
        }),
        ('Parcours professionnel', {
            'fields': ('title', 'experience', 'education', 'skills')
        }),
        ('Présentation', {
            'fields': ('bio', 'linkedin', 'github', 'portfolio')
        }),
        ('Métadonnées', {
            'fields': ('created_at', 'updated_at'),
            'classes': ('collapse',)  # Section pliable
        }),
    )
    
    # Champs en lecture seule
    readonly_fields = ('clerk_user_id', 'created_at', 'updated_at')
    
    # Pagination
    list_per_page = 25
    
    # Ordre par défaut
    ordering = ('-created_at',)


@admin.register(Notification)
class NotificationAdmin(admin.ModelAdmin):
    list_display = ('title', 'recipient', 'is_read', 'created_at')
    list_filter = ('is_read', 'created_at')
    search_fields = ('title', 'message', 'recipient__email')
    readonly_fields = ('created_at',)
    fields = ('recipient', 'title', 'message', 'is_read', 'link', 'created_at')
    ordering = ('-created_at',)


# ============================================================
# ✅ NOUVEAU : ADMIN POUR LE VIVIER DE TALENTS (TALENT POOL)
# ============================================================
@admin.register(TalentPool)
class TalentPoolAdmin(admin.ModelAdmin):
    list_display = ('id', 'candidate_name', 'recruiter_company', 'score', 'added_at')
    list_filter = ('score', 'added_at', 'recruiter__company_name')
    search_fields = ('candidate__email', 'candidate__first_name', 'candidate__last_name', 'recruiter__company_name')
    readonly_fields = ('added_at',)
    ordering = ('-score', '-added_at')

    def candidate_name(self, obj):
        return obj.candidate.full_name or obj.candidate.email
    candidate_name.short_description = "Candidat"

    def recruiter_company(self, obj):
        return obj.recruiter.company_name
    recruiter_company.short_description = "Recruteur"

    fieldsets = (
        ('Informations', {
            'fields': ('recruiter', 'candidate', 'reason', 'score')
        }),
        ('Métadonnées', {
            'fields': ('added_at',),
            'classes': ('collapse',)
        }),
    )