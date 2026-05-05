# backend/applications/serializers.py

from rest_framework import serializers
from .models import Application


class ApplicationSerializer(serializers.ModelSerializer):
    candidate_details = serializers.SerializerMethodField()
    job_details = serializers.SerializerMethodField()

    class Meta:
        model = Application
        fields = [
            "id",
            "job",
            "candidate",
            "status",
            "cover_letter",
            "applied_at",
            "test_questions",
            "test_result",
            "test_sent_at",
            "test_completed_at",
            "candidate_details",
            "job_details",
        ]
        read_only_fields = [
            "id",
            "candidate",
            "applied_at",
            "test_sent_at",
            "test_completed_at",
        ]

    def get_candidate_details(self, obj):
        candidate = obj.candidate
        request = self.context.get("request")

        # ✅ CORRECTION : utilise candidate.cv_url (propriété custom)
        # au lieu de candidate.cv.url (Django natif qui cause le double /media/)
        cv_url = None
        if getattr(candidate, "cv", None) and candidate.cv_url:
            cv_url = (
                request.build_absolute_uri(candidate.cv_url)
                if request
                else candidate.cv_url
            )

        # ✅ Même correction pour la photo
        photo_url = None
        if getattr(candidate, "photo", None) and candidate.photo_url:
            photo_url = (
                request.build_absolute_uri(candidate.photo_url)
                if request
                else candidate.photo_url
            )

        first_name = getattr(candidate, "first_name", "") or ""
        last_name = getattr(candidate, "last_name", "") or ""
        full_name = f"{first_name} {last_name}".strip() or getattr(
            candidate, "email", "Candidat"
        )

        return {
            "id": getattr(candidate, "id", None),
            "full_name": full_name,
            "first_name": first_name,
            "last_name": last_name,
            "email": getattr(candidate, "email", ""),
            "phone": getattr(candidate, "phone", ""),
            "location": getattr(candidate, "location", ""),
            "title": getattr(candidate, "title", ""),
            "education": getattr(candidate, "education", ""),
            "experience": getattr(candidate, "experience", ""),
            "skills": getattr(candidate, "skills", []) or [],
            "bio": getattr(candidate, "bio", ""),
            "linkedin": getattr(candidate, "linkedin", ""),
            "github": getattr(candidate, "github", ""),
            "photo_url": photo_url,
            "cv_url": cv_url,
            "cv_text_short": (
                getattr(candidate, "cv_text", "")[:1200]
                if getattr(candidate, "cv_text", None)
                else ""
            ),
            "cv_parsed": getattr(candidate, "cv_parsed", None),
        }

    def get_job_details(self, obj):
        job = obj.job
        recruiter = getattr(job, "recruiter", None)

        return {
            "id": job.id,
            "title": getattr(job, "title", ""),
            "description": getattr(job, "description", ""),
            "location": getattr(job, "location", ""),
            "contract_type": getattr(job, "contract_type", ""),
            "experience_level": getattr(job, "experience_level", ""),
            "company_name": getattr(recruiter, "company_name", "") if recruiter else "",
        }
