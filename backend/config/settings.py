# backend/config/settings.py
# ═══════════════════════════════════════════════════════════════
# ✅ CONFIGURATION DJANGO COMPLÈTE
# ✅ AJOUT : GROQ_API_KEY dans settings
# ✅ MODIFIÉ POUR RAILWAY (PostgreSQL, WhiteNoise)
# ═══════════════════════════════════════════════════════════════

"""
Django settings for config project.
"""

from pathlib import Path
import os
import dj_database_url


# Build paths inside the project like this: BASE_DIR / 'subdir'.
BASE_DIR = Path(__file__).resolve().parent.parent


# ============================================================================
# CONFIGURATION GÉNÉRALE
# ============================================================================
SECRET_KEY = os.getenv("DJANGO_SECRET_KEY", "django-insecure-votre-cle-secrete-ici")

DEBUG = os.getenv("DEBUG", "True") == "True"

ALLOWED_HOSTS = ['*']


# ============================================================================
# APPLICATIONS INSTALLÉES
# ============================================================================
INSTALLED_APPS = [
    "django.contrib.admin",
    "django.contrib.auth",
    "django.contrib.contenttypes",
    "django.contrib.sessions",
    "django.contrib.messages",
    "django.contrib.staticfiles",

    # Packages tiers
    "corsheaders",
    "rest_framework",

    # Applications du projet
    "admin_users",
    "profiles",
    "companies",
    "jobs",
    "applications",
]


# ============================================================================
# MIDDLEWARE
# ============================================================================
MIDDLEWARE = [
    "corsheaders.middleware.CorsMiddleware",
    "django.middleware.security.SecurityMiddleware",
    "whitenoise.middleware.WhiteNoiseMiddleware",  # ✅ AJOUTÉ POUR RAILWAY
    "django.contrib.sessions.middleware.SessionMiddleware",
    # "django.middleware.csrf.CsrfViewMiddleware",  # COMMENTÉ TEMPORAIREMENT POUR DÉBOGAGE
    "django.middleware.common.CommonMiddleware",
    "django.contrib.auth.middleware.AuthenticationMiddleware",
    "django.contrib.messages.middleware.MessageMiddleware",
    "django.middleware.clickjacking.XFrameOptionsMiddleware",
]

ROOT_URLCONF = "config.urls"


# ============================================================================
# TEMPLATES
# ============================================================================
TEMPLATES = [
    {
        "BACKEND": "django.template.backends.django.DjangoTemplates",
        "DIRS": [
            BASE_DIR / "templates",
        ],
        "APP_DIRS": True,
        "OPTIONS": {
            "context_processors": [
                "django.template.context_processors.debug",
                "django.template.context_processors.request",
                "django.contrib.auth.context_processors.auth",
                "django.contrib.messages.context_processors.messages",
            ],
        },
    },
]

WSGI_APPLICATION = "config.wsgi.application"


# ============================================================================
# BASE DE DONNÉES
# ============================================================================
# ✅ MODIFIÉ POUR RAILWAY (utilisation de DATABASE_URL ou fallback SQLite)
DATABASES = {
    'default': dj_database_url.config(default='sqlite:///db.sqlite3', conn_max_age=600)
}


# ============================================================================
# VALIDATION DES MOTS DE PASSE
# ============================================================================
AUTH_PASSWORD_VALIDATORS = [
    {
        "NAME": "django.contrib.auth.password_validation.UserAttributeSimilarityValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.MinimumLengthValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.CommonPasswordValidator",
    },
    {
        "NAME": "django.contrib.auth.password_validation.NumericPasswordValidator",
    },
]


# ============================================================================
# INTERNATIONALISATION
# ============================================================================
LANGUAGE_CODE = "fr-fr"
TIME_ZONE = "Africa/Tunis"
USE_I18N = True
USE_TZ = True


# ============================================================================
# FICHIERS STATIQUES
# ============================================================================
STATIC_URL = "/static/"
STATIC_ROOT = BASE_DIR / "staticfiles"

# ✅ AJOUTÉ POUR RAILWAY (servir les fichiers statiques avec compression)
STATICFILES_STORAGE = 'whitenoise.storage.CompressedManifestStaticFilesStorage'

# STATICFILES_DIRS = [BASE_DIR / "static"]


# ============================================================================
# FICHIERS MEDIA
# ============================================================================
MEDIA_URL = '/media/'
MEDIA_ROOT = BASE_DIR / 'media'


# ============================================================================
# CLÉ PRIMAIRE PAR DÉFAUT
# ============================================================================
DEFAULT_AUTO_FIELD = "django.db.models.BigAutoField"


# ============================================================================
# CONFIGURATION CORS / CSRF
# ============================================================================
CORS_ALLOWED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

CSRF_TRUSTED_ORIGINS = [
    "http://localhost:3000",
    "http://localhost:5173",
    "http://localhost:5174",
    "http://127.0.0.1:3000",
    "http://127.0.0.1:5173",
    "http://127.0.0.1:5174",
]

CORS_ALLOW_CREDENTIALS = True

CORS_ALLOW_METHODS = [
    "DELETE",
    "GET",
    "OPTIONS",
    "PATCH",
    "POST",
    "PUT",
]

CORS_ALLOW_HEADERS = [
    "accept",
    "accept-encoding",
    "authorization",
    "content-type",
    "dnt",
    "origin",
    "user-agent",
    "x-csrftoken",
    "x-requested-with",
    "x-clerk-user-id",
    "x-user-email",
    "x-user-firstname",
    "x-user-lastname",
]


# ============================================================================
# CONFIGURATION REST FRAMEWORK
# ============================================================================
REST_FRAMEWORK = {
    "DEFAULT_PERMISSION_CLASSES": [
        "rest_framework.permissions.AllowAny",
    ],
    "DEFAULT_AUTHENTICATION_CLASSES": [
        "rest_framework.authentication.SessionAuthentication",
        "rest_framework.authentication.BasicAuthentication",
    ],
    "DEFAULT_PAGINATION_CLASS": "rest_framework.pagination.PageNumberPagination",
    "PAGE_SIZE": 10,
}


# ============================================================================
# CONFIGURATION EMAIL
# ============================================================================
EMAIL_BACKEND = "django.core.mail.backends.smtp.EmailBackend"
EMAIL_HOST = os.getenv("EMAIL_HOST", "smtp.gmail.com")
EMAIL_PORT = int(os.getenv("EMAIL_PORT", "587"))
EMAIL_USE_TLS = os.getenv("EMAIL_USE_TLS", "True") == "True"
EMAIL_USE_SSL = False
EMAIL_TIMEOUT = 30

EMAIL_HOST_USER = os.getenv("EMAIL_HOST_USER", "laminemzoughi26@gmail.com")
EMAIL_HOST_PASSWORD = os.getenv("EMAIL_HOST_PASSWORD", "")

SESSION_COOKIE_SAMESITE = None  # Important pour CORS

SESSION_COOKIE_HTTPONLY = True
SESSION_COOKIE_SECURE = False  # Mettre True en HTTPS
SESSION_SAVE_EVERY_REQUEST = True
SESSION_EXPIRE_AT_BROWSER_CLOSE = False
DEFAULT_FROM_EMAIL = os.getenv(
    "DEFAULT_FROM_EMAIL",
    f"AJ Recruiters <{EMAIL_HOST_USER}>"
)

SERVER_EMAIL = DEFAULT_FROM_EMAIL


# ============================================================================
# URL FRONTEND
# ============================================================================
FRONTEND_URL = os.getenv("FRONTEND_URL", "http://localhost:5173")


# ============================================================================
# CONFIGURATION GROQ API (POUR L'IA)
# ============================================================================
GROQ_API_KEY = os.getenv("GROQ_API_KEY", "")


# ============================================================================
# CONFIGURATION DES LOGS
# ============================================================================
LOGGING = {
    "version": 1,
    "disable_existing_loggers": False,
    "formatters": {
        "verbose": {
            "format": "{levelname} {asctime} {module} {process:d} {thread:d} {message}",
            "style": "{",
        },
        "simple": {
            "format": "{levelname} {asctime} {message}",
            "style": "{",
        },
    },
    "handlers": {
        "console": {
            "class": "logging.StreamHandler",
            "formatter": "simple",
        },
        "file": {
            "class": "logging.FileHandler",
            "filename": BASE_DIR / "debug.log",
            "formatter": "verbose",
        },
    },
    "root": {
        "handlers": ["console"],
        "level": "INFO",
    },
    "loggers": {
        "django": {
            "handlers": ["console"],
            "level": os.getenv("DJANGO_LOG_LEVEL", "INFO"),
            "propagate": False,
        },
        "admin_users": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": True,
        },
        "companies": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": True,
        },
        "jobs": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": True,
        },
        "applications": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": True,
        },
        "profiles": {
            "handlers": ["console", "file"],
            "level": "DEBUG",
            "propagate": True,
        },
    },
}