// frontend/src/page/recruiter/components/JobOfferStats.jsx
import { UserGroupIcon, EyeIcon, CalendarIcon, BriefcaseIcon } from "@heroicons/react/24/outline";

export function JobOfferStats({ totalApplications, applicationsLoading, viewsCount, offer, formatDate }) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-8">
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Candidatures reçues</p><p className="text-3xl font-bold text-gray-900 mt-1">{applicationsLoading ? "..." : totalApplications}</p></div>
          <div className="w-12 h-12 bg-blue-100 rounded-xl flex items-center justify-center"><UserGroupIcon className="w-6 h-6 text-blue-600" /></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Total des candidatures</p>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Vues totales</p><p className="text-3xl font-bold text-gray-900 mt-1">{viewsCount}</p></div>
          <div className="w-12 h-12 bg-purple-100 rounded-xl flex items-center justify-center"><EyeIcon className="w-6 h-6 text-purple-600" /></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">Nombre de consultations</p>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Date de création</p><p className="text-xl font-bold text-gray-900 mt-1">{formatDate(offer.created_at, { day: "numeric", month: "long", year: "numeric" })}</p></div>
          <div className="w-12 h-12 bg-emerald-100 rounded-xl flex items-center justify-center"><CalendarIcon className="w-6 h-6 text-emerald-600" /></div>
        </div>
      </div>
      <div className="bg-white rounded-2xl p-5 border border-gray-100 shadow-sm">
        <div className="flex items-center justify-between">
          <div><p className="text-sm text-gray-500">Type de contrat</p><p className="text-xl font-bold text-gray-900 mt-1">{offer.contract_type || "—"}</p></div>
          <div className="w-12 h-12 bg-amber-100 rounded-xl flex items-center justify-center"><BriefcaseIcon className="w-6 h-6 text-amber-600" /></div>
        </div>
        <p className="text-xs text-gray-400 mt-2">{offer.remote_possible ? "Télétravail possible" : "Poste sur site"}</p>
      </div>
    </div>
  );
}