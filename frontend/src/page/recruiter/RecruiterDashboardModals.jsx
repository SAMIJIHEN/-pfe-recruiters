// frontend/src/page/recruiter/RecruiterDashboardModals.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ VERSION PROFESSIONNELLE - MODAL D'ENTRETIEN AVEC DESIGN PREMIUM
// ✅ SECTION CV SUPPRIMÉE (TÉLÉCHARGEMENT CV ÉLIMINÉ)
// ✅ TOUTES LES FONCTIONNALITÉS CONSERVÉES
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  XCircleIcon,
  ClipboardDocumentListIcon,
  SparklesIcon,
  CodeBracketIcon,
  CheckCircleIcon,
  BriefcaseIcon,
  MapPinIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  StarIcon,
  DocumentTextIcon,
  ArrowPathIcon,
  CalendarIcon,
  LinkIcon,
  VideoCameraIcon,
  BuildingOfficeIcon,
  ClockIcon,
  BellAlertIcon,
  MapPinIcon as LocationIcon,
  UserGroupIcon,
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
} from "@heroicons/react/24/outline";
import { EDUCATION_LABELS, EXPERIENCE_LABELS, getTestPercentage } from "./RecruiterDashboardUtils";

// ==================== TEST ANSWERS MODAL ====================
export function TestAnswersModal({ test, onClose }) {
  if (!test) return null;

  const { questions, result, candidate_name, job_title } = test;

  if (!questions || questions.length === 0) {
    return (
      <div style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", background: "rgba(0,0,0,0.8)" }}>
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
          <ClipboardDocumentListIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune réponse disponible</h3>
          <p className="text-gray-500 mb-4">Le candidat n'a pas encore complété le test.</p>
          <button onClick={onClose} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">Fermer</button>
        </div>
      </div>
    );
  }

  const rawAnswers = result?.answers || [];
  const details = result?.details || [];
  const aiAnalysis = result?.ai_analysis || {};
  const questionScoresIA = result?.question_scores_ia || aiAnalysis?.question_scores || [];

  const getIAFeedbackForQuestion = (questionIndex) => {
    const found = questionScoresIA.find(q => q.question_index === questionIndex + 1);
    return found || null;
  };

  const extractAnswerText = (value) => {
    if (!value) return null;
    if (typeof value === "string") return value;
    if (typeof value === "object") {
      if (value.code !== undefined) return value.code;
      if (value.text !== undefined) return value.text;
      if (value.answer !== undefined) return value.answer;
      return JSON.stringify(value);
    }
    return String(value);
  };

  return (
    <div style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.9, opacity: 0, y: 20 }}
        className="w-full max-w-4xl max-h-[90vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
      >
        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 px-6 py-5 shrink-0">
          <div className="flex items-center justify-between">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <ClipboardDocumentListIcon className="w-6 h-6 text-emerald-200" />
                <h2 className="text-white font-bold text-xl">Réponses du candidat</h2>
              </div>
              <p className="text-emerald-100 text-sm">{candidate_name} • {job_title}</p>
            </div>
            <button onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition text-white">
              <XCircleIcon className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50">
          {questions.map((q, idx) => {
            const isOpenEnded = q.is_open_ended === true;
            const isCodeQuestion = q.is_code_question === true;
            const iaFeedback = getIAFeedbackForQuestion(idx);
            
            let selectedText = null;
            let selectedIndex = null;
            let isCorrect = null;

            if (details[idx]) {
              if (details[idx].selected_text) {
                selectedText = extractAnswerText(details[idx].selected_text);
              }
              if (details[idx].selected_index !== undefined) {
                selectedIndex = details[idx].selected_index;
              }
              if (details[idx].is_correct !== undefined) {
                isCorrect = details[idx].is_correct;
              }
            } 
            else if (rawAnswers[idx] !== undefined) {
              const answer = rawAnswers[idx];
              if (isOpenEnded || isCodeQuestion) {
                selectedText = extractAnswerText(answer);
              } else {
                selectedIndex = answer;
                isCorrect = (selectedIndex === q.correct_index);
              }
            }

            if (isCodeQuestion && selectedText && typeof selectedText === "object") {
              selectedText = selectedText.code || selectedText.text || JSON.stringify(selectedText);
            }

            return (
              <div key={idx} className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
                <div className={`px-5 py-3 border-b flex items-center justify-between ${
                  isCodeQuestion ? "bg-gray-800 border-gray-700" : "bg-gray-50 border-gray-200"
                }`}>
                  <div className="flex items-center gap-3 flex-wrap">
                    <span className="flex-shrink-0 w-7 h-7 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center text-sm font-semibold">
                      {idx + 1}
                    </span>
                    <span className={`font-medium ${isCodeQuestion ? "text-white" : "text-gray-800"} flex-1`}>
                      {q.question}
                    </span>
                    {!isOpenEnded && !isCodeQuestion && (
                      <span className={`text-xs font-medium px-2 py-1 rounded-full ${isCorrect ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700'}`}>
                        {isCorrect ? '✓ Correcte' : '✗ Incorrecte'}
                      </span>
                    )}
                    {isOpenEnded && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-amber-100 text-amber-700">✏️ Question ouverte</span>
                    )}
                    {isCodeQuestion && (
                      <span className="text-xs font-medium px-2 py-1 rounded-full bg-purple-100 text-purple-700">💻 Code {q.language || "python"}</span>
                    )}
                    {iaFeedback && iaFeedback.score !== undefined && (
                      <span className={`text-xs font-bold px-2 py-1 rounded-full ${
                        iaFeedback.score >= 80 ? "bg-emerald-100 text-emerald-700" :
                        iaFeedback.score >= 60 ? "bg-blue-100 text-blue-700" :
                        iaFeedback.score >= 40 ? "bg-amber-100 text-amber-700" :
                        "bg-red-100 text-red-700"
                      }`}>
                        Score IA: {iaFeedback.score}%
                      </span>
                    )}
                  </div>
                </div>

                <div className="p-4">
                  {isCodeQuestion ? (
                    <div className="space-y-3">
                      <div className="bg-gray-900 rounded-lg overflow-hidden">
                        <div className="bg-gray-800 px-4 py-2 text-xs text-gray-400 font-mono border-b border-gray-700 flex items-center justify-between">
                          <span className="flex items-center gap-2"><CodeBracketIcon className="w-4 h-4 text-emerald-400" />Réponse du candidat</span>
                          <span className="text-gray-500">{q.language || "python"}</span>
                        </div>
                        <pre className="p-4 text-gray-300 text-sm font-mono overflow-x-auto whitespace-pre-wrap">
                          {selectedText && selectedText.trim() !== "" ? selectedText : "Aucune réponse fournie"}
                        </pre>
                      </div>
                      {q.test_cases && q.test_cases.length > 0 && (
                        <div className="mt-3 bg-gray-50 rounded-lg p-3 border border-gray-200">
                          <p className="text-xs font-semibold text-gray-600 mb-2">📋 Tests unitaires :</p>
                          <div className="space-y-1">
                            {q.test_cases.map((tc, tcIdx) => (
                              <div key={tcIdx} className="text-xs font-mono text-gray-500">Input: {JSON.stringify(tc.input)} → Expected: {JSON.stringify(tc.expected)}</div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  ) : !isOpenEnded ? (
                    <div className="space-y-2">
                      {q.options.map((option, optIdx) => {
                        const optionLetter = String.fromCharCode(65 + optIdx);
                        const isCorrectOpt = q.correct_index === optIdx;
                        const isSelected = selectedIndex === optIdx;
                        let bgColor = "bg-white";
                        let borderColor = "border-gray-200";
                        if (isCorrectOpt) {
                          bgColor = "bg-emerald-50";
                          borderColor = "border-emerald-300";
                        } else if (isSelected) {
                          bgColor = "bg-red-50";
                          borderColor = "border-red-300";
                        }
                        return (
                          <div key={optIdx} className={`flex items-start gap-3 p-3 rounded-lg border transition-all ${bgColor} ${borderColor}`}>
                            <span className={`flex-shrink-0 w-6 h-6 rounded-full flex items-center justify-center text-xs font-semibold ${
                              isCorrectOpt ? 'bg-emerald-500 text-white' : isSelected ? 'bg-red-500 text-white' : 'bg-gray-100 text-gray-600'
                            }`}>
                              {optionLetter}
                            </span>
                            <span className="flex-1 text-gray-700">{option}</span>
                            {isCorrectOpt && <span className="flex-shrink-0 text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full">✓ Bonne réponse</span>}
                            {isSelected && !isCorrectOpt && <span className="flex-shrink-0 text-xs bg-red-100 text-red-700 px-2 py-1 rounded-full">✗ Réponse du candidat</span>}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="space-y-3">
                      <div className="bg-amber-50 rounded-lg p-4 border border-amber-200">
                        <p className="text-sm font-medium text-amber-800 mb-2 flex items-center gap-2"><span>📝</span> Réponse du candidat :</p>
                        <div className="bg-white rounded-lg p-4 border border-gray-200">
                          <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">{selectedText && selectedText.trim() !== "" ? selectedText : "Aucune réponse fournie"}</p>
                        </div>
                        <div className="text-xs text-gray-400 flex justify-end mt-2">{selectedText?.length || 0} caractères</div>
                      </div>
                    </div>
                  )}

                  {iaFeedback && (
                    <div className="mt-4 space-y-2">
                      {iaFeedback.feedback && (
                        <div className="p-3 bg-blue-50 rounded-lg border border-blue-200">
                          <p className="text-xs font-semibold text-blue-700 mb-1 flex items-center gap-1"><SparklesIcon className="w-3.5 h-3.5" />Analyse IA :</p>
                          <p className="text-sm text-blue-800">{iaFeedback.feedback}</p>
                        </div>
                      )}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                        {iaFeedback.strengths && iaFeedback.strengths.length > 0 && (
                          <div className="p-2 bg-green-50 rounded-lg border border-green-200">
                            <p className="text-xs font-semibold text-green-700 mb-1">✅ Points forts :</p>
                            <ul className="text-xs text-green-700 list-disc list-inside">{iaFeedback.strengths.map((s, i) => (<li key={i}>{s}</li>))}</ul>
                          </div>
                        )}
                        {iaFeedback.weaknesses && iaFeedback.weaknesses.length > 0 && (
                          <div className="p-2 bg-red-50 rounded-lg border border-red-200">
                            <p className="text-xs font-semibold text-red-700 mb-1">⚠️ Axes d'amélioration :</p>
                            <ul className="text-xs text-red-700 list-disc list-inside">{iaFeedback.weaknesses.map((w, i) => (<li key={i}>{w}</li>))}</ul>
                          </div>
                        )}
                      </div>
                      {iaFeedback.suggestions && iaFeedback.suggestions.length > 0 && (
                        <div className="p-2 bg-purple-50 rounded-lg border border-purple-200">
                          <p className="text-xs font-semibold text-purple-700 mb-1">💡 Suggestions d'amélioration :</p>
                          <ul className="text-xs text-purple-700 list-disc list-inside">{iaFeedback.suggestions.map((sug, i) => (<li key={i}>{sug}</li>))}</ul>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>

        <div className="bg-white border-t border-gray-200 px-6 py-4 flex justify-end shrink-0">
          <button onClick={onClose} className="px-5 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium">Fermer</button>
        </div>
      </motion.div>
    </div>
  );
}

// ==================== TEST EDITOR MODAL ====================
export function TestEditorModal({ app, onClose, onSendSuccess, RecruiterTestEditor }) {
  if (!app) return null;
  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 999999, display: "flex", alignItems: "center", justifyContent: "center", padding: "1rem", background: "rgba(0,0,0,0.8)", backdropFilter: "blur(8px)" }}
      onClick={onClose}
    >
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        transition={{ duration: 0.2 }}
        className="w-full max-w-6xl max-h-[92vh] overflow-hidden bg-white rounded-2xl shadow-2xl flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 shrink-0">
          <div className="flex items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1"><SparklesIcon className="w-6 h-6 text-indigo-100" /><h2 className="text-white font-bold text-xl">Génération du test IA</h2></div>
              <p className="text-indigo-100 text-sm">{app.candidate_details?.full_name || "Candidat"} • {app.job_details?.title || "Offre"}</p>
            </div>
            <button type="button" onClick={onClose} className="p-2 hover:bg-white/20 rounded-lg transition text-white"><XCircleIcon className="w-6 h-6" /></button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto bg-gray-50">
          <RecruiterTestEditor
            applicationId={app.id}
            offerTitle={app.job_details?.title || "Offre"}
            offerDescription={app.job_details?.description || ""}
            requiredSkills={app.job_details?.skills_required || []}
            onClose={onClose}
            onSend={onSendSuccess}
          />
        </div>
      </motion.div>
    </div>
  );
}

// ==================== CANDIDATE PROFILE MODAL (AVEC MODAL ENTRETIEN PRO - SANS CV) ====================
export function CandidateProfileModal({ app, onClose, onStatusChange, onScheduleInterview, onAddToTalentPool, isInTalentPool }) {
  const [newStatus, setNewStatus] = useState(app.status);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [showInterviewModal, setShowInterviewModal] = useState(false);
  
  // ✅ CHAMPS ENTRETIEN PROFESSIONNELS
  const [interviewDate, setInterviewDate] = useState("");
  const [interviewTime, setInterviewTime] = useState("");
  const [interviewType, setInterviewType] = useState("video");
  const [interviewLocation, setInterviewLocation] = useState("");
  const [interviewLink, setInterviewLink] = useState("");
  const [interviewDuration, setInterviewDuration] = useState(45);
  const [interviewNotes, setInterviewNotes] = useState("");
  const [sendReminder, setSendReminder] = useState(true);
  const [schedulingInterview, setSchedulingInterview] = useState(false);
  const [addingToTalentPool, setAddingToTalentPool] = useState(false);
  const [showPreview, setShowPreview] = useState(false);

  const candidate = app.candidate_details;
  const job = app.job_details;

  // ✅ SEULE LA PHOTO EST CONSERVÉE (PLUS DE CV)
  let photoUrl = candidate?.photo_url || null;

  if (photoUrl && photoUrl.includes('/media/media/')) {
    photoUrl = photoUrl.replace('/media/media/', '/media/');
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Non spécifiée";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  const handleStatusUpdate = async () => {
    if (newStatus === app.status) return;
    setUpdatingStatus(true);
    try {
      await onStatusChange(app.id, newStatus);
      onClose();
    } catch (error) {
      console.error("Erreur mise à jour statut:", error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  // ✅ ENVOI ENTRETIEN PROFESSIONNEL
  const handleScheduleInterview = async () => {
    if (!interviewDate || !interviewTime) {
      alert("Veuillez sélectionner une date et une heure");
      return;
    }

    // Construction du lieu selon le type d'entretien
    let finalLocation = interviewLocation;
    if (interviewType === "video" && interviewLink) {
      finalLocation = `Visioconférence: ${interviewLink}`;
    } else if (interviewType === "onsite" && !interviewLocation.trim()) {
      alert("Veuillez indiquer l'adresse du lieu d'entretien");
      return;
    } else if (interviewType === "phone" && !interviewLocation.trim()) {
      finalLocation = "Entretien téléphonique";
    }

    setSchedulingInterview(true);
    try {
      await onScheduleInterview(app.id, {
        interview_date: interviewDate,
        interview_time: interviewTime,
        interview_type: interviewType,
        interview_location: finalLocation,
        interview_link: interviewLink,
        interview_duration: interviewDuration,
        interview_notes: interviewNotes,
        send_reminder: sendReminder,
      });
      setShowInterviewModal(false);
      setInterviewDate("");
      setInterviewTime("");
      setInterviewType("video");
      setInterviewLocation("");
      setInterviewLink("");
      setInterviewDuration(45);
      setInterviewNotes("");
      setSendReminder(true);
      onClose();
    } catch (error) {
      console.error("Erreur programmation entretien:", error);
      alert("❌ Erreur lors de la programmation de l'entretien");
    } finally {
      setSchedulingInterview(false);
    }
  };

  const handleAddToTalentPool = async () => {
    setAddingToTalentPool(true);
    try {
      await onAddToTalentPool(app.candidate_details.id);
      alert("✅ Candidat ajouté à votre base de talents !");
    } catch (error) {
      console.error("Erreur ajout à la base de talents:", error);
      alert("❌ Erreur lors de l'ajout à la base de talents");
    } finally {
      setAddingToTalentPool(false);
    }
  };

  const statusOptions = [
    { value: "pending", label: "En attente", icon: "⏳", color: "bg-amber-100 text-amber-700" },
    { value: "reviewed", label: "Examinée", icon: "👀", color: "bg-blue-100 text-blue-700" },
    { value: "interview", label: "Test en attente", icon: "📝", color: "bg-purple-100 text-purple-700" },
    { value: "accepted", label: "Acceptée", icon: "✅", color: "bg-green-100 text-green-700" },
    { value: "rejected", label: "Refusée", icon: "❌", color: "bg-red-100 text-red-700" },
    { value: "interview_scheduled", label: "Entretien programmé", icon: "📅", color: "bg-indigo-100 text-indigo-700" },
  ];

  const currentStatus = statusOptions.find(s => s.value === app.status) || statusOptions[0];
  const canScheduleInterview = app.status !== "interview_scheduled" && app.status !== "rejected" && app.status !== "accepted";

  // ✅ PRÉVISUALISATION DE L'EMAIL D'INVITATION
  const getEmailPreview = () => {
    const formattedDateTime = interviewDate && interviewTime 
      ? new Date(`${interviewDate}T${interviewTime}`).toLocaleString("fr-FR", {
          weekday: "long", day: "numeric", month: "long", year: "numeric", hour: "2-digit", minute: "2-digit"
        })
      : "Date à confirmer";
    
    let locationText = "";
    if (interviewType === "video") {
      locationText = interviewLink ? `🔗 Lien de visioconférence : ${interviewLink}` : "Lien de visioconférence sera communiqué ultérieurement";
    } else if (interviewType === "onsite") {
      locationText = `📍 Adresse : ${interviewLocation}`;
    } else {
      locationText = "📞 Entretien téléphonique";
    }

    return [
      "Objet: Invitation à un entretien",
      `Bonjour ${candidate?.full_name || "Candidat"},`,
      "",
      `Suite à l'analyse de votre candidature pour le poste de ${job?.title || "notre offre"}, nous sommes heureux de vous inviter à un entretien.`,
      "",
      `📅 Date : ${formattedDateTime}`,
      `⏱️ Durée : ${interviewDuration} minutes`,
      `📋 Type : ${interviewType === "video" ? "Visioconférence" : interviewType === "onsite" ? "Présentiel" : "Téléphonique"}`,
      locationText,
      "",
      interviewNotes ? `📝 Informations complémentaires :\n${interviewNotes}\n` : "",
      "Nous restons à votre disposition pour toute information complémentaire.",
      "",
      "Cordialement,",
      `L'équipe RH - ${job?.recruiter?.company_name || "Notre entreprise"}`
    ].join("\n");
  };

  return (
    <>
      <div
        className="fixed inset-0 z-[100000] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 20 }}
          transition={{ duration: 0.2 }}
          className="relative w-full max-w-4xl max-h-[90vh] overflow-y-auto bg-white rounded-2xl shadow-2xl"
          onClick={(e) => e.stopPropagation()}
        >
          <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-t-2xl">
            <div className="relative px-8 pt-8 pb-20">
              <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32 blur-3xl" />
              <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24 blur-3xl" />
              
              <button onClick={onClose} className="absolute top-4 right-4 text-white/60 hover:text-white transition z-10"><XCircleIcon className="w-8 h-8" /></button>

              <div className="relative flex flex-col md:flex-row md:items-center gap-6">
                <div className="relative">
                  <div className="w-24 h-24 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur border-2 border-white/30 shadow-xl overflow-hidden">
                    {photoUrl ? (
                      <img src={photoUrl} alt={candidate?.full_name} className="w-full h-full object-cover" />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white text-3xl font-bold">{candidate?.full_name?.charAt(0) || "C"}</div>
                    )}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-white flex items-center justify-center"><CheckCircleIcon className="w-4 h-4 text-white" /></div>
                </div>

                <div>
                  <h1 className="text-3xl font-bold text-white mb-2">{candidate?.full_name || "Candidat"}</h1>
                  <div className="flex flex-wrap items-center gap-3">
                    <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold ${currentStatus.color}`}>{currentStatus.icon} {currentStatus.label}</span>
                    {candidate?.title && <span className="text-emerald-100 flex items-center gap-1"><BriefcaseIcon className="w-4 h-4" />{candidate.title}</span>}
                    {candidate?.location && <span className="text-emerald-100 flex items-center gap-1"><MapPinIcon className="w-4 h-4" />{candidate.location}</span>}
                  </div>
                  <p className="text-emerald-100 mt-2">Postulé le {formatDate(app.applied_at)} • {job?.title || "Offre"}</p>
                </div>
              </div>
            </div>
          </div>

          <div className="px-8 py-6 space-y-6">
            {/* Contact */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2"><EnvelopeIcon className="w-5 h-5 text-emerald-600" /><h2 className="text-lg font-semibold text-gray-800">Contact</h2></div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="flex items-center gap-2 text-gray-600"><EnvelopeIcon className="w-4 h-4 text-emerald-500" /><span>{candidate?.email || "Email non disponible"}</span></div>
                  <div className="flex items-center gap-2 text-gray-600"><PhoneIcon className="w-4 h-4 text-emerald-500" /><span>{candidate?.phone || "Téléphone non disponible"}</span></div>
                  {candidate?.linkedin && (
                    <div className="flex items-center gap-2 text-gray-600 col-span-2"><LinkIcon className="w-4 h-4 text-emerald-500" /><a href={candidate.linkedin} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">LinkedIn</a></div>
                  )}
                  {candidate?.github && (
                    <div className="flex items-center gap-2 text-gray-600 col-span-2"><CodeBracketIcon className="w-4 h-4 text-emerald-500" /><a href={candidate.github} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">GitHub</a></div>
                  )}
                </div>
              </div>
            </div>

            {/* Profil */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2"><AcademicCapIcon className="w-5 h-5 text-emerald-600" /><h2 className="text-lg font-semibold text-gray-800">Profil</h2></div>
              <div className="p-5">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div><p className="text-xs text-gray-400">Titre</p><p className="text-gray-800">{candidate?.title || "Non renseigné"}</p></div>
                  <div><p className="text-xs text-gray-400">Expérience</p><p className="text-gray-800">{EXPERIENCE_LABELS[candidate?.experience] || candidate?.experience || "Non renseignée"}</p></div>
                  <div><p className="text-xs text-gray-400">Formation</p><p className="text-gray-800">{EDUCATION_LABELS[candidate?.education] || candidate?.education || "Non renseignée"}</p></div>
                  <div><p className="text-xs text-gray-400">Localisation</p><p className="text-gray-800">{candidate?.location || "Non renseignée"}</p></div>
                </div>
                {candidate?.bio && (
                  <div className="mt-4"><p className="text-xs text-gray-400 mb-1">Bio / Présentation</p><p className="text-gray-700 bg-gray-50 rounded-lg p-3 text-sm">{candidate.bio}</p></div>
                )}
              </div>
            </div>

            {/* Compétences */}
            {candidate?.skills && candidate.skills.length > 0 && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2"><StarIcon className="w-5 h-5 text-emerald-600" /><h2 className="text-lg font-semibold text-gray-800">Compétences</h2></div>
                <div className="p-5"><div className="flex flex-wrap gap-2">{candidate.skills.map((skill, idx) => (<span key={idx} className="px-3 py-1.5 bg-emerald-50 text-emerald-700 rounded-lg text-sm font-medium border border-emerald-200">{skill}</span>))}</div></div>
              </div>
            )}

            {/* ✅ SECTION CV SUPPRIMÉE - PLUS DE LIEN DE TÉLÉCHARGEMENT */}

            {/* Statut */}
            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="bg-gray-50 px-5 py-3 border-b border-gray-100 flex items-center gap-2"><ArrowPathIcon className="w-5 h-5 text-emerald-600" /><h2 className="text-lg font-semibold text-gray-800">Statut de la candidature</h2></div>
              <div className="p-5">
                <div className="flex flex-wrap items-center gap-4">
                  <select value={newStatus} onChange={(e) => setNewStatus(e.target.value)} className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500 bg-white">
                    {statusOptions.map(opt => (<option key={opt.value} value={opt.value}>{opt.icon} {opt.label}</option>))}
                  </select>
                  <button onClick={handleStatusUpdate} disabled={updatingStatus || newStatus === app.status} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition disabled:opacity-50">{updatingStatus ? "Mise à jour..." : "Mettre à jour"}</button>
                </div>
              </div>
            </div>

            {/* Actions */}
            <div className="flex flex-wrap gap-3">
              {canScheduleInterview && (
                <button onClick={() => setShowInterviewModal(true)} className="flex-1 px-4 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 font-semibold transition shadow-md flex items-center justify-center gap-2">
                  <CalendarIcon className="w-5 h-5" />Programmer un entretien
                </button>
              )}
              {!isInTalentPool ? (
                <button onClick={handleAddToTalentPool} disabled={addingToTalentPool} className="flex-1 px-4 py-3 bg-amber-600 text-white rounded-xl hover:bg-amber-700 font-semibold transition shadow-md flex items-center justify-center gap-2">
                  <StarIcon className="w-5 h-5" />{addingToTalentPool ? "Ajout en cours..." : "Ajouter à la base de talents"}
                </button>
              ) : (
                <div className="flex-1 px-4 py-3 bg-amber-100 text-amber-700 rounded-xl border border-amber-200 flex items-center justify-center gap-2">
                  <StarIcon className="w-5 h-5" />Déjà dans la base de talents
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </div>

      {/* ✅ MODAL ENTRETIEN PROFESSIONNEL (REDESIGN) */}
      <AnimatePresence>
        {showInterviewModal && (
          <div
            className="fixed inset-0 z-[100001] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm overflow-y-auto"
            onClick={() => setShowInterviewModal(false)}
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
                        {candidate?.full_name || "Candidat"} • {job?.title || "Offre"}
                      </p>
                    </div>
                  </div>
                  <button onClick={() => setShowInterviewModal(false)} className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110">
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
                      { value: "video", label: "💻 Visioconférence", icon: "🎥" },
                      { value: "onsite", label: "🏢 Présentiel", icon: "📍" },
                      { value: "phone", label: "📞 Téléphonique", icon: "📱" },
                    ].map((type) => (
                      <button
                        key={type.value}
                        type="button"
                        onClick={() => {
                          setInterviewType(type.value);
                          if (type.value === "video") setInterviewLocation("");
                          if (type.value === "phone") setInterviewLocation("Entretien téléphonique");
                        }}
                        className={`px-4 py-3 rounded-xl text-sm font-medium transition-all duration-200 ${
                          interviewType === type.value
                            ? "bg-emerald-600 text-white shadow-md ring-2 ring-emerald-300"
                            : "bg-gray-100 text-gray-600 hover:bg-gray-200 border border-gray-200"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Lieu (pour présentiel) */}
                {interviewType === "onsite" && (
                  <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                      <LocationIcon className="w-4 h-4 text-emerald-500" />
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

                {/* Lien visio (pour visio) */}
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
                  </div>
                )}

                {/* Durée */}
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-2 flex items-center gap-2">
                    <ClockIcon className="w-4 h-4 text-emerald-500" />
                    Durée estimée (minutes)
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
                    <option value={90}>1h30</option>
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
                    <pre className="text-xs text-gray-600 whitespace-pre-wrap font-sans bg-white p-3 rounded-lg border border-gray-100">
                      {getEmailPreview()}
                    </pre>
                  </div>
                )}
              </div>

              {/* Footer */}
              <div className="px-6 py-5 bg-gray-50 border-t border-gray-100 flex gap-3">
                <button
                  onClick={() => setShowInterviewModal(false)}
                  className="flex-1 px-5 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-100 transition-all duration-200 font-medium"
                >
                  Annuler
                </button>
                <motion.button
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={handleScheduleInterview}
                  disabled={schedulingInterview || !interviewDate || !interviewTime || (interviewType === "onsite" && !interviewLocation.trim())}
                  className="flex-1 px-5 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-semibold transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2 shadow-md"
                >
                  {schedulingInterview ? (
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <CalendarIcon className="w-5 h-5" />
                  )}
                  {schedulingInterview ? "Programmation en cours..." : "Envoyer l'invitation"}
                </motion.button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}