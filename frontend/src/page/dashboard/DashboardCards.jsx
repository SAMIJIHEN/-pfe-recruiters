// frontend/src/page/dashboard/DashboardCards.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  BuildingOfficeIcon,
  SparklesIcon,
  HeartIcon as HeartOutline,
} from "@heroicons/react/24/outline";
import { HeartIcon as HeartSolid } from "@heroicons/react/24/solid";
import TestModal from "./TestModal";

// ==================== JOB CARD ====================
export function JobCard({ job, onApply, hasApplied, isRecommended = false }) {
  const applied = hasApplied(job.id);
  const navigate = useNavigate();

  // État local pour savoir si l'offre est sauvegardée
  const [isSaved, setIsSaved] = useState(false);

  // Charger l'état depuis localStorage au montage
  useEffect(() => {
    const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    setIsSaved(savedJobs.includes(job.id));
  }, [job.id]);

  const formatSalary = (min, max) => {
    if (!min && !max) return "Non spécifié";
    if (min && max) return `${min} - ${max} TND`;
    if (min) return `${min} TND`;
    return `${max} TND`;
  };

  const handleViewDetails = () => {
    navigate(`/jobs/${job.id}`);
  };

  const toggleSave = (e) => {
    e.stopPropagation(); // Empêche le clic sur la carte
    const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
    let newSaved;
    if (isSaved) {
      newSaved = savedJobs.filter(id => id !== job.id);
    } else {
      newSaved = [...savedJobs, job.id];
    }
    localStorage.setItem("savedJobs", JSON.stringify(newSaved));
    setIsSaved(!isSaved);

    // Déclencher un événement personnalisé pour rafraîchir l'onglet "Sauvegardées"
    window.dispatchEvent(new Event("savedJobsUpdated"));
  };

  const getScoreColor = (score) => {
    if (score >= 80) return "text-emerald-600";
    if (score >= 60) return "text-blue-600";
    if (score >= 40) return "text-amber-600";
    if (score >= 20) return "text-orange-600";
    return "text-gray-500";
  };

  const getScoreBgColor = (score) => {
    if (score >= 80) return "bg-emerald-50 border-emerald-200";
    if (score >= 60) return "bg-blue-50 border-blue-200";
    if (score >= 40) return "bg-amber-50 border-amber-200";
    if (score >= 20) return "bg-orange-50 border-orange-200";
    return "bg-gray-50 border-gray-200";
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={{ y: -2 }}
      className={`bg-white rounded-xl border overflow-hidden transition-all duration-300 ${
        isRecommended
          ? "border-emerald-200 shadow-md"
          : "border-gray-100 hover:shadow-md"
      }`}
    >
      <div className="p-5">
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-100 to-teal-100 rounded-xl flex items-center justify-center text-emerald-700 font-bold text-xl shadow-sm">
            {job.company_name?.charAt(0).toUpperCase() || "E"}
          </div>

          <div className="flex-1">
            <div className="flex items-start justify-between flex-wrap gap-2">
              <div className="flex-1">
                <div className="flex items-center gap-3 flex-wrap">
                  <h3 className="text-lg font-bold text-gray-900">
                    {job.title}
                  </h3>
                  <p className="text-sm text-gray-600">
                    {job.company_name || "Entreprise"}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-2">
                {/* Bouton cœur (sauvegarde) */}
                <button
                  onClick={toggleSave}
                  className="p-2 rounded-lg border border-gray-200 hover:bg-gray-50 transition"
                  aria-label={isSaved ? "Retirer des sauvegardes" : "Sauvegarder"}
                >
                  {isSaved ? (
                    <HeartSolid className="w-5 h-5 text-red-500" />
                  ) : (
                    <HeartOutline className="w-5 h-5 text-gray-400 hover:text-red-500 transition" />
                  )}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    if (!applied) onApply(job.id);
                  }}
                  disabled={applied}
                  className={`px-4 py-2 rounded-lg font-semibold text-sm transition-all duration-200 ${
                    applied
                      ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                      : "bg-emerald-600 text-white hover:bg-emerald-700 shadow-sm hover:shadow"
                  }`}
                >
                  {applied ? "✓ Déjà postulé" : "Postuler"}
                </button>

                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    handleViewDetails();
                  }}
                  className="px-4 py-2 rounded-lg font-semibold text-sm bg-gray-100 text-gray-700 hover:bg-emerald-100 hover:text-emerald-700 transition-all duration-200"
                >
                  Détails
                </button>
              </div>
            </div>

            <div className="flex flex-wrap gap-4 mt-3 text-sm text-gray-500">
              <span className="flex items-center gap-1">
                <MapPinIcon className="w-4 h-4" />
                {job.location || "Non spécifié"}
              </span>
              <span className="flex items-center gap-1">
                <BriefcaseIcon className="w-4 h-4" />
                {job.contract_type || "CDI"}
              </span>
              <span className="flex items-center gap-1">
                <CurrencyDollarIcon className="w-4 h-4" />
                {formatSalary(job.salary_min, job.salary_max)}
              </span>
            </div>

            {isRecommended && job.match_score > 0 && (
              <div className="mt-3">
                <div className="flex items-center gap-2">
                  <div
                    className={`inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold ${getScoreBgColor(
                      job.match_score
                    )}`}
                  >
                    <SparklesIcon className="w-3 h-3" />
                    <span className={getScoreColor(job.match_score)}>
                      {job.match_score}% match
                    </span>
                  </div>
                  <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                    <div
                      className={`h-full rounded-full transition-all duration-500 ${
                        job.match_score >= 80
                          ? "bg-emerald-500"
                          : job.match_score >= 60
                          ? "bg-blue-500"
                          : job.match_score >= 40
                          ? "bg-amber-500"
                          : job.match_score >= 20
                          ? "bg-orange-500"
                          : "bg-gray-400"
                      }`}
                      style={{ width: `${job.match_score}%` }}
                    />
                  </div>
                </div>
                {job.matched_skills && job.matched_skills.length > 0 && (
                  <p className="text-xs text-gray-400 mt-1.5">
                    {job.matched_skills.length}/
                    {job.total_skills || job.skills_required?.length || 0}{" "}
                    compétences correspondantes
                  </p>
                )}
              </div>
            )}

            {job.skills_required?.length > 0 && (
              <div className="mt-3 flex flex-wrap gap-1.5">
                {job.skills_required.slice(0, 4).map((skill, idx) => {
                  const isMatched = job.matched_skills?.includes(skill);
                  return (
                    <span
                      key={idx}
                      className={`px-2 py-1 rounded-lg text-xs transition ${
                        isMatched && isRecommended
                          ? "bg-emerald-100 text-emerald-700 border border-emerald-200"
                          : "bg-gray-100 text-gray-600"
                      }`}
                    >
                      {skill}
                      {isMatched && isRecommended && " ✓"}
                    </span>
                  );
                })}
                {job.skills_required.length > 4 && (
                  <span className="px-2 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs">
                    +{job.skills_required.length - 4}
                  </span>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== CANDIDATURE CARD ====================
export function CandidatureCard({ app, onRefresh }) {
  const [showTest, setShowTest] = useState(false);

  const statusConfig = {
    pending: {
      bg: "bg-amber-100",
      text: "text-amber-700",
      icon: "⏳",
      label: "En attente de validation",
    },
    reviewed: {
      bg: "bg-blue-100",
      text: "text-blue-700",
      icon: "👀",
      label: "CV examiné",
    },
    interview: {
      bg: "bg-purple-100",
      text: "text-purple-700",
      icon: "📝",
      label: "Test technique à réaliser",
    },
    accepted: {
      bg: "bg-green-100",
      text: "text-green-700",
      icon: "✅",
      label: "Candidature acceptée",
    },
    rejected: {
      bg: "bg-red-100",
      text: "text-red-700",
      icon: "❌",
      label: "Candidature refusée",
    },
  };

  const status = statusConfig[app.status] || {
    bg: "bg-gray-100",
    text: "text-gray-700",
    icon: "📄",
    label: app.status,
  };
  const jobTitle = app.job_details?.title || "Offre d'emploi";
  const companyName =
    app.job_details?.company_name ||
    app.job_details?.recruiter?.company_name ||
    "Entreprise";
  const appliedDate = new Date(app.applied_at).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });

  const hasTestToTake =
    app.status === "interview" &&
    !app.test_done &&
    (app.has_test === true || (app.test_questions && app.test_questions.length > 0));

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className={`bg-white rounded-xl border-2 p-5 hover:shadow-lg transition-all duration-300 ${
          hasTestToTake
            ? "border-purple-300 shadow-md ring-1 ring-purple-200"
            : "border-gray-100"
        }`}
      >
        <div className="flex gap-4">
          <div className="w-14 h-14 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white font-bold text-xl shadow-md">
            {companyName.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1">
            <div className="flex items-center justify-between flex-wrap gap-2">
              <div className="flex items-center gap-3 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900">{jobTitle}</h3>
                <span
                  className={`px-3 py-1 rounded-full text-xs font-medium ${status.bg} ${status.text} flex items-center gap-1`}
                >
                  <span>{status.icon}</span> {status.label}
                </span>
              </div>
              <p className="text-xs text-gray-400 flex items-center gap-1">
                <CalendarIcon className="w-3.5 h-3.5" />
                Postulé le {appliedDate}
              </p>
            </div>

            <p className="text-sm text-gray-600 mt-1 flex items-center gap-1">
              <BuildingOfficeIcon className="w-4 h-4 text-gray-400" />
              {companyName}
            </p>

            {hasTestToTake && (
              <motion.div
                initial={{ opacity: 0, y: 5 }}
                animate={{ opacity: 1, y: 0 }}
                className="mt-4 flex items-center gap-4 p-4 bg-gradient-to-r from-purple-50 to-indigo-50 rounded-xl border border-purple-200"
              >
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-indigo-500 rounded-xl flex items-center justify-center shadow-md">
                  <svg
                    className="w-6 h-6 text-white"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"
                    />
                  </svg>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-purple-800">
                    Test technique à réaliser
                  </p>
                  <p className="text-xs text-purple-600">
                    ⏱️ Temps personnalisé par question • Répondez avant la fin
                  </p>
                </div>
                <button
                  onClick={() => setShowTest(true)}
                  className="flex items-center gap-2 px-5 py-2.5 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg text-sm font-semibold hover:from-purple-700 hover:to-indigo-700 transition shadow-md"
                >
                  <SparklesIcon className="w-4 h-4" />
                  Commencer le test
                </button>
              </motion.div>
            )}
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showTest && (
          <TestModal
            app={app}
            onClose={() => setShowTest(false)}
            onRefresh={onRefresh}
          />
        )}
      </AnimatePresence>
    </>
  );
}