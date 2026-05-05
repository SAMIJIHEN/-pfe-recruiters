# backend/profiles/services/upload_service.py
# ═══════════════════════════════════════════════════════════════
# ✅ CORRECTION DÉFINITIVE — Suppression du double /media/
# ═══════════════════════════════════════════════════════════════

import os
import uuid
import logging
import re
from django.core.files.storage import default_storage
from django.core.files.base import ContentFile
from django.utils import timezone
from ..models import CandidateProfile
from ..utils.cv_text import extract_cv_text
from ..utils.groq_client import cv_to_json_with_groq

logger = logging.getLogger(__name__)

ALLOWED_EXT = {
    "photo": {".png", ".jpg", ".jpeg", ".webp"},
    "cv": {".pdf", ".docx", ".txt", ".png", ".jpg", ".jpeg", ".webp"},
}


def _clean_storage_path(saved_path: str, folder: str) -> str:
    """
    Normalise le chemin retourné par default_storage.save().

    Certains backends (S3, stockage custom, etc.) peuvent retourner
    un chemin du type "media/cvs/file.pdf" ou "/media/cvs/file.pdf".
    Cette fonction garantit qu'on stocke TOUJOURS "cvs/file.pdf"
    (jamais de préfixe /media/).

    Exemples :
        "cvs/file.pdf"          → "cvs/file.pdf"         ✅
        "media/cvs/file.pdf"    → "cvs/file.pdf"         ✅
        "/media/cvs/file.pdf"   → "cvs/file.pdf"         ✅
        "cvs_2/file.pdf"        → "cvs/file.pdf"         ✅ (fallback basename)
    """
    # 1. Supprime les slash initiaux
    path = saved_path.lstrip('/')

    # 2. Supprime tous les préfixes "media/" répétés
    while path.startswith('media/'):
        path = path[len('media/'):]

    # 3. Si le chemin ne commence pas par le bon dossier (cas rare),
    #    on reconstruit à partir du nom de fichier uniquement
    if not path.startswith(folder + '/'):
        path = f"{folder}/{os.path.basename(path)}"

    return path


def save_uploaded_file(file, file_type, clerk_user_id):
    """
    Sauvegarde un fichier (photo ou CV).
    Retourne un chemin relatif COMMENÇANT PAR "cvs/" ou "photos/"
    — jamais de préfixe /media/.
    """
    _, ext = os.path.splitext(file.name)
    ext = (ext or "").lower()

    if ext and ext not in ALLOWED_EXT[file_type]:
        raise ValueError(f"Extension non autorisée: {ext}")

    # Nettoie le nom du fichier
    safe_name = re.sub(r'[^a-zA-Z0-9._-]', '_', file.name.replace(ext, ''))
    unique_filename = f"{clerk_user_id}_{file_type}_{safe_name}{ext}"

    # Détermine le dossier
    folder = "photos" if file_type == "photo" else "cvs"
    rel_path = os.path.join(folder, unique_filename)

    # Sauvegarde avec Django storage
    raw_path = default_storage.save(rel_path, ContentFile(file.read()))

    # ✅ Nettoyage robuste : garantit un chemin du type "cvs/xxx.pdf"
    saved_path = _clean_storage_path(raw_path, folder)

    print(f"📁 [save_uploaded_file] raw={raw_path!r}  →  clean={saved_path!r}")
    return saved_path


def update_profile_photo(profile, saved_path):
    """Met à jour la photo de profil"""
    if profile.photo and profile.photo.name:
        try:
            default_storage.delete(profile.photo.name)
        except Exception as e:
            logger.warning(f"Suppression ancienne photo impossible: {str(e)}")

    # ✅ Stocke uniquement le chemin relatif (ex: "photos/xxx.jpg")
    profile.photo.name = saved_path
    profile.save(update_fields=["photo", "updated_at"])
    print(f"📸 Photo mise à jour: {saved_path}")


def update_profile_cv(profile, saved_path, original_filename):
    """
    Met à jour le CV du profil.
    ✅ Stocke uniquement le chemin relatif (ex: "cvs/xxx.pdf")
    """
    if profile.cv and profile.cv.name:
        try:
            default_storage.delete(profile.cv.name)
        except Exception as e:
            logger.warning(f"Suppression ancien CV impossible: {str(e)}")

    # ✅ Stocke uniquement le chemin relatif (ex: "cvs/xxx.pdf")
    profile.cv.name = saved_path
    profile.cv_file_name = original_filename
    print(f"📄 CV mis à jour: {saved_path}")

    # ── Extraction du texte du CV ─────────────────────────────
    cv_text = ""
    tmp_path = None
    try:
        abs_path = default_storage.path(saved_path)
        cv_text = extract_cv_text(abs_path) or ""
        print(f"📝 Texte CV extrait: {len(cv_text)} caractères")
    except Exception as e:
        logger.warning(f"default_storage.path indisponible: {str(e)}")
        try:
            tmp_name = f"tmp_{uuid.uuid4().hex}{os.path.splitext(original_filename)[1]}"
            tmp_path = os.path.join(os.getcwd(), tmp_name)
            with default_storage.open(saved_path, "rb") as f:
                with open(tmp_path, "wb") as out:
                    out.write(f.read())
            cv_text = extract_cv_text(tmp_path) or ""
        except Exception as e2:
            logger.error(f"Fallback extraction échoué: {str(e2)}")
            cv_text = ""
        finally:
            if tmp_path and os.path.exists(tmp_path):
                try:
                    os.remove(tmp_path)
                except Exception:
                    pass

    profile.cv_text = cv_text

    # ── Analyse Groq ──────────────────────────────────────────
    cv_structured = None
    try:
        if cv_text and len(cv_text) >= 40:
            cv_structured = cv_to_json_with_groq(cv_text)
            print("🤖 Analyse Groq terminée")
        else:
            cv_structured = {"error": "cv_text too short"}
    except Exception as e:
        logger.warning(f"Groq parsing error: {str(e)}")
        cv_structured = {"error": f"Groq parsing failed: {str(e)}"}

    profile.cv_parsed = cv_structured
    profile.cv_parsed_at = timezone.now()

    profile.save(
        update_fields=[
            "cv", "cv_file_name", "cv_text", "cv_parsed", "cv_parsed_at", "updated_at"
        ]
    )
    return cv_structured
