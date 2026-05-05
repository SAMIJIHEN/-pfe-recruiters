// frontend/src/page/dashboard/Dashboard.jsx
import { useState } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { motion, AnimatePresence } from "framer-motion";
import { ArrowPathIcon } from "@heroicons/react/24/outline";
import NavbarPro from "../../components/layout/NavbarPro";
import PageTransition from "../../components/common/PageTransition";
import { useDashboardData } from "./hooks1/useDashboardData";
import { DashboardHeader } from "./components1/DashboardHeader";
import { DashboardSearchBar } from "./components1/DashboardSearchBar";
import { DashboardTabs } from "./components1/DashboardTabs";
import { RecommendedTab } from "./components1/RecommendedTab";
import { AllJobsTab } from "./components1/AllJobsTab";
import { ApplicationsTab } from "./components1/ApplicationsTab";
import { SavedJobsTab } from "./components1/SavedJobsTab";

export default function Dashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const [activeTab, setActiveTab] = useState("recommended");
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [savedVersion, setSavedVersion] = useState(0);

  const {
    profile,
    filteredJobs,
    applications,
    recommendedJobs,
    loading,
    loadingRecommendations,
    message,
    searchFilters,
    setSearchFilters,
    handleApply,
    hasApplied,
    getPhotoUrl,
    completion,
    savedOffers,
    loadApplications,
    setMessage,
  } = useDashboardData();

  // Forcer rafraîchissement sauvegardées (écoute événement)
  useState(() => {
    const handleSavedUpdate = () => setSavedVersion(v => v + 1);
    window.addEventListener("savedJobsUpdated", handleSavedUpdate);
    return () => window.removeEventListener("savedJobsUpdated", handleSavedUpdate);
  }, []);

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gray-50">
        <NavbarPro />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="w-12 h-12 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
            <p className="mt-4 text-gray-600">Chargement de votre espace...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 to-emerald-50">
      <NavbarPro />
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 py-8">
          {/* Message de notification */}
          <AnimatePresence>
            {message.text && (
              <motion.div
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className={`mb-4 p-3 rounded-xl ${
                  message.type === "success"
                    ? "bg-emerald-50 text-emerald-700 border border-emerald-200"
                    : "bg-red-50 text-red-700 border border-red-200"
                }`}
              >
                {message.text}
              </motion.div>
            )}
          </AnimatePresence>

          {/* Header avec photo et stats */}
          <DashboardHeader
            profile={profile}
            user={user}
            getPhotoUrl={getPhotoUrl}
            completion={completion}
            filteredJobs={filteredJobs}
            recommendedJobs={recommendedJobs}
          />

          {/* Barre de recherche */}
          <DashboardSearchBar
            searchFilters={searchFilters}
            setSearchFilters={setSearchFilters}
            filteredJobs={filteredJobs}
          />

          {/* Onglets */}
          <DashboardTabs
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            loadingRecommendations={loadingRecommendations}
            recommendedJobs={recommendedJobs}
            filteredJobs={filteredJobs}
            applications={applications}
            savedOffers={savedOffers}
          />

          {/* Contenu des onglets avec animation */}
          <AnimatePresence mode="wait">
            {activeTab === "recommended" && (
              <RecommendedTab
                key="recommended"
                loadingRecommendations={loadingRecommendations}
                recommendedJobs={recommendedJobs}
                handleApply={handleApply}
                hasApplied={hasApplied}
              />
            )}
            {activeTab === "all" && (
              <AllJobsTab
                key="all"
                filteredJobs={filteredJobs}
                handleApply={handleApply}
                hasApplied={hasApplied}
              />
            )}
            {activeTab === "applications" && (
              <ApplicationsTab
                key="applications"
                applications={applications}
                loadApplications={loadApplications}
              />
            )}
            {activeTab === "saved" && (
              <SavedJobsTab
                key="saved"
                savedOffers={savedOffers}
                handleApply={handleApply}
                hasApplied={hasApplied}
              />
            )}
          </AnimatePresence>
        </div>

        {/* Modal de confirmation déconnexion (identique à l'original) */}
        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
              <motion.div
                initial={{ scale: 0.95, y: 20, opacity: 0 }}
                animate={{ scale: 1, y: 0, opacity: 1 }}
                exit={{ scale: 0.95, y: 20, opacity: 0 }}
                transition={{ duration: 0.25 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-100"
              >
                <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-800 px-6 py-8 text-center">
                  <div className="absolute inset-0 bg-white/5" />
                  <div className="relative w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                    <ArrowPathIcon className="w-10 h-10 text-emerald-100" />
                  </div>
                  <h3 className="relative text-2xl font-bold text-white mb-2">Déconnexion</h3>
                  <p className="relative text-sm text-emerald-100/90">Voulez-vous vraiment quitter votre espace candidat ?</p>
                </div>
                <div className="p-6">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4 mb-6">
                    <p className="text-sm text-slate-700 leading-relaxed text-center">
                      Votre session sera fermée et vous serez redirigé vers la page d'accueil.
                    </p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200">
                      Annuler
                    </button>
                    <SignOutButton redirectUrl="/">
                      <button className="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-md">
                        Se déconnecter
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageTransition>
    </div>
  );
}