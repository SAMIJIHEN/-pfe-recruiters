// frontend/src/page/recruiter/components/JobOfferHeader.jsx
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  BuildingOfficeIcon,
  MapPinIcon,
  BriefcaseIcon,
  CalendarIcon,
  PencilIcon,
  TrashIcon,
  RocketLaunchIcon,
  XCircleIcon,
  CheckCircleIcon,   // ✅ AJOUT
} from "@heroicons/react/24/outline";

function StatusBadge({ status }) {
  const config = {
    active: { label: "Active", icon: <CheckCircleIcon className="w-5 h-5" />, bg: "bg-green-100", text: "text-green-700", border: "border-green-200" },
    draft: { label: "Brouillon", icon: <PencilIcon className="w-5 h-5" />, bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" },
    closed: { label: "Fermée", icon: <XCircleIcon className="w-5 h-5" />, bg: "bg-red-100", text: "text-red-700", border: "border-red-200" },
  };
  const cfg = config[status] || { label: status || "Inconnu", icon: null, bg: "bg-gray-100", text: "text-gray-700", border: "border-gray-200" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full text-sm font-semibold ${cfg.bg} ${cfg.text} border ${cfg.border}`}>
      {cfg.icon} {cfg.label}
    </span>
  );
}

export function JobOfferHeader({ offer, companyName, onPublish, onClose, onDeleteClick, formatDate }) {
  return (
    <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 rounded-3xl shadow-2xl overflow-hidden">
      <div className="relative px-8 py-10">
        <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-48 translate-x-48 blur-3xl" />
        <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl" />

        <div className="relative">
          <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
            <div className="flex items-center gap-6">
              <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl border-2 border-white/30">
                <span className="text-4xl font-bold text-white">{companyName.charAt(0).toUpperCase()}</span>
              </div>
              <div>
                <div className="flex items-center gap-3 flex-wrap">
                  <h1 className="text-3xl font-bold text-white">{offer.title}</h1>
                  <StatusBadge status={offer.status} />
                </div>
                <div className="flex items-center gap-2 mt-3">
                  <BuildingOfficeIcon className="w-5 h-5 text-emerald-300" />
                  <p className="text-emerald-100 text-lg font-medium">{companyName}</p>
                </div>
                <div className="flex flex-wrap gap-4 mt-3 text-sm text-emerald-200">
                  <span className="flex items-center gap-1.5">
                    <MapPinIcon className="w-4 h-4" />
                    {offer.location || "Lieu non précisé"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <BriefcaseIcon className="w-4 h-4" />
                    {offer.contract_type || "Contrat non précisé"}
                  </span>
                  <span className="flex items-center gap-1.5">
                    <CalendarIcon className="w-4 h-4" />
                    Publiée le {formatDate(offer.created_at)}
                  </span>
                </div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {offer.status === "draft" && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onPublish}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 font-semibold transition-all shadow-lg">
                  <RocketLaunchIcon className="w-5 h-5" /> Publier l'offre
                </motion.button>
              )}
              {offer.status === "active" && (
                <motion.button whileHover={{ scale: 1.02 }} whileTap={{ scale: 0.98 }} onClick={onClose}
                  className="inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-amber-500 to-orange-600 text-white rounded-xl hover:from-amber-600 hover:to-orange-700 font-semibold transition-all shadow-lg">
                  <XCircleIcon className="w-5 h-5" /> Fermer l'offre
                </motion.button>
              )}
              <Link to={`/recruiter/job-offers/${offer.id}/edit`} className="p-3 bg-white/10 backdrop-blur border border-white/30 rounded-xl hover:bg-white/20 transition">
                <PencilIcon className="w-5 h-5 text-white" />
              </Link>
              <motion.button whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }} onClick={onDeleteClick}
                className="p-3 bg-white/10 backdrop-blur border border-white/30 rounded-xl hover:bg-red-500/30 transition">
                <TrashIcon className="w-5 h-5 text-white" />
              </motion.button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}