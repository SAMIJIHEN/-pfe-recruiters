// frontend/src/page/dashboard/components/SavedJobsTab.jsx
import { motion } from "framer-motion";
import { HeartIcon } from "@heroicons/react/24/outline";
import { JobCard } from "../DashboardCards";

export function SavedJobsTab({ savedOffers, handleApply, hasApplied }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {savedOffers.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <HeartIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune offre sauvegardée</h3>
          <p className="text-gray-500">Sauvegardez des offres pour les retrouver plus tard.</p>
        </div>
      ) : (
        savedOffers.map((job) => (
          <JobCard key={job.id} job={job} onApply={handleApply} hasApplied={hasApplied} />
        ))
      )}
    </motion.div>
  );
}