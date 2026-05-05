from django.db import models

class RecruiterProfile(models.Model):
    STATUS_CHOICES = [
        ('pending', 'En attente'),
        ('approved', 'Approuvé'),
        ('rejected', 'Rejeté'),
    ]
    
    COMPANY_SIZE_CHOICES = [
        ('1-10', '1-10 employés'),
        ('11-50', '11-50 employés'),
        ('51-200', '51-200 employés'),
        ('201-500', '201-500 employés'),
        ('500+', '500+ employés'),
    ]
    
    # Liaison avec Clerk
    clerk_user_id = models.CharField(max_length=255, unique=True)
    email = models.EmailField()
    
    # Informations personnelles du recruteur
    first_name = models.CharField(max_length=100)
    last_name = models.CharField(max_length=100)
    position = models.CharField(max_length=200)
    phone = models.CharField(max_length=20)
    
    # Informations entreprise
    company_name = models.CharField(max_length=255)
    company_size = models.CharField(max_length=20, choices=COMPANY_SIZE_CHOICES)
    sector = models.CharField(max_length=200)
    website = models.URLField(blank=True, null=True)
    company_description = models.TextField(blank=True, null=True)
    company_logo = models.ImageField(upload_to='company_logos/', blank=True, null=True)
    company_address = models.TextField(blank=True, null=True)
    
    # Statut du compte
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default='pending')
    status_updated_at = models.DateTimeField(auto_now=True)
    rejection_reason = models.TextField(blank=True, null=True)
    
    # Métadonnées
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)
    
    class Meta:
        db_table = 'recruiter_profiles'
        ordering = ['-created_at']
    
    def __str__(self):
        return f"{self.company_name} - {self.email}"