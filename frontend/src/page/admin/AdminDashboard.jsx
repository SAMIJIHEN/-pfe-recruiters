// frontend/src/page/admin/AdminDashboard.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ DASHBOARD ADMINISTRATEUR
// ✅ AVEC LOGO GRANDISSANT
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import {
  UserGroupIcon,
  CheckCircleIcon,
  XCircleIcon,
  ClockIcon,
  MagnifyingGlassIcon,
  ArrowPathIcon,
  ShieldCheckIcon,
  BuildingOfficeIcon,
  BriefcaseIcon,
  GlobeAltIcon,
  ChevronDownIcon,
  ChevronUpIcon,
  ArrowLeftIcon,
} from "@heroicons/react/24/outline";

import logoSite from "../../components/layout/AJ.png";

import {
  getAllRecruiters,
  getPendingRecruiters,
  getApprovedRecruiters,
  getRejectedRecruiters,
  approveRecruiter,
  rejectRecruiter,
  adminLogout,
  adminCheckAuth,
} from "../../services/adminApi";

// ============================================================
// COMPOSANT CARTE STATS
// ============================================================
function StatCard({ title, value, icon: Icon, color }) {
  const colors = {
    pending: "from-amber-500 to-orange-500",
    approved: "from-emerald-500 to-teal-500",
    rejected: "from-red-500 to-rose-500",
    total: "from-blue-500 to-indigo-500",
  };

  return (
    <motion.div
      whileHover={{ y: -5 }}
      className="bg-white rounded-2xl shadow-lg border border-gray-100 p-6"
    >
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-500">{title}</p>
          <p className="text-3xl font-bold text-gray-900 mt-1">{value}</p>
        </div>
        <div className={`w-12 h-12 rounded-xl bg-gradient-to-br ${colors[color]} flex items-center justify-center shadow-md`}>
          <Icon className="w-6 h-6 text-white" />
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// COMPOSANT CARTE RECRUTEUR
// ============================================================
function RecruiterCard({ recruiter, onApprove, onReject, isProcessing }) {
  const [expanded, setExpanded] = useState(false);
  const [rejectReason, setRejectReason] = useState("");
  const [showRejectModal, setShowRejectModal] = useState(false);

  const getStatusBadge = () => {
    switch (recruiter.status) {
      case "pending":
        return { label: "En attente", color: "bg-amber-100 text-amber-700", icon: "⏳" };
      case "approved":
        return { label: "Approuvé", color: "bg-emerald-100 text-emerald-700", icon: "✅" };
      case "rejected":
        return { label: "Rejeté", color: "bg-red-100 text-red-700", icon: "❌" };
      default:
        return { label: "Inconnu", color: "bg-gray-100 text-gray-700", icon: "❓" };
    }
  };

  const status = getStatusBadge();

  const handleRejectSubmit = () => {
    onReject(recruiter.id, rejectReason);
    setShowRejectModal(false);
    setRejectReason("");
  };

  return (
    <>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300 overflow-hidden"
      >
        <div className="p-5">
          <div className="flex flex-col lg:flex-row lg:items-start gap-4">
            <div className="shrink-0">
              <div className="w-16 h-16 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-xl flex items-center justify-center text-white text-2xl font-bold shadow-md">
                {recruiter.company_name?.charAt(0) || "E"}
              </div>
            </div>

            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="text-lg font-bold text-gray-900">
                  {recruiter.company_name}
                </h3>
                <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs font-medium ${status.color}`}>
                  {status.icon} {status.label}
                </span>
              </div>

              <p className="text-sm text-gray-500 mt-0.5">
                {recruiter.first_name} {recruiter.last_name} • {recruiter.position}
              </p>

              <p className="text-sm text-gray-500">
                {recruiter.email} • {recruiter.phone}
              </p>

              <button
                onClick={() => setExpanded(!expanded)}
                className="mt-3 text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1"
              >
                {expanded ? (
                  <>Voir moins <ChevronUpIcon className="w-4 h-4" /></>
                ) : (
                  <>Voir détails <ChevronDownIcon className="w-4 h-4" /></>
                )}
              </button>
            </div>

            {recruiter.status === "pending" && (
              <div className="flex gap-2 shrink-0">
                <button
                  onClick={() => onApprove(recruiter.id)}
                  disabled={isProcessing}
                  className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 transition font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <CheckCircleIcon className="w-4 h-4" />
                  Approuver
                </button>
                <button
                  onClick={() => setShowRejectModal(true)}
                  disabled={isProcessing}
                  className="px-4 py-2 border border-red-300 text-red-600 rounded-lg hover:bg-red-50 transition font-medium flex items-center gap-2 disabled:opacity-50"
                >
                  <XCircleIcon className="w-4 h-4" />
                  Rejeter
                </button>
              </div>
            )}
          </div>

          <AnimatePresence>
            {expanded && (
              <motion.div
                initial={{ height: 0, opacity: 0 }}
                animate={{ height: "auto", opacity: 1 }}
                exit={{ height: 0, opacity: 0 }}
                transition={{ duration: 0.3 }}
                className="overflow-hidden"
              >
                <div className="mt-4 pt-4 border-t border-gray-100">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <BuildingOfficeIcon className="w-4 h-4 text-emerald-600" />
                        Informations entreprise
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="flex items-center gap-2">
                          <BriefcaseIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Taille:</span>
                          <span className="text-gray-800">{recruiter.company_size}</span>
                        </p>
                        <p className="flex items-center gap-2">
                          <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                          <span className="text-gray-600">Secteur:</span>
                          <span className="text-gray-800">{recruiter.sector}</span>
                        </p>
                        {recruiter.website && (
                          <p className="flex items-center gap-2">
                            <GlobeAltIcon className="w-4 h-4 text-gray-400" />
                            <span className="text-gray-600">Site web:</span>
                            <a href={recruiter.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">
                              {recruiter.website}
                            </a>
                          </p>
                        )}
                      </div>
                    </div>

                    <div className="bg-gray-50 rounded-xl p-4">
                      <h4 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                        <ClockIcon className="w-4 h-4 text-emerald-600" />
                        Informations inscription
                      </h4>
                      <div className="space-y-2 text-sm">
                        <p className="text-gray-600">
                          Date d'inscription:{" "}
                          <span className="text-gray-800">
                            {new Date(recruiter.created_at).toLocaleDateString("fr-FR", {
                              day: "numeric",
                              month: "long",
                              year: "numeric",
                              hour: "2-digit",
                              minute: "2-digit",
                            })}
                          </span>
                        </p>
                        {recruiter.rejection_reason && (
                          <p className="flex items-start gap-2 text-red-600 bg-red-50 p-2 rounded-lg mt-2">
                            <XCircleIcon className="w-4 h-4 shrink-0 mt-0.5" />
                            <span className="text-sm">Motif: {recruiter.rejection_reason}</span>
                          </p>
                        )}
                      </div>
                    </div>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Modal de rejet */}
      <AnimatePresence>
        {showRejectModal && (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
            onClick={() => setShowRejectModal(false)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0, y: 20 }}
              animate={{ scale: 1, opacity: 1, y: 0 }}
              exit={{ scale: 0.95, opacity: 0, y: 20 }}
              className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-5">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
                    <XCircleIcon className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-white font-bold text-lg">Rejeter le compte</h3>
                    <p className="text-red-100 text-sm">{recruiter.company_name}</p>
                  </div>
                </div>
              </div>

              <div className="p-6">
                <label className="block text-sm font-semibold text-gray-700 mb-2">
                  Motif du rejet (optionnel)
                </label>
                <textarea
                  value={rejectReason}
                  onChange={(e) => setRejectReason(e.target.value)}
                  rows={3}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-red-500"
                  placeholder="Expliquez pourquoi ce compte est rejeté..."
                />
                <div className="flex gap-3 mt-6">
                  <button
                    onClick={() => setShowRejectModal(false)}
                    className="flex-1 px-4 py-3 border border-gray-200 rounded-xl text-gray-700 hover:bg-gray-50 transition"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleRejectSubmit}
                    className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 transition font-semibold"
                  >
                    Confirmer le rejet
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}

// ============================================================
// PAGE PRINCIPALE DASHBOARD ADMIN
// ============================================================
export default function AdminDashboard() {
  const navigate = useNavigate();
  const [recruiters, setRecruiters] = useState([]);
  const [loading, setLoading] = useState(true);
  const [processing, setProcessing] = useState(false);
  const [filter, setFilter] = useState("all");
  const [searchTerm, setSearchTerm] = useState("");
  const [stats, setStats] = useState({ total: 0, pending: 0, approved: 0, rejected: 0 });

  useEffect(() => {
    const checkAuth = async () => {
      try {
        await adminCheckAuth();
        loadRecruiters();
      } catch (error) {
        navigate("/admin-login");
      }
    };
    checkAuth();
  }, []);

  const loadRecruiters = async () => {
    setLoading(true);
    try {
      let response;
      switch (filter) {
        case "pending":
          response = await getPendingRecruiters();
          break;
        case "approved":
          response = await getApprovedRecruiters();
          break;
        case "rejected":
          response = await getRejectedRecruiters();
          break;
        default:
          response = await getAllRecruiters();
      }

      const data = response.data.recruiters || [];
      setRecruiters(data);

      const allResponse = await getAllRecruiters();
      const allData = allResponse.data.recruiters || [];
      setStats({
        total: allData.length,
        pending: allData.filter(r => r.status === "pending").length,
        approved: allData.filter(r => r.status === "approved").length,
        rejected: allData.filter(r => r.status === "rejected").length,
      });
    } catch (error) {
      console.error("Erreur chargement:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadRecruiters();
  }, [filter]);

  const filteredRecruiters = recruiters.filter((r) => {
    const search = searchTerm.toLowerCase();
    return (
      r.company_name?.toLowerCase().includes(search) ||
      r.first_name?.toLowerCase().includes(search) ||
      r.last_name?.toLowerCase().includes(search) ||
      r.email?.toLowerCase().includes(search)
    );
  });

  const handleApprove = async (recruiterId) => {
    setProcessing(true);
    try {
      await approveRecruiter(recruiterId);
      await loadRecruiters();
    } catch (error) {
      console.error("Erreur approbation:", error);
      alert("Erreur lors de l'approbation");
    } finally {
      setProcessing(false);
    }
  };

  const handleReject = async (recruiterId, reason) => {
    setProcessing(true);
    try {
      await rejectRecruiter(recruiterId, reason);
      await loadRecruiters();
    } catch (error) {
      console.error("Erreur rejet:", error);
      alert("Erreur lors du rejet");
    } finally {
      setProcessing(false);
    }
  };

  const handleLogout = async () => {
    try {
      await adminLogout();
      navigate("/admin-login");
    } catch (error) {
      console.error("Erreur déconnexion:", error);
    }
  };

  return (
    <>
    
  <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50 pt-0">
  {/* Header avec logo GRAND */}
  <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 shadow-xl">
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        {/* Partie gauche : logo, titre et bouton Retour */}
        <div className="flex items-center gap-5">
          <div className="relative">
            <div className="absolute -inset-1 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-xl blur opacity-30" />
            <div className="relative w-16 h-16 bg-gradient-to-br from-slate-800 to-slate-900 rounded-xl flex items-center justify-center shadow-lg overflow-hidden border border-emerald-500/30">
              <img 
                src={logoSite} 
                alt="AJ Recruiters" 
                className="w-12 h-12 object-contain"
              />
            </div>
          </div>
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight">Administration</h1>
            <p className="text-emerald-100 text-sm">Gestion des comptes recruteurs</p>
          </div>
          <button
            onClick={() => navigate("/")}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition flex items-center gap-2"
          >
            <ArrowLeftIcon className="w-4 h-4" />
            Retour
          </button>
        </div>

        {/* Partie droite : bouton Déconnexion */}
        <div className="flex items-center gap-3">
          <button
            onClick={handleLogout}
            className="px-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white hover:bg-white/20 transition flex items-center gap-2"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Déconnexion
          </button>
        </div>

      </div>
    </div>
  </div>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          {/* Cartes statistiques */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <StatCard title="Total recruteurs" value={stats.total} icon={UserGroupIcon} color="total" />
            <StatCard title="En attente" value={stats.pending} icon={ClockIcon} color="pending" />
            <StatCard title="Approuvés" value={stats.approved} icon={CheckCircleIcon} color="approved" />
            <StatCard title="Rejetés" value={stats.rejected} icon={XCircleIcon} color="rejected" />
          </div>

          {/* Barre de filtres et recherche */}
          <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4 mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex gap-2 flex-wrap">
                {[
                  { key: "all", label: "Tous", count: stats.total },
                  { key: "pending", label: "En attente", count: stats.pending },
                  { key: "approved", label: "Approuvés", count: stats.approved },
                  { key: "rejected", label: "Rejetés", count: stats.rejected },
                ].map((f) => (
                  <button
                    key={f.key}
                    onClick={() => setFilter(f.key)}
                    className={`px-4 py-2 rounded-lg text-sm font-medium transition ${
                      filter === f.key
                        ? "bg-emerald-600 text-white shadow-md"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {f.label} ({f.count})
                  </button>
                ))}
              </div>

              <div className="flex-1 relative">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher par nom, entreprise ou email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <button
                onClick={loadRecruiters}
                disabled={loading}
                className="px-4 py-2 bg-gray-100 text-gray-600 rounded-lg hover:bg-gray-200 transition flex items-center gap-2 disabled:opacity-50"
              >
                <ArrowPathIcon className={`w-4 h-4 ${loading ? "animate-spin" : ""}`} />
                Rafraîchir
              </button>
            </div>
          </div>

          {/* Liste des recruteurs */}
          {loading ? (
            <div className="flex justify-center py-20">
              <div className="text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
                <p className="mt-4 text-gray-500">Chargement des recruteurs...</p>
              </div>
            </div>
          ) : filteredRecruiters.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <UserGroupIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun recruteur trouvé</h3>
              <p className="text-gray-500">
                {searchTerm
                  ? "Aucun résultat pour votre recherche"
                  : filter === "pending"
                  ? "Aucun recruteur en attente d'approbation"
                  : "Aucun recruteur trouvé"}
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {filteredRecruiters.map((recruiter) => (
                <RecruiterCard
                  key={recruiter.id}
                  recruiter={recruiter}
                  onApprove={handleApprove}
                  onReject={handleReject}
                  isProcessing={processing}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </>
  );
}