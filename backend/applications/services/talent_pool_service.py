# backend/applications/services/talent_pool_service.py
import logging
from profiles.models import TalentPool
from profiles.utils.groq_client import analyze_cv_richness

logger = logging.getLogger(__name__)

def auto_add_to_talent_pool_if_rich(candidate, job):
    print("🚀 ENTRÉE méthode auto_add_to_talent_pool_if_rich")
    print(f"🚀 Candidat: {candidate.email}")
    print(f"🚀 Job: {job.title}")
    
    try:
        if not candidate.cv_text or len(candidate.cv_text.strip()) < 50:
            print(f"⚠️ Pas de CV textuel pour {candidate.email}")
            return

        analysis = analyze_cv_richness(candidate.cv_text)

        if analysis.get("error"):
            print(f"❌ Erreur analyse CV: {analysis['error']}")
            return

        is_rich = analysis.get("rich", False)
        skills_count = analysis.get("skills_count", 0)
        experience_years = analysis.get("experience_years", 0)
        domain = analysis.get("domain", "")
        all_skills = analysis.get("all_skills", [])

        print(f"📊 Analyse CV {candidate.email}: compétences={skills_count}, expérience={experience_years} ans, riche={is_rich}, domaine={domain}")

        if is_rich:
            recruiter = job.recruiter
            talent, created = TalentPool.objects.get_or_create(
                recruiter=recruiter,
                candidate=candidate,
                defaults={
                    "domain": domain,
                    "years_experience": experience_years,
                    "reason": f"✅ Ajout automatique par IA - CV riche détecté: {skills_count} compétences, {experience_years} ans d'expérience",
                    "score": min(100, skills_count * 10),
                }
            )
            if created:
                print(f"✅ Candidat {candidate.email} ajouté automatiquement à la base de talents de {recruiter.company_name}")
            else:
                print(f"ℹ️ Candidat {candidate.email} déjà dans la base de talents")
        else:
            print(f"ℹ️ CV non riche pour {candidate.email}: {skills_count} compétences, {experience_years} ans")

    except Exception as e:
        logger.error(f"Erreur dans auto_add_to_talent_pool_if_rich: {str(e)}")
        print(f"❌ Exception: {str(e)}")