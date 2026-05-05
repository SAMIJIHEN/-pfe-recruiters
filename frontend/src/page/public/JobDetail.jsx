// src/page/public/JobDetail.jsx
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/common/PageTransition";
import api from "../../services/api";
import BackButton from "../../components/common/BackButton";

import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  CheckCircleIcon,
  EyeIcon,
  UserGroupIcon,
  AcademicCapIcon,
  ClockIcon,
  TagIcon,
  DocumentTextIcon,
  SparklesIcon,
  GlobeAltIcon,
  EnvelopeIcon,
  PhoneIcon,
  LinkIcon,
  ChartBarIcon,
} from "@heroicons/react/24/outline";

// ─────────────────────────────────────────────
// Fonction professionnelle de formatage (identique à celle du formulaire)
// ─────────────────────────────────────────────
function formatDescriptionToHtml(text) {
  if (!text) return "";

  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/^###\s*##\s*/gm, "## ");
  html = html.replace(/^##\s*##\s*/gm, "## ");

  const sections = [
    { name: "Présentation du poste", icon: "🎯", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-800", hoverBorder: "hover:border-emerald-300" },
    { name: "Missions principales", icon: "📋", bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-800", hoverBorder: "hover:border-blue-300" },
    { name: "Profil recherché", icon: "👤", bgColor: "bg-purple-50", borderColor: "border-purple-200", textColor: "text-purple-800", hoverBorder: "hover:border-purple-300" },
    { name: "Avantages", icon: "⭐", bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-800", hoverBorder: "hover:border-amber-300" },
  ];

  let result = "";
  let remaining = html;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const regex = new RegExp(`## ${section.name}\\s*([\\s\\S]*?)(?=## |$)`, "i");
    const match = remaining.match(regex);
    if (match) {
      let content = match[1].trim();
      content = content.replace(/^[-*] (.*)$/gm, (match, item) => {
        return `<li class="flex items-start gap-2 mb-2">
                  <svg class="w-5 h-5 ${section.textColor} shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-gray-700">${item}</span>
                </li>`;
      });
      content = content.replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-1">$&</ul>');
      content = content.replace(/\n{2,}/g, '</p><p class="mb-3">');
      content = '<p class="mb-3">' + content + '</p>';
      content = content.replace(/<p>\s*<\/p>/g, '');

      result += `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border ${section.borderColor} ${section.hoverBorder} transition-all duration-200 mb-6">
          <div class="${section.bgColor} px-5 py-3 flex items-center gap-2 border-b ${section.borderColor}">
            <span class="text-xl">${section.icon}</span>
            <h3 class="text-lg font-semibold ${section.textColor}">${section.name}</h3>
          </div>
          <div class="p-5 text-gray-700">
            ${content}
          </div>
        </div>
      `;
      remaining = remaining.replace(regex, "");
    }
  }

  if (remaining.trim()) {
    result += `<div class="bg-gray-50 rounded-xl p-5 border border-gray-200">${remaining}</div>`;
  }

  return result;
}

export default function JobDetail() {
  const { id } = useParams();
  const navigate = useNavigate();
  const { isSignedIn } = useUser();
  
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [applying, setApplying] = useState(false);
  const [hasApplied, setHasApplied] = useState(false);

  useEffect(() => {
    loadJob();
    checkIfApplied();
    incrementView();
  }, [id]);

  const loadJob = async () => {
    try {
      const response = await api.get(`/job-offers/${id}/`);
      setJob(response.data);
    } catch (error) {
      console.error("Erreur chargement offre:", error);
    } finally {
      setLoading(false);
    }
  };

  const checkIfApplied = async () => {
    if (!isSignedIn) return;
    try {
      const response = await api.get("/applications/my-applications/");
      const applications = response.data.results || response.data || [];
      const alreadyApplied = applications.some(app => String(app.job) === String(id));
      setHasApplied(alreadyApplied);
    } catch (error) {
      console.error("Erreur vérification candidature:", error);
    }
  };

  const incrementView = async () => {
    try {
      await api.post(`/job-offers/${id}/increment_view/`);
    } catch (error) {
      console.log("Erreur incrémentation vues:", error);
    }
  };

  const handleApply = async () => {
    if (!isSignedIn) {
      navigate("/login");
      return;
    }

    setApplying(true);
    try {
      await api.post("/applications/", { job: id });
      setHasApplied(true);
      alert("✅ Candidature envoyée avec succès !");
    } catch (error) {
      console.error("Erreur candidature:", error);
      alert("❌ Erreur lors de l'envoi de la candidature");
    } finally {
      setApplying(false);
    }
  };

  const formatDate = (value, options = {}) => {
    if (!value) return "Non spécifiée";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "Non spécifiée";
    return d.toLocaleDateString("fr-FR", options);
  };

  const formatSalary = () => {
    if (!job?.salary_min && !job?.salary_max) return "Non précisée";
    if (job?.salary_min && job?.salary_max) {
      return `${job.salary_min} - ${job.salary_max} TND`;
    }
    if (job?.salary_min) return `À partir de ${job.salary_min} TND`;
    return `Jusqu'à ${job.salary_max} TND`;
  };

  const getExperienceLabel = (level) => {
    const labels = {
      "0-1": "Moins d'un an",
      "1-3": "1 à 3 ans",
      "3-5": "3 à 5 ans",
      "5-10": "5 à 10 ans",
      "10+": "Plus de 10 ans",
    };
    return labels[level] || level || "Non spécifié";
  };

  if (loading) {
    return (
      <PublicLayout>
        <div className="flex justify-center py-20">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
        </div>
      </PublicLayout>
    );
  }

  if (!job) {
    return (
      <PublicLayout>
        <div className="text-center py-20">
          <p className="text-gray-500">Offre non trouvée</p>
        </div>
      </PublicLayout>
    );
  }

  const companyName = job.company_name || job.recruiter?.company_name || "Entreprise";
  const isNew = job.created_at && (new Date() - new Date(job.created_at)) < 7 * 24 * 60 * 60 * 1000;
  const totalApplications = job.applications_count || 0;
  const viewsCount = job.views_count || 0;

  return (
    <PublicLayout>
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* ✅ Bouton Retour amélioré */}
          <BackButton fallbackPath="/" className="mb-6" />

          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="mb-8"
          >
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="relative px-8 py-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-48 translate-x-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl" />

                <div className="relative">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-6">
                      <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                        <span className="text-4xl font-bold text-white">
                          {companyName.charAt(0).toUpperCase()}
                        </span>
                      </div>

                      <div>
                        <div className="flex items-center gap-3 flex-wrap">
                          <h1 className="text-3xl font-bold text-white">{job.title}</h1>
                          {isNew && (
                            <span className="px-3 py-1 bg-emerald-400 text-white rounded-full text-xs font-semibold">
                              Nouvelle
                            </span>
                          )}
                          {job.status === "active" && (
                            <span className="px-3 py-1 bg-green-400 text-white rounded-full text-xs font-semibold">
                              Active
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-2 mt-3">
                          <BuildingOfficeIcon className="w-5 h-5 text-emerald-300" />
                          <p className="text-emerald-100 text-lg font-medium">
                            {companyName}
                          </p>
                        </div>

                        <div className="flex flex-wrap gap-4 mt-3 text-sm text-emerald-200">
                          <span className="flex items-center gap-1.5">
                            <MapPinIcon className="w-4 h-4" />
                            {job.location || "Lieu non précisé"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <BriefcaseIcon className="w-4 h-4" />
                            {job.contract_type || "Contrat non précisé"}
                          </span>
                          <span className="flex items-center gap-1.5">
                            <CalendarIcon className="w-4 h-4" />
                            Publiée le {formatDate(job.created_at)}
                          </span>
                        </div>
                      </div>
                    </div>

                    {/* Bouton Postuler dans l'en-tête */}
                    <button
                      onClick={handleApply}
                      disabled={applying || hasApplied}
                      className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl font-semibold transition-all shadow-lg ${
                        hasApplied
                          ? "bg-gray-500 text-white cursor-not-allowed"
                          : "bg-gradient-to-r from-emerald-500 to-emerald-600 text-white hover:from-emerald-600 hover:to-emerald-700"
                      }`}
                    >
                      {applying ? (
                        <>
                          <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          Envoi en cours...
                        </>
                      ) : hasApplied ? (
                        <>
                          <CheckCircleIcon className="w-5 h-5" />
                          Déjà postulé
                        </>
                      ) : (
                        "Postuler à cette offre"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8"
          >
            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Candidatures reçues</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{totalApplications}</p>
                </div>
                <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center">
                  <UserGroupIcon className="w-6 h-6 text-blue-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Total des candidatures</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Vues totales</p>
                  <p className="text-3xl font-bold text-gray-900 mt-1">{viewsCount}</p>
                </div>
                <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center">
                  <EyeIcon className="w-6 h-6 text-purple-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">Nombre de consultations</p>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Date de création</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">
                    {formatDate(job.created_at, { day: "numeric", month: "long", year: "numeric" })}
                  </p>
                </div>
                <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center">
                  <CalendarIcon className="w-6 h-6 text-emerald-600" />
                </div>
              </div>
            </div>

            <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm hover:shadow-md transition-all">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm text-gray-500">Type de contrat</p>
                  <p className="text-xl font-bold text-gray-900 mt-1">{job.contract_type || "—"}</p>
                </div>
                <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center">
                  <BriefcaseIcon className="w-6 h-6 text-amber-600" />
                </div>
              </div>
              <p className="text-xs text-gray-400 mt-2">
                {job.remote_possible ? "Télétravail possible" : "Poste sur site"}
              </p>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <div className="lg:col-span-2 space-y-6">
              {/* ✅ Description du poste : maintenant avec mise en forme professionnelle */}
              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <DocumentTextIcon className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-800">Description du poste</h2>
                </div>
                <div 
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(job.description || "") }}
                />
              </div>

              {job.skills_required && job.skills_required.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                    <TagIcon className="w-6 h-6 text-emerald-600" />
                    <h2 className="text-xl font-bold text-gray-800">Compétences requises</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_required.map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-200 hover:bg-emerald-100 transition">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {job.skills_preferred && job.skills_preferred.length > 0 && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                    <SparklesIcon className="w-6 h-6 text-purple-600" />
                    <h2 className="text-xl font-bold text-gray-800">Compétences souhaitées</h2>
                  </div>
                  <div className="flex flex-wrap gap-2">
                    {job.skills_preferred.map((skill, i) => (
                      <span key={i} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium border border-purple-200 hover:bg-purple-100 transition">
                        {skill}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            <div className="space-y-6">
              <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <BuildingOfficeIcon className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Entreprise</h2>
                </div>
                <div className="space-y-3">
                  <p className="font-semibold text-gray-900 text-lg">{companyName}</p>
                  {job.recruiter?.email && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <EnvelopeIcon className="w-4 h-4 text-emerald-500" />
                      <span>{job.recruiter.email}</span>
                    </div>
                  )}
                  {job.recruiter?.phone && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <PhoneIcon className="w-4 h-4 text-emerald-500" />
                      <span>{job.recruiter.phone}</span>
                    </div>
                  )}
                  {job.recruiter?.website && (
                    <div className="flex items-center gap-2 text-sm text-gray-600">
                      <LinkIcon className="w-4 h-4 text-emerald-500" />
                      <a href={job.recruiter.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                        Site web
                      </a>
                    </div>
                  )}
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <ChartBarIcon className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Détails du poste</h2>
                </div>

                <div className="space-y-4">
                  <div className="flex items-start gap-3 text-gray-600">
                    <MapPinIcon className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700">Localisation</p>
                      <p className="text-sm">{job.location || "Non précisée"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-600">
                    <BriefcaseIcon className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700">Type de contrat</p>
                      <p className="text-sm">{job.contract_type || "Non précisé"}</p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3 text-gray-600">
                    <ClockIcon className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700">Expérience requise</p>
                      <p className="text-sm">{getExperienceLabel(job.experience_level)}</p>
                    </div>
                  </div>

                  {job.education_level && (
                    <div className="flex items-start gap-3 text-gray-600">
                      <AcademicCapIcon className="w-5 h-5 text-emerald-500 mt-0.5" />
                      <div>
                        <p className="font-medium text-gray-700">Niveau d'études</p>
                        <p className="text-sm">{job.education_level}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-start gap-3 text-gray-600">
                    <GlobeAltIcon className="w-5 h-5 text-emerald-500 mt-0.5" />
                    <div>
                      <p className="font-medium text-gray-700">Télétravail</p>
                      <p className="text-sm">{job.remote_possible ? "Oui, possible" : "Non, sur site"}</p>
                    </div>
                  </div>
                </div>
              </div>

              <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                  <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
                  <h2 className="text-lg font-semibold text-gray-800">Rémunération</h2>
                </div>
                <div className="text-center">
                  <p className="text-3xl font-bold text-emerald-600">{formatSalary()}</p>
                  {!job.salary_visible && (
                    <p className="text-xs text-gray-400 mt-2">⚠️ Non affiché publiquement</p>
                  )}
                </div>
              </div>

              {job.application_deadline && (
                <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
                  <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
                    <CalendarIcon className="w-5 h-5 text-emerald-600" />
                    <h2 className="text-lg font-semibold text-gray-800">Date limite</h2>
                  </div>
                  <div className="text-center">
                    <p className="text-xl font-semibold text-gray-800">
                      {formatDate(job.application_deadline, { day: "numeric", month: "long", year: "numeric" })}
                    </p>
                    {new Date(job.application_deadline) < new Date() && (
                      <p className="text-xs text-red-500 mt-2">⚠️ Date dépassée</p>
                    )}
                  </div>
                </div>
              )}
            </div>
          </motion.div>

          {!isSignedIn && (
            <div className="mt-8 text-center">
              <p className="text-gray-500">
                Vous devez être connecté pour postuler.{" "}
                <button onClick={() => navigate("/login")} className="text-emerald-600 hover:underline">
                  Se connecter
                </button>
              </p>
            </div>
          )}
        </div>
      </PageTransition>
    </PublicLayout>
  );
}