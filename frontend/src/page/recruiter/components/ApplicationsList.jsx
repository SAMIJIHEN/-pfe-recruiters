// frontend/src/page/recruiter/components/ApplicationsList.jsx
import { UserGroupIcon, ArrowLeftIcon } from "@heroicons/react/24/outline";
import { useNavigate } from "react-router-dom";

export function ApplicationsList({ applications, formatDate }) {
  const navigate = useNavigate();
  if (applications.length === 0) return null;

  return (
    <div className="mt-8">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2">
          <UserGroupIcon className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-800">Candidatures récentes</h2>
        </div>
        <button onClick={() => navigate("/recruiter-dashboard")} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium flex items-center gap-1">
          Retour au dashboard <ArrowLeftIcon className="w-3 h-3 rotate-180" />
        </button>
      </div>
      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        {applications.slice(0, 5).map((app, index) => (
          <div key={app.id} className={`p-4 hover:bg-gray-50 transition ${index < applications.length - 1 ? "border-b border-gray-100" : ""}`}>
            <div className="flex items-center justify-between gap-4">
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-10 h-10 bg-gradient-to-br from-emerald-500 to-emerald-600 rounded-full flex items-center justify-center text-white font-bold shadow-sm shrink-0">
                  {app.candidate_details?.full_name?.charAt(0) || app.candidateName?.charAt(0) || "C"}
                </div>
                <div className="min-w-0">
                  <p className="font-medium text-gray-900 truncate">{app.candidate_details?.full_name || app.candidateName || "Candidat"}</p>
                  <p className="text-sm text-gray-500 truncate">{app.candidate_details?.email || app.candidateEmail || "Email non disponible"}</p>
                </div>
              </div>
              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-gray-400">{formatDate(app.applied_at)}</span>
                {app.matchScore ? (
                  <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-medium">Score {app.matchScore}%</span>
                ) : (
                  <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-medium">Nouveau</span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}