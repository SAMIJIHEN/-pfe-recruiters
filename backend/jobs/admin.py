# backend/jobs/admin.py
from django.contrib import admin
from .models import JobOffer

@admin.register(JobOffer)
class JobOfferAdmin(admin.ModelAdmin):
    list_display = [
        'id', 
        'title', 
        'recruiter_company', 
        'contract_type', 
        'status', 
        'created_at',
        'views_count',
        'applications_count'
    ]
    list_filter = ['status', 'contract_type', 'remote_possible', 'created_at']
    search_fields = ['title', 'description', 'recruiter__company_name']
    readonly_fields = ['id', 'created_at', 'updated_at', 'views_count', 'applications_count']
    ordering = ['-created_at']
    
    def recruiter_company(self, obj):
        return obj.recruiter.company_name if obj.recruiter else "Non assigné"
    recruiter_company.short_description = "Entreprise"
    
    fieldsets = (
        ('Informations générales', {
            'fields': ('title', 'description', 'recruiter', 'status')
        }),
        ('Détails du contrat', {
            'fields': ('contract_type', 'experience_level', 'education_level', 'location', 'remote_possible')
        }),
        ('Compétences', {
            'fields': ('skills_required', 'skills_preferred'),
            'classes': ('wide',)
        }),
        ('Rémunération', {
            'fields': ('salary_min', 'salary_max', 'salary_visible')
        }),
        ('Dates', {
            'fields': ('published_at', 'application_deadline', 'created_at', 'updated_at')
        }),
        ('Statistiques', {
            'fields': ('views_count', 'applications_count')
        }),
    )