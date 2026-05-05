// frontend/src/page/dashboard/components/ApplicationsTab.jsx
import { motion } from "framer-motion";
import { DocumentTextIcon } from "@heroicons/react/24/outline";
import { CandidatureCard } from "../DashboardCards";

export function ApplicationsTab({ applications, loadApplications }) {
  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="space-y-4"
    >
      {applications.length === 0 ? (
        <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune candidature pour le moment</h3>
          <p className="text-gray-500">Commencez par postuler à des offres qui vous intéressent.</p>
        </div>
      ) : (
        applications.map((app) => (
          <CandidatureCard key={app.id} app={app} onRefresh={loadApplications} />
        ))
      )}
    </motion.div>
  );
}