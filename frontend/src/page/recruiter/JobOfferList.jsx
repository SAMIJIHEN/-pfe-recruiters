// frontend/src/page/recruiter/JobOfferList.jsx
import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useUser } from "@clerk/clerk-react";
import { motion } from "framer-motion";
import NavbarPro from "../../components/layout/NavbarPro";
import PageTransition from "../../components/common/PageTransition";
import api from "../../services/api";
import {
  BriefcaseIcon,
  MapPinIcon,
  CurrencyDollarIcon,
  EyeIcon,
  UserGroupIcon,
  PlusCircleIcon,
  PencilIcon,
  TrashIcon,
  BuildingOfficeIcon  // ✅ Ajout de l'icône pour l'entreprise
} from "@heroicons/react/24/outline";

export default function JobOfferList() {
  const { user } = useUser();
  const [offers, setOffers] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadOffers();
  }, []);

  const loadOffers = async () => {
    try {
      const response = await api.get("/job-offers/my_offers/");
      setOffers(response.data.results || response.data || []);
    } catch (error) {
      console.error("Erreur chargement offres:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm("Supprimer cette offre ?")) return;
    try {
      await api.delete(`/job-offers/${id}/`);
      loadOffers();
    } catch (error) {
      console.error("Erreur suppression:", error);
    }
  };

  const handlePublish = async (id) => {
    try {
      await api.post(`/job-offers/${id}/publish/`);
      loadOffers();
    } catch (error) {
      console.error("Erreur publication:", error);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <NavbarPro />
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-8">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-bold text-gray-900">Mes offres d'emploi</h1>
            <Link
              to="/recruiter/job-offers/new"
              className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700"
            >
              <PlusCircleIcon className="w-5 h-5" />
              Nouvelle offre
            </Link>
          </div>

          {loading ? (
            <div className="text-center py-12">Chargement...</div>
          ) : offers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">
                Aucune offre créée
              </h3>
              <p className="text-gray-500 mb-6">
                Commencez par créer votre première offre d'emploi.
              </p>
              <Link
                to="/recruiter/job-offers/new"
                className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl"
              >
                <PlusCircleIcon className="w-5 h-5" />
                Créer une offre
              </Link>
            </div>
          ) : (
            <div className="space-y-4">
              {offers.map((offer) => {
                // ✅ Récupération du nom de la société
                const companyName = offer.company_name || offer.recruiter?.company_name || "Entreprise";
                
                return (
                  <motion.div
                    key={offer.id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition"
                  >
                    <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                          <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                            offer.status === "active" 
                              ? "bg-green-100 text-green-700" 
                              : offer.status === "draft"
                              ? "bg-gray-100 text-gray-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                            {offer.status === "active" ? "Active" : 
                             offer.status === "draft" ? "Brouillon" : "Fermée"}
                          </span>
                        </div>

                        {/* ✅ AJOUT DU NOM DE LA SOCIÉTÉ ICI */}
                        <div className="flex items-center gap-2 mt-1 text-sm text-gray-600">
                          <BuildingOfficeIcon className="w-4 h-4 text-emerald-600" />
                          <span className="font-medium">{companyName}</span>
                        </div>

                        <div className="flex flex-wrap items-center gap-4 mt-2 text-sm text-gray-600">
                          <span className="flex items-center gap-1">
                            <MapPinIcon className="w-4 h-4" />
                            {offer.location}
                          </span>
                          <span className="flex items-center gap-1">
                            <BriefcaseIcon className="w-4 h-4" />
                            {offer.contract_type}
                          </span>
                          {offer.salary_min && (
                            <span className="flex items-center gap-1">
                              <CurrencyDollarIcon className="w-4 h-4" />
                              {offer.salary_min} - {offer.salary_max} TND
                            </span>
                          )}
                        </div>

                        <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                          <span className="flex items-center gap-1">
                            <UserGroupIcon className="w-4 h-4" />
                            {offer.applications_count || 0} candidatures
                          </span>
                          <span className="flex items-center gap-1">
                            <EyeIcon className="w-4 h-4" />
                            {offer.views_count || 0} vues
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        {offer.status === "draft" && (
                          <button
                            onClick={() => handlePublish(offer.id)}
                            className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm"
                          >
                            Publier
                          </button>
                        )}
                        <Link
                          to={`/recruiter/job-offers/${offer.id}`}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <EyeIcon className="w-5 h-5 text-gray-600" />
                        </Link>
                        <Link
                          to={`/recruiter/job-offers/${offer.id}/edit`}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-gray-50"
                        >
                          <PencilIcon className="w-5 h-5 text-gray-600" />
                        </Link>
                        <button
                          onClick={() => handleDelete(offer.id)}
                          className="p-2 border border-gray-200 rounded-lg hover:bg-red-50"
                        >
                          <TrashIcon className="w-5 h-5 text-red-600" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>
      </PageTransition>
    </div>
  );
}