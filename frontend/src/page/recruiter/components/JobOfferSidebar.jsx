// frontend/src/page/recruiter/components/JobOfferSidebar.jsx
import {
  BuildingOfficeIcon,
  EnvelopeIcon,
  PhoneIcon,
  LinkIcon,
  MapPinIcon,
  BriefcaseIcon,
  ClockIcon,
  AcademicCapIcon,
  GlobeAltIcon,
  CurrencyDollarIcon,
  CalendarIcon,
  ChartBarIcon, // ✅ Ajout de l'import manquant
} from "@heroicons/react/24/outline";

export function JobOfferSidebar({ offer, companyName, formatSalary, formatDate }) {
  return (
    <div className="space-y-6">
      <div className="bg-gradient-to-br from-white to-gray-50 rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <BuildingOfficeIcon className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-800">Entreprise</h2>
        </div>
        <div className="space-y-3">
          <p className="font-semibold text-gray-900 text-lg">{companyName}</p>
          {offer.recruiter?.email && <div className="flex items-center gap-2 text-sm text-gray-600"><EnvelopeIcon className="w-4 h-4 text-emerald-500" /><span>{offer.recruiter.email}</span></div>}
          {offer.recruiter?.phone && <div className="flex items-center gap-2 text-sm text-gray-600"><PhoneIcon className="w-4 h-4 text-emerald-500" /><span>{offer.recruiter.phone}</span></div>}
          {offer.recruiter?.website && <div className="flex items-center gap-2 text-sm text-gray-600"><LinkIcon className="w-4 h-4 text-emerald-500" /><a href={offer.recruiter.website} target="_blank" rel="noopener noreferrer" className="text-emerald-600 hover:underline">Site web</a></div>}
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <ChartBarIcon className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-800">Détails du poste</h2>
        </div>
        <div className="space-y-4">
          <div className="flex items-start gap-3 text-gray-600"><MapPinIcon className="w-5 h-5 text-emerald-500 mt-0.5" /><div><p className="font-medium text-gray-700">Localisation</p><p className="text-sm">{offer.location || "Non précisée"}</p></div></div>
          <div className="flex items-start gap-3 text-gray-600"><BriefcaseIcon className="w-5 h-5 text-emerald-500 mt-0.5" /><div><p className="font-medium text-gray-700">Type de contrat</p><p className="text-sm">{offer.contract_type || "Non précisé"}</p></div></div>
          <div className="flex items-start gap-3 text-gray-600"><ClockIcon className="w-5 h-5 text-emerald-500 mt-0.5" /><div><p className="font-medium text-gray-700">Expérience requise</p><p className="text-sm">{offer.experience_level || "Non spécifiée"}</p></div></div>
          {offer.education_level && <div className="flex items-start gap-3 text-gray-600"><AcademicCapIcon className="w-5 h-5 text-emerald-500 mt-0.5" /><div><p className="font-medium text-gray-700">Niveau d'études</p><p className="text-sm">{offer.education_level}</p></div></div>}
          <div className="flex items-start gap-3 text-gray-600"><GlobeAltIcon className="w-5 h-5 text-emerald-500 mt-0.5" /><div><p className="font-medium text-gray-700">Télétravail</p><p className="text-sm">{offer.remote_possible ? "Oui, possible" : "Non, sur site"}</p></div></div>
        </div>
      </div>

      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <CurrencyDollarIcon className="w-5 h-5 text-emerald-600" />
          <h2 className="text-lg font-semibold text-gray-800">Rémunération</h2>
        </div>
        <div className="text-center">
          <p className="text-3xl font-bold text-emerald-600">{formatSalary()}</p>
          {!offer.salary_visible && <p className="text-xs text-gray-400 mt-2">⚠️ Non affiché publiquement</p>}
        </div>
      </div>

      {offer.application_deadline && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <CalendarIcon className="w-5 h-5 text-emerald-600" />
            <h2 className="text-lg font-semibold text-gray-800">Date limite</h2>
          </div>
          <div className="text-center">
            <p className="text-xl font-semibold text-gray-800">{formatDate(offer.application_deadline, { day: "numeric", month: "long", year: "numeric" })}</p>
            {new Date(offer.application_deadline) < new Date() && <p className="text-xs text-red-500 mt-2">⚠️ Date dépassée</p>}
          </div>
        </div>
      )}
    </div>
  );
}