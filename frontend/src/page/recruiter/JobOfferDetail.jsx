// src/page/recruiter/JobOfferDetail.jsx
import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useParams, useNavigate } from "react-router-dom";
import { XCircleIcon, ChartBarIcon } from "@heroicons/react/24/outline";
import NavbarPro from "../../components/layout/NavbarPro";
import PageTransition from "../../components/common/PageTransition";
import BackButton from "../../components/common/BackButton";
import api from "../../services/api";
import { JobOfferHeader } from "./components/JobOfferHeader";
import { JobOfferStats } from "./components/JobOfferStats";
import { JobOfferDescription } from "./components/JobOfferDescription";
import { JobOfferSidebar } from "./components/JobOfferSidebar";
import { ApplicationsList } from "./components/ApplicationsList";
import { DeleteConfirmModal } from "./components/DeleteConfirmModal";

export default function JobOfferDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [offer, setOffer] = useState(null);
  const [applications, setApplications] = useState([]);
  const [loading, setLoading] = useState(true);
  const [applicationsLoading, setApplicationsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  const normalizeList = (data) => {
    if (Array.isArray(data)) return data;
    if (Array.isArray(data?.results)) return data.results;
    return [];
  };

  const loadOffer = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await api.get(`/job-offers/${id}/`);
      setOffer(response.data);
    } catch (err) {
      console.error("Erreur chargement offre:", err);
      setError("Impossible de charger l'offre.");
    } finally {
      setLoading(false);
    }
  };

  const loadApplications = async () => {
    try {
      setApplicationsLoading(true);
      const response = await api.get("/applications/for-recruiter/");
      const allApps = normalizeList(response.data);
      const filteredApps = allApps.filter((app) => {
        const jobId = app?.job_details?.id || app?.job || app?.job_id;
        return String(jobId) === String(id);
      });
      setApplications(filteredApps);
    } catch (err) {
      console.log("Impossible de charger les candidatures:", err);
      setApplications([]);
    } finally {
      setApplicationsLoading(false);
    }
  };

  const handlePublish = async () => {
    try {
      await api.post(`/job-offers/${id}/publish/`);
      await loadOffer();
    } catch (err) {
      console.error("Erreur publication:", err);
    }
  };

  const handleClose = async () => {
    try {
      await api.post(`/job-offers/${id}/close/`);
      await loadOffer();
    } catch (err) {
      console.error("Erreur fermeture:", err);
    }
  };

  const handleDelete = async () => {
    try {
      await api.delete(`/job-offers/${id}/`);
      navigate("/recruiter/job-offers");
    } catch (err) {
      console.error("Erreur suppression:", err);
    }
  };

  useEffect(() => {
    if (id) {
      loadOffer();
      loadApplications();
    }
  }, [id]);

  const totalApplications = applications.length;
  const viewsCount = offer?.views_count || 0;
  const conversionRate = viewsCount > 0 ? Math.round((totalApplications / viewsCount) * 100) : 0;

  const formatDate = (value, options = {}) => {
    if (!value) return "Non spécifiée";
    const d = new Date(value);
    if (isNaN(d.getTime())) return "Non spécifiée";
    return d.toLocaleDateString("fr-FR", options);
  };

  const formatSalary = () => {
    if (!offer?.salary_min && !offer?.salary_max) return "Non précisée";
    if (offer?.salary_min && offer?.salary_max) return `${offer.salary_min} - ${offer.salary_max} TND`;
    if (offer?.salary_min) return `À partir de ${offer.salary_min} TND`;
    return `Jusqu'à ${offer.salary_max} TND`;
  };

  const companyName = offer?.company_name || offer?.recruiter?.company_name || "Entreprise non spécifiée";

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <NavbarPro />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto" />
          <p className="mt-4 text-gray-600">Chargement de l'offre...</p>
        </div>
      </div>
    );
  }

  if (error || !offer) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <NavbarPro />
        <PageTransition>
          <div className="max-w-md mx-auto px-4 py-20">
            <div className="bg-red-50 border border-red-200 rounded-xl p-6 text-center">
              <XCircleIcon className="w-12 h-12 text-red-500 mx-auto mb-3" />
              <p className="text-red-600">{error || "Offre non trouvée"}</p>
              <button onClick={() => navigate("/recruiter/job-offers")} className="mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
                Retour aux offres
              </button>
            </div>
          </div>
        </PageTransition>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <NavbarPro />
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <BackButton fallbackPath="/recruiter/job-offers" className="mb-6" />

          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <JobOfferHeader
              offer={offer}
              companyName={companyName}
              onPublish={handlePublish}
              onClose={handleClose}
              onDeleteClick={() => setShowDeleteConfirm(true)}
              formatDate={formatDate}
            />
          </motion.div>

          <JobOfferStats
            totalApplications={totalApplications}
            applicationsLoading={applicationsLoading}
            viewsCount={viewsCount}
            offer={offer}
            formatDate={formatDate}
          />

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="grid grid-cols-1 lg:grid-cols-3 gap-8"
          >
            <JobOfferDescription offer={offer} />
            <JobOfferSidebar
              offer={offer}
              companyName={companyName}
              formatSalary={formatSalary}
              formatDate={formatDate}
            />
          </motion.div>

          <ApplicationsList applications={applications} formatDate={formatDate} />

          {totalApplications > 0 && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-2xl p-6 border border-emerald-100">
                <div className="flex items-center gap-2 mb-4">
                  <ChartBarIcon className="w-6 h-6 text-emerald-600" />
                  <h2 className="text-xl font-bold text-gray-800">Aperçu du recrutement</h2>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-600">{totalApplications}</p>
                    <p className="text-sm text-gray-600">Candidatures totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-600">{viewsCount}</p>
                    <p className="text-sm text-gray-600">Vues totales</p>
                  </div>
                  <div className="text-center">
                    <p className="text-3xl font-bold text-emerald-600">{conversionRate}%</p>
                    <p className="text-sm text-gray-600">Taux de conversion</p>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </div>

        <DeleteConfirmModal
          show={showDeleteConfirm}
          onClose={() => setShowDeleteConfirm(false)}
          onConfirm={handleDelete}
          offerTitle={offer.title}
        />
      </PageTransition>
    </div>
  );
}