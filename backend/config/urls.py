# backend/config/urls.py
# ═══════════════════════════════════════════════════════════════
# ✅ CONFIGURATION COMPLÈTE DES URLs
# ✅ AJOUT DE LA ROUTE /api/public/stats/
# ═══════════════════════════════════════════════════════════════

from django.contrib import admin
from django.urls import path, include
from rest_framework.routers import DefaultRouter
from django.conf import settings
from django.conf.urls.static import static

from companies.views import (
    register_recruiter, get_pending_recruiters, approve_recruiter,
    RecruiterProfileViewSet, get_recruiter_stats
)
from jobs.views import JobOfferViewSet
from profiles.views import (
    NotificationViewSet, 
    TalentPoolViewSet, 
    invite_talents_to_apply,
    generate_simple_bio,
    public_stats,  # ✅ AJOUT DE L'IMPORT
)
from applications.views import ApplicationViewSet

# Router principal
router = DefaultRouter()
router.register(r'recruiter-profile', RecruiterProfileViewSet, basename='recruiter-profile')
router.register(r'job-offers', JobOfferViewSet, basename='job-offers')
router.register(r'notifications', NotificationViewSet, basename='notification')
router.register(r'talent-pool', TalentPoolViewSet, basename='talent-pool')
router.register(r'applications', ApplicationViewSet, basename='applications')

urlpatterns = [
    path('admin/', admin.site.urls),
    
    # ============================================================
    # ✅ ROUTES ADMIN_USERS (Dashboard Admin)
    # ============================================================
    path('api/admin/', include('admin_users.urls')),
    
    # ============================================================
    # 🆕 ROUTE GÉNÉRATION BIO SIMPLE PAR IA
    # ============================================================
    path('api/profile/generate-simple-bio/', generate_simple_bio, name='generate-simple-bio'),
    
    # ============================================================
    # 🆕 ROUTE STATISTIQUES PUBLIQUES (POUR PAGE D'ACCUEIL)
    # ============================================================
    path('api/public/stats/', public_stats, name='public-stats'),
    
    # ============================================================
    # API endpoints (router)
    # ============================================================
    path('api/', include(router.urls)),

    # Recruiter registration
    path('api/recruiters/register/', register_recruiter, name='register-recruiter'),
    path('api/recruiters/pending/', get_pending_recruiters, name='pending-recruiters'),
    path('api/recruiters/<int:recruiter_id>/approve/', approve_recruiter, name='approve-recruiter'),
    path('api/recruiters/stats/', get_recruiter_stats, name='recruiter-stats'),

    # Include existing profile URLs
    path('api/', include('profiles.urls')),

    # Endpoint pour inviter des talents à postuler
    path('api/talents/invite/', invite_talents_to_apply, name='invite-talents-to-apply'),
]

if settings.DEBUG:
    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)