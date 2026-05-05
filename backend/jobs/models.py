from django.db import models
from companies.models import RecruiterProfile
import uuid

class JobOffer(models.Model):
    CONTRACT_TYPES = [
        ('CDI', 'CDI'),
        ('CDD', 'CDD'),
        ('Interim', 'Intérim'),
        ('Stage', 'Stage'),
        ('Alternance', 'Alternance'),
        ('Freelance', 'Freelance'),
    ]
    
    EXPERIENCE_LEVELS = [
        ('0-1', 'Moins d\'un an'),
        ('1-3', '1 à 3 ans'),
        ('3-5', '3 à 5 ans'),
        ('5-10', '5 à 10 ans'),
        ('10+', 'Plus de 10 ans'),
    ]
    
    STATUS_CHOICES = [
        ('active', 'Active'),
        ('closed', 'Fermée'),
        ('draft', 'Brouillon'),
    ]
    
    # Références
    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)
    recruiter = models.ForeignKey(RecruiterProfile, on_delete=models.CASCADE, related_name='job_offers')
    
    # Informations de l'offre
    title = models.CharField(max_length=255)
    description = models.TextField()
    contract_type = models.CharField(max_length=20, choices=CONTRACT_TYPES)
    experience_level = models.CharField(max_length=10, choices=EXPERIENCE_LEVELS)
    education_level = models.CharField(max_length=50, blank=True)
    
    # Localisation
    location = models.CharField(max_length=255)
    remote_possible = models.BooleanField(default=False)
    
    # Compétences requises
    skills_required = models.JSONField(default=list)
    skills_preferred = models.JSONField(default=list, blank=True)
    
    # Rémunération
    salary_min = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_max = models.DecimalField(max_digits=10, decimal_places=2, null=True, blank=True)
    salary_visible = models.BooleanField(default=True)
    
    # Dates
    published_at = models.DateTimeField(null=True, blank=True)
    application_deadline = models.DateField(null=True, blank=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    # Statut
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='draft')
    views_count = models.IntegerField(default=0)
    applications_count = models.IntegerField(default=0)
    
    class Meta:
        db_table = 'job_offers'
        ordering = ['-created_at']
    
    def __str__(self):
        return self.title