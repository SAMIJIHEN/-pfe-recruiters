// frontend/src/page/dashboard/components/RecommendedTab.jsx
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import { SparklesIcon } from "@heroicons/react/24/outline";
import { JobCard } from "../DashboardCards";

export function RecommendedTab({ loadingRecommendations, recommendedJobs, handleApply, hasApplied }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {loadingRecommendations ? (
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-emerald-600" />
          <p className="ml-3 text-gray-500">Analyse des offres...</p>
        </div>
      ) : recommendedJobs.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <SparklesIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune recommandation pour le moment</h3>
          <p className="text-gray-500">Complétez votre profil pour recevoir des offres personnalisées.</p>
          <Link to="/complete-profile" className="inline-block mt-4 px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700">
            Compléter mon profil
          </Link>
        </div>
      ) : (
        recommendedJobs.map((job) => (
          <JobCard key={job.id} job={job} onApply={handleApply} hasApplied={hasApplied} isRecommended={true} />
        ))
      )}
    </motion.div>
  );
}