// frontend/src/page/dashboard/components/DashboardHeader.jsx
import { Link } from "react-router-dom";
import { SparklesIcon, BriefcaseIcon, MapPinIcon, CheckCircleIcon } from "@heroicons/react/24/outline";

export function DashboardHeader({ profile, user, getPhotoUrl, completion, filteredJobs, recommendedJobs }) {
  return (
    <div className="bg-gradient-to-r from-emerald-700 via-emerald-600 to-teal-600 rounded-2xl overflow-hidden shadow-xl mb-8">
      <div className="relative px-6 py-8">
        <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-32 translate-x-32" />
        <div className="absolute bottom-0 left-0 w-48 h-48 bg-white/10 rounded-full translate-y-24 -translate-x-24" />

        <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
          <div className="flex items-center gap-5">
            <div className="relative">
              <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-white/20 to-white/5 backdrop-blur border-2 border-white/30 shadow-xl overflow-hidden">
                {getPhotoUrl() ? (
                  <img src={getPhotoUrl()} alt={profile?.first_name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-white text-2xl font-bold">
                      {profile?.first_name?.charAt(0) || user?.firstName?.charAt(0) || "C"}
                    </span>
                  </div>
                )}
              </div>
              <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-400 rounded-full border-4 border-white flex items-center justify-center">
                <CheckCircleIcon className="w-4 h-4 text-white" />
              </div>
            </div>
            <div>
              <h1 className="text-3xl md:text-4xl font-bold text-white mb-2">
                Bonjour, {profile?.first_name || user?.firstName || "Candidat"} 👋
              </h1>
              <p className="text-emerald-100 flex items-center gap-2">
                <BriefcaseIcon className="w-5 h-5" />
                {profile?.title || "Ajoutez votre titre professionnel"}
              </p>
              <div className="flex flex-wrap gap-3 mt-2">
                {profile?.location && (
                  <p className="text-emerald-50 text-sm flex items-center gap-1">
                    <MapPinIcon className="w-4 h-4" />
                    {profile.location}
                  </p>
                )}
                {profile?.email && (
                  <p className="text-emerald-50 text-sm flex items-center gap-1">
                    <span>✉️</span>
                    {profile.email}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row gap-3">
            <Link
              to="/complete-profile"
              className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl hover:bg-emerald-50 font-semibold transition shadow-lg group"
            >
              <SparklesIcon className="w-5 h-5 group-hover:rotate-12 transition" />
              <span>Compléter mon profil</span>
            </Link>
          </div>
        </div>

        {/* Statistiques */}
        <div className="relative mt-8 grid grid-cols-2 md:grid-cols-4 gap-4">
          <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
            <p className="text-emerald-100 text-sm">Complétion profil</p>
            <p className="text-2xl font-bold text-white">{completion}%</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
            <p className="text-emerald-100 text-sm">Offres disponibles</p>
            <p className="text-2xl font-bold text-white">{filteredJobs.length}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
            <p className="text-emerald-100 text-sm">Compétences</p>
            <p className="text-2xl font-bold text-white">{profile?.skills?.length || 0}</p>
          </div>
          <div className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
            <p className="text-emerald-100 text-sm">Recommandations</p>
            <p className="text-2xl font-bold text-white">{recommendedJobs.length}</p>
          </div>
        </div>
      </div>
    </div>
  );
}