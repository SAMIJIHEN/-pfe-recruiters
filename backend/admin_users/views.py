# backend/admin_users/views.py
# ═══════════════════════════════════════════════════════════════
# ✅ VUES API ADMIN - AVEC AUTHENTIFICATION PAR TOKEN
# ═══════════════════════════════════════════════════════════════

import json
import logging
from django.views.decorators.csrf import csrf_exempt
from django.views.decorators.http import require_http_methods
from django.http import JsonResponse
from django.core.mail import send_mail
from django.conf import settings

from .models import AdminUser
from companies.models import RecruiterProfile
from companies.services.email_service import send_approval_email

logger = logging.getLogger(__name__)


# ============================================================
# AUTHENTIFICATION ADMIN (PAR TOKEN)
# ============================================================

def get_token_from_request(request):
    """Récupère le token depuis le header Authorization"""
    auth_header = request.headers.get('Authorization', '')
    if auth_header.startswith('Bearer '):
        return auth_header[7:]
    return None


def is_admin_authenticated(request):
    """Vérifie si l'admin est authentifié via token"""
    token = get_token_from_request(request)
    if not token:
        return False, None
    
    try:
        admin = AdminUser.objects.get(auth_token=token, is_active=True)
        if admin.verify_token(token):
            return True, admin
    except AdminUser.DoesNotExist:
        pass
    return False, None


@csrf_exempt
@require_http_methods(["POST"])
def admin_login(request):
    """
    Connexion administrateur - retourne un token
    Body: { "email": "...", "password": "..." }
    """
    try:
        data = json.loads(request.body)
        email = data.get('email')
        password = data.get('password')

        if not email or not password:
            return JsonResponse({'error': 'Email et mot de passe requis'}, status=400)

        try:
            admin = AdminUser.objects.get(email=email, is_active=True)
        except AdminUser.DoesNotExist:
            return JsonResponse({'error': 'Identifiants invalides'}, status=401)

        if not admin.check_password(password):
            return JsonResponse({'error': 'Identifiants invalides'}, status=401)

        # Générer un nouveau token
        token = admin.generate_token()
        admin.update_last_login()

        return JsonResponse({
            'success': True,
            'message': 'Connexion réussie',
            'token': token,
            'admin': {'email': admin.email}
        })

    except json.JSONDecodeError:
        return JsonResponse({'error': 'JSON invalide'}, status=400)
    except Exception as e:
        logger.error(f"Erreur login admin: {str(e)}")
        return JsonResponse({'error': 'Erreur serveur'}, status=500)


@require_http_methods(["POST"])
def admin_logout(request):
    """Déconnexion administrateur - supprime le token"""
    token = get_token_from_request(request)
    if token:
        try:
            admin = AdminUser.objects.get(auth_token=token)
            admin.auth_token = None
            admin.token_expires_at = None
            admin.save()
        except AdminUser.DoesNotExist:
            pass
    return JsonResponse({'success': True, 'message': 'Déconnecté'})


@require_http_methods(["GET"])
def admin_check_auth(request):
    """Vérifie si l'admin est authentifié"""
    is_auth, admin = is_admin_authenticated(request)
    if is_auth and admin:
        return JsonResponse({
            'authenticated': True,
            'email': admin.email
        })
    return JsonResponse({'authenticated': False}, status=401)


# ============================================================
# GESTION DES RECRUTEURS (avec token)
# ============================================================

def require_admin_auth(view_func):
    """Décorateur pour vérifier l'authentification admin"""
    def wrapper(request, *args, **kwargs):
        is_auth, _ = is_admin_authenticated(request)
        if not is_auth:
            return JsonResponse({'error': 'Non autorisé'}, status=401)
        return view_func(request, *args, **kwargs)
    return wrapper


@require_http_methods(["GET"])
@require_admin_auth
def get_all_recruiters(request):
    """Récupère TOUS les recruteurs"""
    recruiters = RecruiterProfile.objects.all().order_by("-created_at")
    data = []
    for r in recruiters:
        data.append({
            'id': r.id,
            'first_name': r.first_name,
            'last_name': r.last_name,
            'email': r.email,
            'phone': r.phone,
            'position': r.position,
            'company_name': r.company_name,
            'company_size': r.get_company_size_display(),
            'sector': r.sector,
            'website': r.website,
            'status': r.status,
            'status_updated_at': r.status_updated_at.isoformat() if r.status_updated_at else None,
            'rejection_reason': r.rejection_reason,
            'created_at': r.created_at.isoformat(),
        })
    return JsonResponse({'success': True, 'count': len(data), 'recruiters': data})


@require_http_methods(["GET"])
@require_admin_auth
def get_pending_recruiters(request):
    """Récupère les recruteurs en attente"""
    recruiters = RecruiterProfile.objects.filter(status="pending").order_by("-created_at")
    data = []
    for r in recruiters:
        data.append({
            'id': r.id,
            'first_name': r.first_name,
            'last_name': r.last_name,
            'email': r.email,
            'phone': r.phone,
            'position': r.position,
            'company_name': r.company_name,
            'company_size': r.get_company_size_display(),
            'sector': r.sector,
            'website': r.website,
            'status': r.status,
            'created_at': r.created_at.isoformat(),
        })
    return JsonResponse({'success': True, 'count': len(data), 'recruiters': data})


@require_http_methods(["GET"])
@require_admin_auth
def get_approved_recruiters(request):
    """Récupère les recruteurs approuvés"""
    recruiters = RecruiterProfile.objects.filter(status="approved").order_by("-created_at")
    data = []
    for r in recruiters:
        data.append({
            'id': r.id,
            'first_name': r.first_name,
            'last_name': r.last_name,
            'email': r.email,
            'company_name': r.company_name,
            'position': r.position,
            'status_updated_at': r.status_updated_at.isoformat() if r.status_updated_at else None,
            'created_at': r.created_at.isoformat(),
        })
    return JsonResponse({'success': True, 'count': len(data), 'recruiters': data})


@require_http_methods(["GET"])
@require_admin_auth
def get_rejected_recruiters(request):
    """Récupère les recruteurs rejetés"""
    recruiters = RecruiterProfile.objects.filter(status="rejected").order_by("-created_at")
    data = []
    for r in recruiters:
        data.append({
            'id': r.id,
            'first_name': r.first_name,
            'last_name': r.last_name,
            'email': r.email,
            'company_name': r.company_name,
            'rejection_reason': r.rejection_reason,
            'status_updated_at': r.status_updated_at.isoformat() if r.status_updated_at else None,
            'created_at': r.created_at.isoformat(),
        })
    return JsonResponse({'success': True, 'count': len(data), 'recruiters': data})


@csrf_exempt
@require_http_methods(["POST"])
@require_admin_auth
def approve_recruiter(request, recruiter_id):
    """Approuve un recruteur"""
    try:
        recruiter = RecruiterProfile.objects.get(id=recruiter_id)
    except RecruiterProfile.DoesNotExist:
        return JsonResponse({'error': 'Recruteur non trouvé'}, status=404)

    try:
        data = json.loads(request.body) if request.body else {}
        force_email = data.get('force_email', False)
    except:
        force_email = False

    was_already_approved = recruiter.status == "approved"
    recruiter.status = "approved"
    recruiter.rejection_reason = None
    recruiter.save()

    email_sent = False
    if (not was_already_approved) or force_email:
        email_sent = send_approval_email(recruiter)

    message = "Compte approuvé avec succès"
    if was_already_approved and not force_email:
        message = "Compte déjà approuvé (email non renvoyé)"
    elif email_sent:
        message += " et email envoyé"

    return JsonResponse({
        'success': True,
        'message': message,
        'email_sent': email_sent,
        'recruiter': {'id': recruiter.id, 'company_name': recruiter.company_name, 'status': recruiter.status}
    })


@csrf_exempt
@require_http_methods(["POST"])
@require_admin_auth
def reject_recruiter(request, recruiter_id):
    """Rejette un recruteur"""
    try:
        recruiter = RecruiterProfile.objects.get(id=recruiter_id)
    except RecruiterProfile.DoesNotExist:
        return JsonResponse({'error': 'Recruteur non trouvé'}, status=404)

    try:
        data = json.loads(request.body)
        reason = data.get('reason', '')
    except:
        reason = ''

    recruiter.status = "rejected"
    recruiter.rejection_reason = reason
    recruiter.save()

    if reason:
        try:
            send_mail(
                subject="Votre demande de compte recruteur",
                message=f"Bonjour {recruiter.first_name},\n\nVotre demande de compte a été refusée.\n\nMotif : {reason}\n\nCordialement,\nL'équipe AJ Recruiters",
                from_email=settings.DEFAULT_FROM_EMAIL,
                recipient_list=[recruiter.email],
                fail_silently=True
            )
        except Exception as e:
            logger.warning(f"Erreur envoi email rejet: {e}")

    return JsonResponse({'success': True, 'message': 'Compte rejeté', 'recruiter': {'id': recruiter.id, 'company_name': recruiter.company_name, 'status': recruiter.status}})