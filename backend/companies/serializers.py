from rest_framework import serializers
from .models import RecruiterProfile
from jobs.models import JobOffer

class RecruiterProfileSerializer(serializers.ModelSerializer):
    class Meta:
        model = RecruiterProfile
        fields = '__all__'
        read_only_fields = ['clerk_user_id', 'status', 'status_updated_at', 'created_at', 'updated_at']

class RecruiterProfileDetailSerializer(serializers.ModelSerializer):
    full_name = serializers.SerializerMethodField()
    
    class Meta:
        model = RecruiterProfile
        fields = '__all__'
    
    def get_full_name(self, obj):
        return f"{obj.first_name} {obj.last_name}"

class JobOfferSerializer(serializers.ModelSerializer):
    company_name = serializers.CharField(source='recruiter.company_name', read_only=True)
    company_logo = serializers.ImageField(source='recruiter.company_logo', read_only=True)
    
    class Meta:
        model = JobOffer
        fields = '__all__'
        read_only_fields = ['id', 'recruiter', 'created_at', 'updated_at', 'views_count', 'applications_count']