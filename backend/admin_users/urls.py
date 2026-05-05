# backend/admin_users/urls.py
# ═══════════════════════════════════════════════════════════════
# ✅ ROUTES API ADMIN
# ═══════════════════════════════════════════════════════════════

from django.urls import path
from . import views

urlpatterns = [
    # Authentification
    path('login/', views.admin_login, name='admin_login'),
    path('logout/', views.admin_logout, name='admin_logout'),
    path('check-auth/', views.admin_check_auth, name='admin_check_auth'),
    
    # Recruteurs
    path('recruiters/all/', views.get_all_recruiters, name='admin_all_recruiters'),
    path('recruiters/pending/', views.get_pending_recruiters, name='admin_pending_recruiters'),
    path('recruiters/approved/', views.get_approved_recruiters, name='admin_approved_recruiters'),
    path('recruiters/rejected/', views.get_rejected_recruiters, name='admin_rejected_recruiters'),
    
    # Actions
    path('recruiters/<int:recruiter_id>/approve/', views.approve_recruiter, name='admin_approve_recruiter'),
    path('recruiters/<int:recruiter_id>/reject/', views.reject_recruiter, name='admin_reject_recruiter'),
]