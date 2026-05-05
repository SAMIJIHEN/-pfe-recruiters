from rest_framework import serializers
from .models import JobOffer

class JobOfferSerializer(serializers.ModelSerializer):
    """
    Sérializer qui inclut le nom de l'entreprise
    """
    company_name = serializers.CharField(source='recruiter.company_name', read_only=True)
    company_logo = serializers.ImageField(source='recruiter.company_logo', read_only=True)
    
    class Meta:
        model = JobOffer
        fields = [
            'id', 'title', 'description', 'contract_type', 
            'experience_level', 'education_level', 'location',
            'remote_possible', 'skills_required', 'skills_preferred',
            'salary_min', 'salary_max', 'salary_visible',
            'published_at', 'application_deadline', 'created_at',
            'updated_at', 'status', 'views_count', 'applications_count',
            'company_name', 'company_logo', 'recruiter'
        ]
        read_only_fields = ['id', 'recruiter', 'created_at', 'updated_at', 'views_count', 'applications_count']