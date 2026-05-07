// frontend/src/page/recruiter/TalentPoolList.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ VERSION CORRIGÉE
// ✅ CORRECTION: Liens CV fonctionnels (ouverture dans nouvel onglet)
// ✅ CORRECTION: Import manquants
// ✅ CORRECTION: URLs null/undefined gérées
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  StarIcon,
  MagnifyingGlassIcon,
  XCircleIcon,
  EnvelopeIcon,
  PhoneIcon,
  BriefcaseIcon,
  AcademicCapIcon,
  MapPinIcon,
  DocumentTextIcon,
  LinkIcon,
  TrashIcon,
  SparklesIcon,
  BuildingOfficeIcon,
  CalendarIcon,
  TrophyIcon,
  UserGroupIcon,
  ArrowTrendingUpIcon,
  XMarkIcon,
} from "@heroicons/react/24/outline";
import { StarIcon as StarSolidIcon } from "@heroicons/react/24/solid";
import NavbarPro from "../../components/layout/NavbarPro";
import PageTransition from "../../components/common/PageTransition";
import api, { 
  removeFromTalentPool, 
  inviteTalentsToApply, 
  getJobOffers,
  getTalentPool 
} from "../../services/api";

// Labels d'expérience
const EXPERIENCE_LABELS = {
  "0-1": "Moins d'un an",
  "1-3": "1 à 3 ans",
  "3-5": "3 à 5 ans",
  "5-10": "5 à 10 ans",
  "10+": "Plus de 10 ans",
};

// Labels d'éducation
const EDUCATION_LABELS = {
  bac: "Baccalauréat",
  "bac+2": "Bac+2 (BTS, DUT)",
  "bac+3": "Bac+3 (Licence)",
  "bac+5": "Bac+5 (Master, Ingénieur)",
  "bac+8": "Bac+8 (Doctorat)",
};

// API Base URL depuis l'environnement ou fallback
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000";

// Composant Badge de score (sans pourcentage visible)
function ScoreBadge({ score }) {
  const getColor = () => {
    if (score >= 80) return "bg-emerald-500";
    if (score >= 60) return "bg-blue-500";
    if (score >= 40) return "bg-amber-500";
    return "bg-red-500";
  };
  <BackButton fallbackPath="/recruiter-dashboard" className="mb-6" />
  const getLabel = () => {
    if (score >= 80) return "Excellent";
    if (score >= 60) return "Très bien";
    if (score >= 40) return "Bon";
    return "À améliorer";
  };

  return (
    <div className="flex items-center gap-1.5">
      <div className={`w-2 h-2 rounded-full ${getColor()}`} />
      <span className="text-xs font-medium text-gray-500">{getLabel()}</span>
    </div>
  );
}

// Skeleton loader pour chargement
function TalentSkeleton() {
  return (
    <div className="bg-white rounded-xl border border-gray-100 p-5 animate-pulse">
      <div className="flex flex-col lg:flex-row lg:items-start gap-4">
        <div className="w-16 h-16 bg-gray-200 rounded-xl" />
        <div className="flex-1 space-y-3">
          <div className="h-5 bg-gray-200 rounded w-1/3" />
          <div className="h-4 bg-gray-200 rounded w-1/2" />
          <div className="flex gap-2">
            <div className="h-8 bg-gray-200 rounded w-24" />
            <div className="h-8 bg-gray-200 rounded w-24" />
          </div>
        </div>
        <div className="flex gap-2">
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
          <div className="h-10 w-24 bg-gray-200 rounded-lg" />
        </div>
      </div>
    </div>
  );
}

// ✅ CORRECTION: Fonction utilitaire pour construire l'URL complète du CV
function getCvFullUrl(cvUrl) {
  if (!cvUrl || cvUrl === "null" || cvUrl === "undefined") return null;
  if (cvUrl.startsWith("http")) return cvUrl;
  if (cvUrl.startsWith("/")) return `${API_BASE_URL}${cvUrl}`;
  return `${API_BASE_URL}/media/${cvUrl}`;
}

export default function TalentPoolList() {
  const navigate = useNavigate();
  const [talents, setTalents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [message, setMessage] = useState({ text: "", type: "" });
  const [invitingId, setInvitingId] = useState(null);
  const [deletingId, setDeletingId] = useState(null);
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [selectedTalent, setSelectedTalent] = useState(null);
  const [jobOffers, setJobOffers] = useState([]);
  const [selectedOfferId, setSelectedOfferId] = useState("");
  const [invitingMultiple, setInvitingMultiple] = useState(false);
  const [selectedTalents, setSelectedTalents] = useState([]);
  const [selectAll, setSelectAll] = useState(false);
  const [isHovered, setIsHovered] = useState(null);

  // Charger les talents
  const loadTalents = async () => {
    setLoading(true);
    try {
      const response = await getTalentPool();
      const data = response.data.results || response.data || [];
      setTalents(data);
    } catch (error) {
      console.error("Erreur chargement talents:", error);
      setMessage({ text: "Erreur lors du chargement des talents", type: "error" });
    } finally {
      setLoading(false);
    }
  };

  // Charger les offres du recruteur
  const loadJobOffers = async () => {
    try {
      const response = await getJobOffers();
      const data = response.data.results || response.data || [];
      setJobOffers(data.filter(offer => offer.status === "active"));
    } catch (error) {
      console.error("Erreur chargement offres:", error);
    }
  };

  useEffect(() => {
    loadTalents();
    loadJobOffers();
  }, []);

  // Filtrer les talents
  const filteredTalents = talents.filter((talent) => {
    const search = searchTerm.toLowerCase();
    const name = (talent.candidate_name || "").toLowerCase();
    const email = (talent.candidate_email || "").toLowerCase();
    const skills = (talent.candidate_skills || []).join(" ").toLowerCase();
    return name.includes(search) || email.includes(search) || skills.includes(search);
  });

  // Statistiques des talents
  const stats = {
    total: talents.length,
    avgScore: talents.length > 0 
      ? Math.round(talents.reduce((acc, t) => acc + (t.score || 0), 0) / talents.length)
      : 0,
    topSkills: [...new Set(talents.flatMap(t => t.candidate_skills || []))].slice(0, 5),
  };

  // Supprimer un talent
  const handleRemoveTalent = async (talentId, candidateName) => {
    if (!window.confirm(`Retirer ${candidateName} de votre base de talents ?`)) return;
    setDeletingId(talentId);
    try {
      await removeFromTalentPool(talentId);
      setMessage({ text: "✅ Talent retiré avec succès", type: "success" });
      loadTalents();
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Erreur suppression:", error);
      setMessage({ text: "❌ Erreur lors du retrait", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } finally {
      setDeletingId(null);
    }
  };

  // Inviter un talent
  const handleInviteTalent = async (talentId, candidateName, jobOfferId) => {
    if (!jobOfferId) {
      setMessage({ text: "Veuillez sélectionner une offre", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }
    setInvitingId(talentId);
    try {
      await inviteTalentsToApply(jobOfferId, [talentId], true);
      setMessage({ text: `✅ Invitation envoyée à ${candidateName}`, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      setShowInviteModal(false);
      setSelectedTalent(null);
      setSelectedOfferId("");
    } catch (error) {
      console.error("Erreur invitation:", error);
      setMessage({ text: "❌ Erreur lors de l'invitation", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } finally {
      setInvitingId(null);
    }
  };

  // Inviter plusieurs talents
  const handleInviteMultiple = async () => {
    if (selectedTalents.length === 0) {
      setMessage({ text: "Sélectionnez au moins un talent", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }
    if (!selectedOfferId) {
      setMessage({ text: "Veuillez sélectionner une offre", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }
    setInvitingMultiple(true);
    try {
      await inviteTalentsToApply(selectedOfferId, selectedTalents, true);
      setMessage({ text: `✅ Invitations envoyées à ${selectedTalents.length} talent(s)`, type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      setSelectedTalents([]);
      setSelectAll(false);
      setSelectedOfferId("");
    } catch (error) {
      console.error("Erreur invitations multiples:", error);
      setMessage({ text: "❌ Erreur lors des invitations", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } finally {
      setInvitingMultiple(false);
    }
  };

  // Sélectionner tous les talents
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedTalents([]);
    } else {
      setSelectedTalents(filteredTalents.map(t => t.id));
    }
    setSelectAll(!selectAll);
  };

  // Sélectionner un talent individuel
  const handleSelectTalent = (talentId) => {
    setSelectedTalents(prev => {
      if (prev.includes(talentId)) {
        return prev.filter(id => id !== talentId);
      }
      return [...prev, talentId];
    });
  };

  // Ouvrir le modal d'invitation
  const openInviteModal = (talent) => {
    setSelectedTalent(talent);
    setSelectedOfferId("");
    setShowInviteModal(true);
  };

  // Formater la date
  const formatDate = (dateString) => {
    if (!dateString) return "—";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" });
  };

  // Fonction pour retourner au dashboard RH
  const handleClose = () => {
    navigate("/recruiter-dashboard");
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <NavbarPro />
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {/* Header amélioré avec bouton fermeture X dans le coin supérieur droit */}
          <div className="relative mb-8">
            {/* Bouton Fermer (X) - retour dashboard RH */}
            <motion.button
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              whileHover={{ scale: 1.05, rotate: 90 }}
              whileTap={{ scale: 0.95 }}
              onClick={handleClose}
              className="absolute -top-2 right-0 z-20 flex items-center justify-center w-10 h-10 bg-white/20 backdrop-blur-sm border border-white/30 rounded-xl text-white/80 hover:text-white hover:bg-red-500/80 hover:border-red-400 transition-all duration-300 shadow-lg group"
              title="Fermer et retourner au tableau de bord RH"
            >
              <XMarkIcon className="w-5 h-5 transition-transform duration-300 group-hover:rotate-90" />
            </motion.button>

            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="relative px-8 py-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-48 translate-x-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-teal-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl" />
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/5 via-transparent to-transparent" />
                
                <div className="relative pr-12">
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
                    <div className="flex items-center gap-5">
                      <div className="relative group">
                        <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-2xl blur opacity-30 group-hover:opacity-50 transition duration-500" />
                        <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                          <StarSolidIcon className="w-8 h-8 text-white" />
                        </div>
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">
                          Base de talents
                        </h1>
                        <p className="text-emerald-100 mt-1 flex items-center gap-2">
                          <UserGroupIcon className="w-4 h-4" />
                          {talents.length} candidat{talents.length > 1 ? "s" : ""} avec un excellent CV
                        </p>
                      </div>
                    </div>

                    {/* Stats cards dans le header */}
                    <div className="flex gap-3">
                      <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
                        <p className="text-emerald-100 text-xs">Score moyen</p>
                        <p className="text-2xl font-bold text-white">{stats.avgScore}%</p>
                      </div>
                      <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
                        <p className="text-emerald-100 text-xs">Compétences</p>
                        <p className="text-2xl font-bold text-white">{stats.topSkills.length}</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Message de notification */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -20, scale: 0.95 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.95 }}
                transition={{ type: "spring", damping: 20 }}
                className={`mb-6 p-4 rounded-xl flex items-center gap-3 shadow-lg ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.type === "success" ? (
                  <SparklesIcon className="w-5 h-5" />
                ) : (
                  <XCircleIcon className="w-5 h-5" />
                )}
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Barre de recherche premium */}
          <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-5 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1 relative group">
                <MagnifyingGlassIcon className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400 group-focus-within:text-emerald-500 transition-colors duration-200" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, email ou compétence..."
                  className="w-full pl-11 pr-4 py-3.5 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition-all duration-200 bg-gray-50 focus:bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              
              {/* Section d'invitation multiple */}
              {selectedTalents.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, x: 20 }}
                  animate={{ opacity: 1, x: 0 }}
                  className="flex items-center gap-3 bg-gradient-to-r from-emerald-50 to-teal-50 p-2 rounded-xl border border-emerald-200"
                >
                  <div className="flex items-center gap-1 pl-2">
                    <span className="text-emerald-600 font-semibold">{selectedTalents.length}</span>
                    <span className="text-gray-600 text-sm">sélectionné(s)</span>
                  </div>
                  <select
                    value={selectedOfferId}
                    onChange={(e) => setSelectedOfferId(e.target.value)}
                    className="px-4 py-2.5 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 bg-white text-sm"
                  >
                    <option value="">Choisir une offre</option>
                    {jobOffers.map((offer) => (
                      <option key={offer.id} value={offer.id}>
                        {offer.title} — {offer.location || "Localisation non spécifiée"}
                      </option>
                    ))}
                  </select>
                  <button
                    onClick={handleInviteMultiple}
                    disabled={invitingMultiple || !selectedOfferId}
                    className="px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-semibold transition-all duration-200 disabled:opacity-50 flex items-center gap-2 shadow-md"
                  >
                    {invitingMultiple ? (
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <SparklesIcon className="w-4 h-4" />
                    )}
                    Inviter
                  </button>
                </motion.div>
              )}
            </div>

            {/* Filtres rapides */}
            {stats.topSkills.length > 0 && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <p className="text-xs text-gray-500 mb-2">Compétences populaires :</p>
                <div className="flex flex-wrap gap-2">
                  {stats.topSkills.map((skill, idx) => (
                    <button
                      key={idx}
                      onClick={() => setSearchTerm(skill)}
                      className="px-3 py-1.5 bg-gray-100 hover:bg-emerald-100 text-gray-600 hover:text-emerald-700 rounded-lg text-xs transition-all duration-200"
                    >
                      {skill}
                    </button>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* Actions de sélection */}
          {filteredTalents.length > 0 && (
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="w-4 h-4 text-emerald-600 rounded border-gray-300 focus:ring-emerald-500 transition-all"
                />
                <span className="text-sm text-gray-600 group-hover:text-emerald-600 transition-colors">
                  Sélectionner tout ({filteredTalents.length})
                </span>
              </label>
              {selectedTalents.length > 0 && (
                <motion.span 
                  initial={{ scale: 0.9 }}
                  animate={{ scale: 1 }}
                  className="text-sm bg-emerald-100 text-emerald-700 px-3 py-1.5 rounded-full font-medium"
                >
                  {selectedTalents.length} talent(s) sélectionné(s)
                </motion.span>
              )}
            </div>
          )}

          {/* Liste des talents */}
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <TalentSkeleton key={i} />
              ))}
            </div>
          ) : filteredTalents.length === 0 ? (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl p-16 text-center border border-gray-100 shadow-sm"
            >
              <div className="relative w-24 h-24 mx-auto mb-6">
                <div className="absolute inset-0 bg-emerald-100 rounded-full blur-xl opacity-50" />
                <div className="relative w-24 h-24 bg-gradient-to-br from-emerald-100 to-emerald-200 rounded-full flex items-center justify-center">
                  <TrophyIcon className="w-10 h-10 text-emerald-600" />
                </div>
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-2">
                {searchTerm ? "Aucun talent trouvé" : "Votre base de talents est vide"}
              </h3>
              <p className="text-gray-500 max-w-md mx-auto">
                {searchTerm 
                  ? "Aucun candidat ne correspond à votre recherche."
                  : "Ajoutez des candidats exceptionnels depuis le tableau de bord pour les retrouver ici."}
              </p>
              <button
                onClick={handleClose}
                className="inline-flex items-center gap-2 mt-6 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition-all duration-200 shadow-md hover:shadow-lg"
              >
                <BuildingOfficeIcon className="w-5 h-5" />
                Voir les candidatures
              </button>
            </motion.div>
          ) : (
            <div className="space-y-4">
              <AnimatePresence>
                {filteredTalents.map((talent, index) => {
                  // ✅ CORRECTION: Construction de l'URL complète du CV
                  const cvFullUrl = getCvFullUrl(talent.candidate_cv_url);
                  
                  return (
                    <motion.div
                      key={talent.id}
                      initial={{ opacity: 0, y: 30 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -30 }}
                      transition={{ delay: index * 0.05, duration: 0.3 }}
                      whileHover={{ y: -4 }}
                      onHoverStart={() => setIsHovered(talent.id)}
                      onHoverEnd={() => setIsHovered(null)}
                      className="bg-white rounded-xl border border-gray-100 p-5 hover:shadow-xl transition-all duration-300 relative overflow-hidden group"
                    >
                      {/* Effet de bordure gradient au hover */}
                      <div className="absolute inset-0 bg-gradient-to-r from-emerald-500/0 via-emerald-500/0 to-emerald-500/0 group-hover:from-emerald-500/5 group-hover:via-emerald-500/5 group-hover:to-emerald-500/5 transition-all duration-500 pointer-events-none" />
                      
                      <div className="flex flex-col lg:flex-row lg:items-start gap-5">
                        {/* Checkbox moderne */}
                        <div className="shrink-0 pt-1">
                          <input
                            type="checkbox"
                            checked={selectedTalents.includes(talent.id)}
                            onChange={() => handleSelectTalent(talent.id)}
                            className="w-5 h-5 text-emerald-600 rounded-lg border-gray-300 focus:ring-emerald-500 transition-all cursor-pointer"
                          />
                        </div>

                        {/* Avatar */}
                        <div className="relative shrink-0">
                          <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-teal-500 rounded-xl blur opacity-0 group-hover:opacity-30 transition duration-500" />
                          <div className="relative w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
                            {talent.candidate_name?.charAt(0) || "C"}
                          </div>
                        </div>

                        {/* Contenu principal */}
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-3 flex-wrap">
                            <h3 className="text-lg font-bold text-gray-900 group-hover:text-emerald-700 transition-colors duration-300">
                              {talent.candidate_name}
                            </h3>
                            <ScoreBadge score={talent.score || 0} />
                            <span className="text-xs text-gray-400 flex items-center gap-1 bg-gray-50 px-2 py-1 rounded-full">
                              <CalendarIcon className="w-3 h-3" />
                              Ajouté le {formatDate(talent.added_at)}
                            </span>
                          </div>

                          <p className="text-sm text-gray-500 mt-0.5">{talent.candidate_title || "Titre non renseigné"}</p>

                          {/* Contact */}
                          <div className="flex flex-wrap gap-4 mt-2 text-sm text-gray-500">
                            <span className="flex items-center gap-1.5">
                              <EnvelopeIcon className="w-4 h-4 text-emerald-500" />
                              {talent.candidate_email}
                            </span>
                            {talent.candidate_phone && (
                              <span className="flex items-center gap-1.5">
                                <PhoneIcon className="w-4 h-4 text-emerald-500" />
                                {talent.candidate_phone}
                              </span>
                            )}
                            {talent.candidate_location && (
                              <span className="flex items-center gap-1.5">
                                <MapPinIcon className="w-4 h-4 text-emerald-500" />
                                {talent.candidate_location}
                              </span>
                            )}
                          </div>

                          {/* Expérience et éducation */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {talent.candidate_experience && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                <BriefcaseIcon className="w-3 h-3" />
                                {EXPERIENCE_LABELS[talent.candidate_experience] || talent.candidate_experience}
                              </span>
                            )}
                            {talent.candidate_education && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-slate-100 text-slate-700 rounded-lg text-xs font-medium">
                                <AcademicCapIcon className="w-3 h-3" />
                                {EDUCATION_LABELS[talent.candidate_education] || talent.candidate_education}
                              </span>
                            )}
                            {talent.years_experience > 0 && (
                              <span className="inline-flex items-center gap-1.5 px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium">
                                <ArrowTrendingUpIcon className="w-3 h-3" />
                                {talent.years_experience} ans d'expérience
                              </span>
                            )}
                          </div>

                          {/* Compétences */}
                          {talent.candidate_skills?.length > 0 && (
                            <div className="flex flex-wrap gap-1.5 mt-3">
                              {talent.candidate_skills.slice(0, 6).map((skill, idx) => (
                                <span 
                                  key={idx} 
                                  className="px-2.5 py-1 bg-emerald-50 text-emerald-700 rounded-lg text-xs font-medium border border-emerald-100 hover:bg-emerald-100 transition-colors duration-200 cursor-default"
                                >
                                  {skill}
                                </span>
                              ))}
                              {talent.candidate_skills.length > 6 && (
                                <span className="px-2.5 py-1 bg-gray-100 text-gray-500 rounded-lg text-xs font-medium">
                                  +{talent.candidate_skills.length - 6}
                                </span>
                              )}
                            </div>
                          )}

                          {/* Raison de l'ajout */}
                          {talent.reason && (
                            <div className="mt-3 p-3 bg-emerald-50/50 rounded-xl border border-emerald-100">
                              <p className="text-xs text-emerald-700 flex items-start gap-2">
                                <SparklesIcon className="w-3.5 h-3.5 mt-0.5 shrink-0" />
                                <span className="flex-1">{talent.reason}</span>
                              </p>
                            </div>
                          )}

                          {/* Liens */}
                          <div className="flex flex-wrap gap-2 mt-3">
                            {/* ✅ CORRECTION: Lien CV fonctionnel */}
                            {cvFullUrl && (
                              <a
                                href={cvFullUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-emerald-50 hover:border-emerald-200 hover:text-emerald-700 transition-all duration-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <DocumentTextIcon className="w-3.5 h-3.5" />
                                Voir le CV
                              </a>
                            )}
                            {talent.candidate_linkedin && (
                              <a
                                href={talent.candidate_linkedin}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-white border border-gray-200 text-gray-700 rounded-lg text-xs font-medium hover:bg-blue-50 hover:border-blue-200 hover:text-blue-700 transition-all duration-200"
                                onClick={(e) => e.stopPropagation()}
                              >
                                <LinkIcon className="w-3.5 h-3.5" />
                                LinkedIn
                              </a>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row lg:flex-col gap-2 shrink-0">
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => openInviteModal(talent)}
                            className="px-5 py-2.5 text-sm font-semibold bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-md hover:shadow-lg flex items-center gap-2"
                          >
                            <SparklesIcon className="w-4 h-4" />
                            Inviter
                          </motion.button>
                          <motion.button
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                            onClick={() => handleRemoveTalent(talent.id, talent.candidate_name)}
                            disabled={deletingId === talent.id}
                            className="px-5 py-2.5 text-sm font-medium bg-white border-2 border-red-200 text-red-600 rounded-xl hover:bg-red-50 hover:border-red-300 hover:text-red-700 transition-all duration-200 flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
                          >
                            {deletingId === talent.id ? (
                              <div className="w-4 h-4 border-2 border-red-400 border-t-transparent rounded-full animate-spin" />
                            ) : (
                              <TrashIcon className="w-4 h-4" />
                            )}
                            Retirer
                          </motion.button>
                        </div>
                      </div>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>
          )}
        </div>

        {/* Modal d'invitation */}
        <AnimatePresence>
          {showInviteModal && selectedTalent && (
            <div
              className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-md"
              onClick={() => setShowInviteModal(false)}
            >
              <motion.div
                initial={{ scale: 0.95, opacity: 0, y: 30 }}
                animate={{ scale: 1, opacity: 1, y: 0 }}
                exit={{ scale: 0.95, opacity: 0, y: 30 }}
                transition={{ type: "spring", damping: 25 }}
                className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
                onClick={(e) => e.stopPropagation()}
              >
                <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 px-6 py-6">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                        <SparklesIcon className="w-6 h-6 text-white" />
                      </div>
                      <div>
                        <h3 className="text-white font-bold text-xl">Inviter un talent</h3>
                        <p className="text-emerald-100 text-sm mt-0.5">{selectedTalent.candidate_name}</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => setShowInviteModal(false)} 
                      className="text-white/60 hover:text-white transition-all duration-200 hover:scale-110"
                    >
                      <XCircleIcon className="w-7 h-7" />
                    </button>
                  </div>
                </div>

                <div className="p-6">
                  <div className="mb-5">
                    <label className="block text-sm font-semibold text-gray-700 mb-2">
                      Sélectionner une offre
                    </label>
                    <select
                      value={selectedOfferId}
                      onChange={(e) => setSelectedOfferId(e.target.value)}
                      className="w-full px-4 py-3 border-2 border-gray-100 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 bg-gray-50 focus:bg-white transition-all duration-200"
                    >
                      <option value="">Choisir une offre...</option>
                      {jobOffers.map((offer) => (
                        <option key={offer.id} value={offer.id}>
                          {offer.title} — {offer.location || "Localisation non spécifiée"}
                        </option>
                      ))}
                    </select>
                  </div>

                  <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-4 mb-6 border border-emerald-100">
                    <p className="text-sm text-emerald-700 flex items-start gap-2">
                      <span className="text-lg">💡</span>
                      <span>Un email sera envoyé au candidat pour l'inviter à postuler à cette offre.</span>
                    </p>
                  </div>

                  <div className="flex gap-3">
                    <button
                      onClick={() => setShowInviteModal(false)}
                      className="flex-1 px-4 py-3 border-2 border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition-all duration-200 font-medium"
                    >
                      Annuler
                    </button>
                    <motion.button
                      whileHover={{ scale: 1.02 }}
                      whileTap={{ scale: 0.98 }}
                      onClick={() => handleInviteTalent(selectedTalent.id, selectedTalent.candidate_name, selectedOfferId)}
                      disabled={invitingId === selectedTalent.id || !selectedOfferId}
                      className="flex-1 px-4 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl hover:from-emerald-700 hover:to-teal-700 font-semibold transition-all duration-200 disabled:opacity-50 flex items-center justify-center gap-2 shadow-md"
                    >
                      {invitingId === selectedTalent.id ? (
                        <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      ) : (
                        <SparklesIcon className="w-4 h-4" />
                      )}
                      Envoyer l'invitation
                    </motion.button>
                  </div>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>
      </PageTransition>
    </div>
  );
}