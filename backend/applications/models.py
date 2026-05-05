# backend/applications/models.py
from django.db import models
import uuid


class Application(models.Model):
    STATUS_CHOICES = [
        ("pending", "En attente"),
        ("interview", "Test en attente"),
        ("reviewed", "Examinée"),
        ("accepted", "Acceptée"),
        ("rejected", "Refusée"),
        ("programme_entretien", "Entretien programmé"),  # ✅ NOUVEAU STATUT
    ]

    id = models.UUIDField(primary_key=True, default=uuid.uuid4, editable=False)

    job = models.ForeignKey(
        "jobs.JobOffer",
        on_delete=models.CASCADE,
        related_name="applications",
    )

    candidate = models.ForeignKey(
        "profiles.CandidateProfile",
        on_delete=models.CASCADE,
        related_name="applications",
    )

    status = models.CharField(
        max_length=20,
        choices=STATUS_CHOICES,
        default="pending",
    )

    cover_letter = models.TextField(blank=True)
    applied_at = models.DateTimeField(auto_now_add=True)

    # Test technique
    test_questions = models.JSONField(null=True, blank=True, default=list)
    test_result = models.JSONField(null=True, blank=True, default=dict)
    test_sent_at = models.DateTimeField(null=True, blank=True)
    test_completed_at = models.DateTimeField(null=True, blank=True)

    # Analyse IA
    ai_analysis = models.JSONField(null=True, blank=True, default=dict)

    # Entretien
    interview_date = models.DateTimeField(null=True, blank=True)
    interview_link = models.URLField(max_length=500, blank=True, null=True)
    interview_status = models.CharField(
        max_length=20,
        choices=[
            ('not_scheduled', 'Non programmé'),
            ('scheduled', 'Programmé'),
            ('completed', 'Terminé'),
            ('cancelled', 'Annulé'),
        ],
        default='not_scheduled'
    )
    interview_notes = models.TextField(blank=True, null=True)

    class Meta:
        db_table = "applications"
        ordering = ["-applied_at"]
        unique_together = ["job", "candidate"]

    def __str__(self):
        candidate_name = getattr(self.candidate, "email", "Candidat")
        job_title = getattr(self.job, "title", "Offre")
        return f"{candidate_name} - {job_title}"