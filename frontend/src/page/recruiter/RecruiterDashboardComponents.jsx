// frontend/src/page/recruiter/RecruiterDashboardComponents.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ VERSION CORRIGÉE AVEC MODAL ENTRETIEN PROFESSIONNEL
// ✅ TOUTES LES FONCTIONNALITÉS CONSERVÉES
// ✅ DESIGN PREMIUM POUR L'INVITATION ENTRETIEN
// ═══════════════════════════════════════════════════════════════

import { useState, useMemo } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CheckCircleIcon,
  XCircleIcon,
  ArrowPathIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  EyeIcon,
  SparklesIcon,
  EnvelopeIcon,
  PhoneIcon,
  BuildingOfficeIcon,
  AcademicCapIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ClockIcon,
  ClipboardDocumentListIcon,
  TrashIcon,
  StarIcon,
  CodeBracketIcon,
  LinkIcon,
  VideoCameraIcon,
  BellAlertIcon,
  ChatBubbleLeftEllipsisIcon,
} from "@heroicons/react/24/outline";

import {
  STATUS_CONFIG,
  EDUCATION_LABELS,
  EXPERIENCE_LABELS,
  BASE_URL,
  getScoreColor,
  getTestPercentage,
} from "./RecruiterDashboardUtils";

import { addToTalentPool, removeFromTalentPool, isCandidateInTalentPool } from "../../services/api";

// ==================== STATUS BADGE ====================
export function StatusBadge({ status }) {
  const cfg = STATUS_CONFIG[status] || { label: status, bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200", icon: "📄" };
  return (
    <span className={`inline-flex items-center gap-1 px-3 py-1 rounded-full text-xs font-semibold border ${cfg.bg} ${cfg.text} ${cfg.border}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

// ==================== MODAL ENTRETIEN PROFESSIONNEL (COMPOSANT RÉUTILISABLE) ====================
function InterviewSchedulerModal({ show, onClose, onSchedule, candidateName, offerTitle, candidateId, applicationId }) {
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState("video");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewLink, setInterviewLink] = useState("");
  const [interviewDuration, setInterviewDuration] = useState(45);
  const [interviewNotes, setInterviewNotes] = useState("");
  const [sendReminder, setSendReminder] = useState(true);
  const [scheduling, setScheduling] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const getEmailPreview = () => {
    const formattedDateTime = interviewDate && interviewTime
      ? new Date(`${interviewDate}T${interviewTime}`).toLocaleString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
        })
      : "Date à confirmer";

    let locationText = "";
    if (interviewType === "video") {
      locationText = interviewLink
        ? `🔗 Lien de visioconférence : ${interviewLink}`
        : "🔗 Lien de visioconférence sera communiqué ultérieurement";
    } else if (interviewType === "onsite") {
      locationText = `📍 Adresse : ${interviewLocation || "À préciser"}`;
    } else {
      locationText = "📞 Entretien téléphonique";
    }

    const durationText = interviewDuration === 15 ? "15 minutes" :
                         interviewDuration === 30 ? "30 minutes" :
                         interviewDuration === 45 ? "45 minutes" :
                         interviewDuration === 60 ? "1 heure" :
                         interviewDuration === 90 ? "1 heure 30" : "2 heures";

    return [
      "📅 INVITATION À UN ENTRETIEN",
      "",
      `Bonjour ${candidateName || "Candidat"},`,
      "",
      `Suite à l'analyse de votre candidature pour le poste de "${offerTitle || "notre offre"}", nous sommes heureux de vous inviter à un entretien.`,
      "",
      `📅 Date : ${formattedDateTime}`,
      `⏱️ Durée estimée : ${durationText}`,
      `📋 Type : ${interviewType === "video" ? "Visioconférence" : interviewType === "onsite" ? "Présentiel" : "Téléphonique"}`,
      locationText,
      "",
      interviewNotes ? `📝 Informations complémentaires :\n${interviewNotes}\n` : "",
      sendReminder ? "🔔 Un rappel vous sera envoyé 24 heures avant l'entretien.\n" : "",
      "Nous restons à votre disposition pour toute information complémentaire.",
      "",
      "Cordialement,",
      "L'équipe RH"
    ].join("\n");
  };

  const handleSchedule = async () => {
    if (!interviewDate || !interviewTime) {
      alert("Veuillez sélectionner une date et une heure");
      return;
    }

    if (interviewType === "onsite" && !interviewLocation.trim()) {
      alert("Veuillez indiquer l'adresse du lieu d'entretien");
      return;
    }

    setScheduling(true);
    try {
      await onSchedule(applicationId, {
        interview_date: interviewDate,
        interview_time: interviewTime,
        interview_type: interviewType,
        interview_location: interviewType === "onsite" ? interviewLocation : (interviewType === "phone" ? "Entretien téléphonique" : ""),
        interview_link: interviewLink,
        interview_duration: interviewDuration,
        interview_notes: interviewNotes,
        send_reminder: sendReminder,
      });
      onClose();
      // Réinitialisation
      setInterviewDate("");
      setInterviewTime("");
      setInterviewType("video");
      setInterviewLocation("");
      setInterviewLink("");
      setInterviewDuration(45);
      setInterviewNotes("");
      setSendReminder(true);
      setShowPreview(false);
    } catch (error) {
      console.error("Erreur programmation entretien:", error);
      alert("❌ Erreur lors de la programmation de l'entretien");
    } finally {
      setScheduling(false);
    }
  };

  if (!show) return null;

  return (
    <div
      className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 30 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 30 }}
        transition={{ type: "spring", damping: 25 }}
        className="relative w-full max-w-2xl bg-white rounded-2xl shadow-2xl overflow-hidden"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header premium */}
        <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-6 py-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-14 h-14 bg-white/20 rounded-xl flex items-center justify-center">
                <CalendarIcon className="w-7 h-7 text-white" />
              </div>
              <div>
                <h3 className="text-white font-bold text-2xl tracking-tight">Programmer un entretien</h3>
                <p className="text-emerald-100 text-sm mt-1">
                  {candidateName || "Candidat"} • {offerTitle || "Offre"}
                </p>
              </div>
            </div>
            <button onClick={onClose} className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110">
              <XCircleIcon className="w-7 h-7" />
            </button>
          </div>
        </div>

        {/* Corps du formulaire */}
        <div className="p-6 space-y-5 max-h-[60vh] overflow-y-auto">
          {/* Date et Heure */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <CalendarIcon className="w-4 h-4 text-emerald-500" />
                Date <span className="text-red-500">*</span>
              </label>
              <input
                type="date"
                value={interviewDate}
                onChange={(e) => setInterviewDate(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <ClockIcon className="w-4 h-4 text-emerald-500" />
                Heure <span className="text-red-500">*</span>
              </label>
              <input
                type="time"
                value={interviewTime}
                onChange={(e) => setInterviewTime(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              />
            </div>
          </div>

          {/* Type d'entretien */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-3 flex items-center gap-2">
              <VideoCameraIcon className="w-4 h-4 text-emerald-500" />
              Type d'entretien
            </label>
            <div className="grid grid-cols-3 gap-3">
              {[
                { value: "video", label: "💻 Visioconférence", desc: "Lien Google Meet/Zoom" },
                { value: "onsite", label: "🏢 Présentiel", desc: "Entretien sur site" },
                { value: "phone", label: "📞 Téléphonique", desc: "Appel téléphonique" },
              ].map((type) => (
                <button
                  key={type.value}
                  type="button"
                  onClick={() => {
                    setInterviewType(type.value);
                    if (type.value === "phone") setInterviewLocation("Entretien téléphonique");
                    if (type.value === "video") setInterviewLocation("");
                  }}
                  className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                    interviewType === type.value
                      ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300"
                      : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                  }`}
                >
                  <div className="text-lg mb-1">{type.label.split(" ")[0]}</div>
                  <div className="text-xs opacity-80">{type.desc}</div>
                </button>
              ))}
            </div>
          </div>

          {/* Lieu (pour présentiel) */}
          {interviewType === "onsite" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <MapPinIcon className="w-4 h-4 text-emerald-500" />
                Adresse / Lieu <span className="text-red-500">*</span>
              </label>
              <input
                type="text"
                value={interviewLocation}
                onChange={(e) => setInterviewLocation(e.target.value)}
                placeholder="Ex: 123 rue de la République, Tunis, ou descriptif du lieu"
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                required
              />
            </div>
          )}

          {/* Lien visioconférence (pour visio) */}
          {interviewType === "video" && (
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                <LinkIcon className="w-4 h-4 text-emerald-500" />
                Lien de visioconférence
              </label>
              <input
                type="url"
                value={interviewLink}
                onChange={(e) => setInterviewLink(e.target.value)}
                placeholder="https://meet.google.com/... ou https://zoom.us/..."
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white"
              />
              <p className="text-xs text-gray-400 mt-1">Optionnel - sera inclus dans l'invitation</p>
            </div>
          )}

          {/* Durée */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ClockIcon className="w-4 h-4 text-emerald-500" />
              Durée estimée
            </label>
            <select
              value={interviewDuration}
              onChange={(e) => setInterviewDuration(parseInt(e.target.value))}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-gray-50 focus:bg-white"
            >
              <option value={15}>15 minutes</option>
              <option value={30}>30 minutes</option>
              <option value={45}>45 minutes</option>
              <option value={60}>1 heure</option>
              <option value={90}>1 heure 30</option>
              <option value={120}>2 heures</option>
            </select>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 text-emerald-500" />
              Notes / Instructions (optionnel)
            </label>
            <textarea
              value={interviewNotes}
              onChange={(e) => setInterviewNotes(e.target.value)}
              rows={3}
              placeholder="Informations complémentaires pour le candidat (préparation, documents à apporter, etc.)"
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 resize-none bg-gray-50 focus:bg-white"
            />
          </div>

          {/* Rappel */}
          <div className="flex items-center gap-3 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
            <input
              type="checkbox"
              id="sendReminder"
              checked={sendReminder}
              onChange={(e) => setSendReminder(e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded border-emerald-300 focus:ring-emerald-500"
            />
            <label htmlFor="sendReminder" className="text-sm text-emerald-700 flex items-center gap-2 cursor-pointer">
              <BellAlertIcon className="w-4 h-4" />
              Envoyer un rappel au candidat (24h avant)
            </label>
          </div>

          {/* Bouton Prévisualisation */}
          <div className="flex justify-end">
            <button
              type="button"
              onClick={() => setShowPreview(!showPreview)}
              className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
            >
              <EyeIcon className="w-4 h-4" />
              {showPreview ? "Masquer l'aperçu" : "Aperçu de l'email"}
            </button>
          </div>

          {/* Aperçu email */}
          {showPreview && interviewDate && interviewTime && (
            <div className="bg-gray-50 rounded-xl p-4 border border-gray-200">
              <p className="text-xs font-semibold text-gray-500 mb-2 flex items-center gap-1">
                <EnvelopeIcon className="w-3 h-3" />
                Aperçu de l'invitation
              </p>
              <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans bg-white p-3 rounded-lg border border-gray-100 max-h-64 overflow-y-auto">
                {getEmailPreview()}
              </pre>
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex gap-3">
          <button
            onClick={onClose}
            className="flex-1 px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium"
          >
            Annuler
          </button>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={handleSchedule}
            disabled={scheduling || !interviewDate || !interviewTime || (interviewType === "onsite" && !interviewLocation.trim())}
            className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
          >
            {scheduling ? (
              <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <CalendarIcon className="w-5 h-5" />
            )}
            {scheduling ? "Programmation en cours..." : "Envoyer l'invitation"}
          </motion.button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== TEST RESULT CARD ====================
export function TestResultCard({ testResult, onViewDetails, rank, onScheduleInterview }) {
  const { candidate_name, job_title, completed_at, id, result } = testResult;
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  const percentage = getTestPercentage(result);
  const qcmCorrect = result?.score ?? null;
  const qcmTotal = result?.qcm_count ?? result?.total ?? null;
  const colors = percentage !== null ? getScoreColor(percentage) : null;
  const medal = rank === 1 ? "🥇" : rank === 2 ? "🥈" : rank === 3 ? "🥉" : null;

  return (
    <>
      <motion.div
        layout
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        whileHover={{ y: -2 }}
        className={`bg-white rounded-xl border p-5 hover:shadow-lg transition ${
          rank && rank <= 3 ? "border-amber-200 shadow-sm" : "border-gray-100"
        }`}
      >
        <div className="flex items-start gap-4">
          <div className="relative shrink-0">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
              rank === 1 ? "bg-amber-50" :
              rank === 2 ? "bg-slate-100" :
              rank === 3 ? "bg-orange-50" :
              "bg-emerald-50"
            }`}>
              {medal || "📝"}
            </div>
            {rank && rank > 3 && (
              <div className="absolute -top-2 -right-2 w-5 h-5 rounded-full bg-gray-400 text-white text-[10px] font-bold flex items-center justify-center border-2 border-white shadow">
                {rank}
              </div>
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap mb-1">
              <h3 className="font-semibold text-gray-900">{candidate_name}</h3>
              {rank && rank <= 3 && (
                <span className={`text-xs font-bold px-2 py-0.5 rounded-full ${
                  rank === 1 ? "bg-amber-100 text-amber-700" :
                  rank === 2 ? "bg-slate-100 text-slate-600" :
                  "bg-orange-100 text-orange-700"
                }`}>
                  #{rank} du classement
                </span>
              )}
            </div>
            <p className="text-sm text-gray-500">{job_title}</p>
            <div className="flex items-center gap-2 mt-1 text-xs text-gray-400">
              <CalendarIcon className="w-3.5 h-3.5" />
              Complété le {new Date(completed_at).toLocaleDateString("fr-FR")}
            </div>

            {percentage !== null && colors ? (
              <div className={`mt-3 p-3 rounded-lg border ${colors.bg} ${colors.border}`}>
                <div className="flex items-center justify-between mb-1.5">
                  <span className="text-xs font-semibold text-gray-600">
                    Score au test
                    {qcmCorrect !== null && qcmTotal !== null && (
                      <span className="font-normal text-gray-400 ml-1">({qcmCorrect}/{qcmTotal} bonnes réponses)</span>
                    )}
                  </span>
                  <div className="flex items-center gap-1.5">
                    <span className={`text-sm font-bold ${colors.text}`}>{percentage}%</span>
                    <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${colors.bg} ${colors.text} border ${colors.border}`}>
                      {colors.label}
                    </span>
                  </div>
                </div>
                <div className="w-full h-2.5 bg-white/70 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${percentage}%` }}
                    transition={{ duration: 0.9, ease: "easeOut", delay: 0.1 }}
                    className={`h-full rounded-full ${colors.bar}`}
                  />
                </div>
              </div>
            ) : (
              <p className="mt-2 text-xs text-gray-400 italic">Score non disponible</p>
            )}
          </div>

          <div className="flex flex-col gap-2 shrink-0">
            <button
              onClick={(e) => { e.stopPropagation(); onViewDetails(id); }}
              className="px-4 py-2 text-sm font-medium bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition shadow-sm whitespace-nowrap"
            >
              Voir les réponses
            </button>

            <button
              onClick={(e) => { e.stopPropagation(); setShowInterviewModal(true); }}
              className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition shadow-sm whitespace-nowrap flex items-center gap-2"
            >
              <CalendarIcon className="w-4 h-4" />
              Inviter à l'entretien
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal entretien professionnel */}
      <InterviewSchedulerModal
        show={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSchedule={onScheduleInterview}
        candidateName={candidate_name}
        offerTitle={job_title}
        candidateId={testResult.candidate_details?.id}
        applicationId={id}
      />
    </>
  );
}

// ==================== OFFER TEST RESULTS GROUP ====================
export function OfferTestResultsGroup({ offer, testResults, onViewDetails, onScheduleInterview }) {
  const [open, setOpen] = useState(false);

  const sorted = useMemo(() => {
    return [...testResults].sort((a, b) => {
      const pa = getTestPercentage(a.result) ?? -1;
      const pb = getTestPercentage(b.result) ?? -1;
      return pb - pa;
    });
  }, [testResults]);

  const best = getTestPercentage(sorted[0]?.result);
  const average = testResults.length > 0
    ? Math.round(
        testResults.reduce((sum, r) => sum + (getTestPercentage(r.result) ?? 0), 0) / testResults.length
      )
    : null;

  if (testResults.length === 0) return null;

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
      <button
        className="w-full text-left px-6 py-4 hover:bg-gray-50 transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {offer.title?.charAt(0) || "O"}
            </div>
            <div>
              <h3 className="font-bold text-gray-900">{offer.title}</h3>
              <p className="text-sm text-gray-500">
                {testResults.length} candidat{testResults.length > 1 ? "s" : ""} — classés par score de test
              </p>
            </div>
          </div>

          <div className="hidden sm:flex items-center gap-3">
            {best !== null && (
              <div className="text-center px-3 py-1.5 bg-emerald-50 rounded-lg border border-emerald-100">
                <p className="text-xs text-gray-400">Meilleur</p>
                <p className={`text-sm font-bold ${getScoreColor(best).text}`}>{best}%</p>
              </div>
            )}
            {average !== null && (
              <div className="text-center px-3 py-1.5 bg-blue-50 rounded-lg border border-blue-100">
                <p className="text-xs text-gray-400">Moyenne</p>
                <p className={`text-sm font-bold ${getScoreColor(average).text}`}>{average}%</p>
              </div>
            )}
            <div className="text-center px-3 py-1.5 bg-gray-50 rounded-lg border border-gray-100">
              <p className="text-xs text-gray-400">Candidats</p>
              <p className="text-sm font-bold text-gray-700">{testResults.length}</p>
            </div>
          </div>

          {open ? <ChevronUpIcon className="w-5 h-5 text-gray-400 shrink-0" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400 shrink-0" />}
        </div>

        {average !== null && (
          <div className="mt-3 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div
                className={`h-full rounded-full transition-all ${getScoreColor(average).bar}`}
                style={{ width: `${average}%` }}
              />
            </div>
            <span className="text-xs text-gray-500 shrink-0">moy. {average}%</span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 pt-2 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-3 text-xs text-emerald-700 bg-emerald-50 border border-emerald-100 rounded-lg px-3 py-2">
                <span>🏆</span>
                Candidats classés du meilleur au moins bon score de test
              </div>
              <div className="space-y-3">
                {sorted.map((result, idx) => (
                  <TestResultCard
                    key={result.id}
                    testResult={result}
                    onViewDetails={onViewDetails}
                    rank={idx + 1}
                    onScheduleInterview={onScheduleInterview}
                  />
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== CANDIDATE CARD ====================
export function CandidateCard({ app, onStatusChange, onView, onViewTest, sendingTestId, onOpenTestEditor, scoreData, rank, onScheduleInterview }) {
  const name = app.candidate_details?.full_name || "Candidat";
  const email = app.candidate_details?.email || "—";
  const phone = app.candidate_details?.phone || "—";
  const skills = app.candidate_details?.skills || [];
  const edu = EDUCATION_LABELS[app.candidate_details?.education] || app.candidate_details?.education || "—";
  const exp = EXPERIENCE_LABELS[app.candidate_details?.experience] || app.candidate_details?.experience || "—";
  const linkedin = app.candidate_details?.linkedin || null;
  const cvUrl = app.candidate_details?.cv_url || null;
  const date = new Date(app.applied_at).toLocaleDateString("fr-FR", { day: "numeric", month: "short", year: "numeric" });

  const rawPhoto = app.candidate_details?.photo;
  const photoUrl = rawPhoto || null;
  const alreadySent = app.status === "interview" || (app.test_questions && app.test_questions.length > 0);
  const testCompleted = app.test_result && (app.test_result.percentage !== undefined || app.test_result.score !== undefined);

  const score = scoreData?.score ?? null;
  const scoreComment = scoreData?.comment ?? "";
  const scoringLoading = scoreData?.loading ?? false;
  const scoreColors = score !== null ? getScoreColor(score) : null;

  const [isInTalentPool, setIsInTalentPool] = useState(false);
  const [talentLoading, setTalentLoading] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);

  // Vérification talent pool (simplifiée)
  useState(() => {
    const checkTalentStatus = async () => {
      try {
        const isInPool = await isCandidateInTalentPool(app.candidate_details?.id);
        setIsInTalentPool(isInPool);
      } catch (error) {
        console.error("Erreur vérification talent pool:", error);
      }
    };
    if (app.candidate_details?.id) {
      checkTalentStatus();
    }
  }, [app.candidate_details?.id]);

  const handleAddToTalentPool = async () => {
    setTalentLoading(true);
    try {
      const reason = `Ajouté depuis la candidature pour ${app.job_details?.title || "offre"} - Score: ${score || "N/A"}`;
      await addToTalentPool(app.candidate_details.id, reason, score || 0);
      setIsInTalentPool(true);
      alert("✅ Candidat ajouté à votre base de talents !");
    } catch (error) {
      console.error("Erreur ajout à la base de talents:", error);
      alert("❌ Erreur lors de l'ajout à la base de talents");
    } finally {
      setTalentLoading(false);
    }
  };

  const handleRemoveFromTalentPool = async () => {
    setTalentLoading(true);
    try {
      await removeFromTalentPool(app.candidate_details.id);
      setIsInTalentPool(false);
      alert("✅ Candidat retiré de votre base de talents");
    } catch (error) {
      console.error("Erreur retrait de la base de talents:", error);
      alert("❌ Erreur lors du retrait de la base de talents");
    } finally {
      setTalentLoading(false);
    }
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        layout
        className="bg-white border border-gray-100 rounded-xl p-5 hover:shadow-md transition"
      >
        <div className="flex flex-col md:flex-row md:items-start gap-4">
          <div className="relative shrink-0">
            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
              {photoUrl ? (
                <img
                  src={photoUrl}
                  alt={name}
                  className="w-full h-full object-cover"
                  onError={e => {
                    e.target.onerror = null;
                    e.target.style.display = "none";
                    e.target.parentElement.classList.add("bg-gradient-to-br", "from-emerald-500", "to-teal-600", "flex", "items-center", "justify-center");
                    e.target.parentElement.innerHTML = `<span class="text-white font-bold text-lg">${name.charAt(0)}</span>`;
                  }}
                />
              ) : (
                <div className="w-full h-full bg-gradient-to-br from-emerald-500 to-teal-600 flex items-center justify-center">
                  <span className="text-white font-bold text-lg">{name.charAt(0)}</span>
                </div>
              )}
            </div>
            {rank !== undefined && rank !== null && (
              <div className={`absolute -top-2 -right-2 w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold border-2 border-white shadow-md ${
                rank === 1 ? "bg-amber-400 text-white" :
                rank === 2 ? "bg-slate-400 text-white" :
                rank === 3 ? "bg-amber-700 text-white" :
                "bg-gray-400 text-white"
              }`}>
                {rank}
              </div>
            )}
            {scoringLoading && (
              <div className="absolute -top-1 -right-1 w-4 h-4 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
            )}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <h4 className="font-semibold text-gray-900">{name}</h4>
              <StatusBadge status={app.status} />
              {isInTalentPool && (
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium bg-amber-100 text-amber-700">
                  <StarIcon className="w-3 h-3" />
                  Talent
                </span>
              )}
            </div>

            {score !== null && scoreColors && (
              <div className={`mt-2 p-2.5 rounded-lg border ${scoreColors.bg} ${scoreColors.border}`}>
                <div className="flex items-center gap-3 mb-1">
                  <span className="text-xs font-semibold text-gray-600 shrink-0">Compatibilité IA</span>
                  <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      animate={{ width: `${score}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                      className={`h-full rounded-full ${scoreColors.bar}`}
                    />
                  </div>
                  <span className={`text-sm font-bold shrink-0 ${scoreColors.text}`}>{score}%</span>
                </div>
                {scoreComment && (
                  <p className="text-xs text-gray-500 italic">"{scoreComment}"</p>
                )}
              </div>
            )}

            <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-sm text-gray-600">
              <span className="flex items-center gap-1 truncate"><EnvelopeIcon className="w-4 h-4 text-emerald-500 shrink-0" />{email}</span>
              <span className="flex items-center gap-1"><PhoneIcon className="w-4 h-4 text-emerald-500 shrink-0" />{phone}</span>
              <span className="flex items-center gap-1"><BriefcaseIcon className="w-4 h-4 text-emerald-500 shrink-0" />Exp : {exp}</span>
              <span className="flex items-center gap-1"><AcademicCapIcon className="w-4 h-4 text-emerald-500 shrink-0" />{edu}</span>
              <span className="flex items-center gap-1 col-span-2 text-xs text-gray-400"><ClockIcon className="w-3.5 h-3.5" />Postulé le {date}</span>
            </div>

            {skills.length > 0 && (
              <div className="flex flex-wrap gap-1 mt-2">
                {skills.slice(0, 5).map((s, i) => (
                  <span key={i} className="px-2 py-0.5 bg-emerald-50 text-emerald-700 rounded-md text-xs">{s}</span>
                ))}
                {skills.length > 5 && (
                  <span className="px-2 py-0.5 bg-gray-100 text-gray-500 rounded-md text-xs">+{skills.length - 5}</span>
                )}
              </div>
            )}

            <div className="flex flex-wrap gap-2 mt-3">
              {cvUrl && (
                <a href={cvUrl} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-blue-50 text-blue-700 border border-blue-200 rounded-lg text-xs font-medium hover:bg-blue-100 transition"
                  onClick={e => e.stopPropagation()}>
                  📄 Voir le CV
                </a>
              )}
              {linkedin && (
                <a href={linkedin} target="_blank" rel="noopener noreferrer"
                  className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-sky-50 text-sky-700 border border-sky-200 rounded-lg text-xs font-medium hover:bg-sky-100 transition"
                  onClick={e => e.stopPropagation()}>
                  🔗 LinkedIn
                </a>
              )}
            </div>
          </div>

          <div className="flex flex-row md:flex-col gap-2 shrink-0">
            <button onClick={() => onView(app)}
              className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition">
              Voir profil
            </button>

            {testCompleted && (
              <button
                onClick={() => onViewTest(app.id)}
                className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-lg hover:bg-emerald-100 transition flex items-center gap-1"
              >
                <ClipboardDocumentListIcon className="w-3.5 h-3.5" />
                Voir les réponses
              </button>
            )}

            {alreadySent ? (
              <div className="px-3 py-1.5 text-xs font-medium bg-emerald-50 text-emerald-600 border border-emerald-200 rounded-lg text-center flex items-center gap-1">
                <CheckCircleIcon className="w-3.5 h-3.5" />
                Test envoyé
              </div>
            ) : (
              <button
                onClick={() => onOpenTestEditor(app)}
                disabled={sendingTestId === app.id}
                className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-lg hover:from-indigo-700 hover:to-violet-700 shadow-sm transition disabled:opacity-50"
              >
                {sendingTestId === app.id ? (
                  <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SparklesIcon className="w-3.5 h-3.5" />
                )}
                {sendingTestId === app.id ? "Génération..." : "Générer test IA"}
              </button>
            )}

            {/* Bouton Programmer entretien */}
            <button
              onClick={() => setShowInterviewModal(true)}
              className="flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 shadow-sm transition"
            >
              <CalendarIcon className="w-3.5 h-3.5" />
              Programmer entretien
            </button>

            <button
              onClick={isInTalentPool ? handleRemoveFromTalentPool : handleAddToTalentPool}
              disabled={talentLoading}
              className={`flex items-center justify-center gap-1.5 px-3 py-1.5 text-xs font-semibold rounded-lg transition ${
                isInTalentPool
                  ? "bg-amber-100 text-amber-700 border border-amber-200 hover:bg-amber-200"
                  : "bg-gray-100 text-gray-600 border border-gray-200 hover:bg-amber-50 hover:text-amber-600"
              }`}
            >
              {talentLoading ? (
                <div className="w-3.5 h-3.5 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <StarIcon className="w-3.5 h-3.5" />
              )}
              {isInTalentPool ? "Retirer de la base" : "Ajouter à la base"}
            </button>
          </div>
        </div>
      </motion.div>

      {/* Modal entretien professionnel */}
      <InterviewSchedulerModal
        show={showInterviewModal}
        onClose={() => setShowInterviewModal(false)}
        onSchedule={onScheduleInterview}
        candidateName={name}
        offerTitle={app.job_details?.title || "Offre"}
        candidateId={app.candidate_details?.id}
        applicationId={app.id}
      />
    </>
  );
}

// ==================== OFFER GROUP ====================
export function OfferGroup({ offer, applications, onStatusChange, onView, onViewTest, sendingTestId, onOpenTestEditor, scores, scoresDone, scoringAll, scoredCount, scoringError, onCalculateScores, onScheduleInterview }) {
  const [open, setOpen] = useState(false);
  const [filter, setFilter] = useState("all");

  const counts = {
    all: applications.length,
    pending: applications.filter(a => a.status === "pending").length,
    interview: applications.filter(a => a.status === "interview").length,
    accepted: applications.filter(a => a.status === "accepted").length,
    rejected: applications.filter(a => a.status === "rejected").length,
    interview_scheduled: applications.filter(a => a.status === "interview_scheduled").length,
  };
  const pct = counts.all > 0 ? Math.round((counts.accepted / counts.all) * 100) : 0;

  const getSortedApps = (apps) => {
    if (!scoresDone) return apps;
    return [...apps].sort((a, b) => {
      const sa = scores[a.id]?.score ?? -1;
      const sb = scores[b.id]?.score ?? -1;
      return sb - sa;
    });
  };

  const filtered = filter === "all" ? applications : applications.filter(a => a.status === filter);
  const visible = getSortedApps(filtered);

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
      <button className="w-full text-left px-6 py-5 hover:bg-gray-50 transition" onClick={() => setOpen(!open)}>
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-slate-700 to-emerald-700 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {offer.title?.charAt(0) || "O"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base">{offer.title}</h3>
                <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                  offer.status === "active" ? "bg-green-100 text-green-700" :
                  offer.status === "draft" ? "bg-gray-100 text-gray-600" :
                  "bg-red-100 text-red-600"
                }`}>
                  {offer.status === "active" ? "Active" : offer.status === "draft" ? "Brouillon" : "Fermée"}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{offer.location}</span>
                <span className="flex items-center gap-1"><BriefcaseIcon className="w-3.5 h-3.5" />{offer.contract_type}</span>
                {offer.salary_min && (
                  <span className="flex items-center gap-1"><CurrencyDollarIcon className="w-3.5 h-3.5" />{offer.salary_min}–{offer.salary_max} TND</span>
                )}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="flex gap-2">
              {counts.pending > 0 && <span className="text-xs text-gray-600 font-medium">⏳ {counts.pending}</span>}
              {counts.interview > 0 && <span className="text-xs text-gray-600 font-medium">🤝 {counts.interview}</span>}
              {counts.accepted > 0 && <span className="text-xs text-gray-600 font-medium">✅ {counts.accepted}</span>}
              {counts.interview_scheduled > 0 && <span className="text-xs text-purple-600 font-medium">📅 {counts.interview_scheduled}</span>}
            </div>
            <div className="text-center px-4 py-2 bg-emerald-50 rounded-xl">
              <p className="text-lg font-bold text-emerald-700">{counts.all}</p>
              <p className="text-xs text-gray-500">candidat{counts.all > 1 ? "s" : ""}</p>
            </div>
            {open ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
          </div>
        </div>
        {counts.all > 0 && (
          <div className="mt-4 flex items-center gap-3">
            <div className="flex-1 h-1.5 bg-gray-100 rounded-full overflow-hidden">
              <div className="h-full bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-full transition-all" style={{ width: `${pct}%` }} />
            </div>
            <span className="text-xs text-gray-500 shrink-0">{pct}% accepté</span>
          </div>
        )}
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-gray-100 pt-4">
              {counts.all > 0 && (
                <div className="flex flex-wrap items-center gap-2 mb-4">
                  {[
                    { key: "all", label: `Tous (${counts.all})` },
                    { key: "pending", label: `⏳ En attente (${counts.pending})` },
                    { key: "interview", label: `🤝 Test (${counts.interview})` },
                    { key: "accepted", label: `✅ Acceptés (${counts.accepted})` },
                    { key: "rejected", label: `❌ Refusés (${counts.rejected})` },
                    { key: "interview_scheduled", label: `📅 Entretien (${counts.interview_scheduled})` },
                  ].filter(({ key }) => counts[key] > 0 || key === "all").map(({ key, label }) => (
                    <button key={key}
                      onClick={(e) => { e.stopPropagation(); setFilter(key); }}
                      className={`px-3 py-1 rounded-lg text-xs font-medium transition ${
                        filter === key ? "bg-emerald-600 text-white" : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                      }`}
                    >
                      {label}
                    </button>
                  ))}
                  <button
                    onClick={onCalculateScores}
                    disabled={scoringAll}
                    className={`ml-auto flex items-center gap-2 px-4 py-1.5 rounded-lg text-xs font-semibold transition ${
                      scoringAll
                        ? "bg-purple-100 text-purple-400 cursor-not-allowed"
                        : scoresDone
                        ? "bg-purple-100 text-purple-700 hover:bg-purple-200"
                        : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow"
                    }`}
                  >
                    {scoringAll ? (
                      <>
                        <div className="w-3.5 h-3.5 border-2 border-purple-400 border-t-transparent rounded-full animate-spin" />
                        {scoredCount}/{counts.all} analysés...
                      </>
                    ) : scoresDone ? (
                      <>
                        <ArrowPathIcon className="w-3.5 h-3.5" />
                        Recalculer les scores
                      </>
                    ) : (
                      <>
                        <SparklesIcon className="w-3.5 h-3.5" />
                        Classer par score IA
                      </>
                    )}
                  </button>
                </div>
              )}
              {scoringError && <p className="text-xs text-red-500 mb-3">{scoringError}</p>}
              {scoresDone && (
                <div className="flex items-center gap-2 mb-3 text-xs text-purple-600 bg-purple-50 border border-purple-100 rounded-lg px-3 py-2">
                  <SparklesIcon className="w-3.5 h-3.5 shrink-0" />
                  Candidats classés du meilleur au moins bon score de compatibilité IA
                </div>
              )}
              {visible.length === 0 ? (
                <div className="text-center py-8 text-gray-400">
                  <UserGroupIcon className="w-10 h-10 mx-auto mb-2 opacity-40" />
                  <p className="text-sm">Aucun candidat pour ce filtre</p>
                </div>
              ) : (
                <div className="space-y-3">
                  {visible.map((app, idx) => (
                    <CandidateCard
                      key={app.id}
                      app={app}
                      onStatusChange={onStatusChange}
                      onView={onView}
                      onViewTest={onViewTest}
                      sendingTestId={sendingTestId}
                      onOpenTestEditor={onOpenTestEditor}
                      scoreData={scores[app.id] || null}
                      rank={scoresDone && scores[app.id]?.score !== null ? idx + 1 : null}
                      onScheduleInterview={onScheduleInterview}
                    />
                  ))}
                </div>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}