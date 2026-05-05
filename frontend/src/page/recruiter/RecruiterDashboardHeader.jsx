// frontend/src/page/recruiter/RecruiterDashboardHeader.jsx
import { useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BriefcaseIcon, UserGroupIcon, DocumentTextIcon, CheckCircleIcon,
  BuildingOfficeIcon, PlusCircleIcon, SparklesIcon, StarIcon,
  CalendarIcon, EyeIcon, MagnifyingGlassIcon, FunnelIcon, MapPinIcon,
} from "@heroicons/react/24/outline";

// ==================== COMPOSANT D'ENTRÉE DES COMPÉTENCES ====================
const SkillsInput = ({ value = [], onChange, placeholder = "Ajouter une compétence..." }) => {
  const [input, setInput] = useState("");

  const addSkill = () => {
    const skill = input.trim();
    if (skill && !value.includes(skill)) {
      onChange([...value, skill]);
      setInput("");
    }
  };

  const removeSkill = (skillToRemove) => {
    onChange(value.filter(s => s !== skillToRemove));
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      addSkill();
    }
  };

  return (
    <div className="w-full">
      <div className="flex gap-2">
        <input
          type="text"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder={placeholder}
          className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-500"
        />
        <button
          type="button"
          onClick={addSkill}
          className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition"
        >
          Ajouter
        </button>
      </div>
      <div className="flex flex-wrap gap-2 mt-2">
        {value.map(skill => (
          <span key={skill} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
            {skill}
            <button
              type="button"
              onClick={() => removeSkill(skill)}
              className="text-emerald-500 hover:text-red-500 ml-1"
            >
              &times;
            </button>
          </span>
        ))}
      </div>
    </div>
  );
};

// ==================== HEADER COMPOSANT ====================
export function RecruiterDashboardHeader({
  profile,
  statCards,
  searchMode,
  setSearchMode,
  searchTerm,
  setSearchTerm,
  filterStatus,
  setFilterStatus,
  skillsSearch,
  setSkillsSearch,
  searchingSkills,
  handleSearchBySkills,
  recommendedCandidates,
  setSelectedApplication,
  setShowApplicationModal,
  groups,
  applications,
  activeTab,
  setActiveTab,
  offers,
  testResults,
  interviewScheduledCount,
  draftOffers,
}) {
  return (
    <>
      {/* HEADER avec gradient */}
      <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
        <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 rounded-3xl shadow-2xl overflow-visible">
          <div className="relative px-8 py-10">
            <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-48 translate-x-48 blur-3xl" />
            <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl" />
            <div className="relative flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
              <div className="flex items-center gap-5">
                <div className="relative">
                  <div className="w-20 h-20 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-2xl">
                    {profile?.company_name?.charAt(0) || "E"}
                  </div>
                  <div className="absolute -bottom-2 -right-2 w-8 h-8 bg-emerald-500 rounded-full border-4 border-slate-900 flex items-center justify-center">
                    <CheckCircleIcon className="w-4 h-4 text-white" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">{profile?.company_name}</h1>
                  <p className="text-emerald-100 flex items-center gap-2 mt-1">
                    <BuildingOfficeIcon className="w-4 h-4" />
                    {profile?.first_name} {profile?.last_name} • {profile?.position}
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <Link to="/recruiter/job-offers/new" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold transition shadow-lg group">
                  <PlusCircleIcon className="w-5 h-5 group-hover:rotate-90 transition" />
                  Nouvelle offre
                </Link>
              </div>
            </div>
            <div className="grid grid-cols-2 md:grid-cols-9 gap-4 mt-8">
              {statCards.map((s, i) => (
                s.link ? (
                  <Link key={i} to={s.link}>
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: i * 0.05 }}
                      className={`${s.bg} rounded-xl p-3 text-center cursor-pointer hover:shadow-md transition`}
                    >
                      <s.icon className={`w-5 h-5 ${s.tc} mx-auto mb-1`} />
                      <p className={`text-lg font-bold ${s.tc}`}>{s.value}</p>
                      <p className="text-xs text-gray-600">{s.label}</p>
                    </motion.div>
                  </Link>
                ) : (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    className={`${s.bg} rounded-xl p-3 text-center`}
                  >
                    <s.icon className={`w-5 h-5 ${s.tc} mx-auto mb-1`} />
                    <p className={`text-lg font-bold ${s.tc}`}>{s.value}</p>
                    <p className="text-xs text-gray-600">{s.label}</p>
                  </motion.div>
                )
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      {/* BARRE DE RECHERCHE */}
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="mb-8">
        <div className="bg-white rounded-2xl shadow-lg border border-gray-100 p-4">
          <div className="flex gap-2 border-b border-gray-200 pb-3 mb-4">
            <button
              onClick={() => setSearchMode("offers")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                searchMode === "offers"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🔍 Rechercher une offre
            </button>
            <button
              onClick={() => setSearchMode("skills")}
              className={`px-4 py-2 text-sm font-medium rounded-lg transition ${
                searchMode === "skills"
                  ? "bg-emerald-600 text-white shadow-sm"
                  : "bg-gray-100 text-gray-700 hover:bg-gray-200"
              }`}
            >
              🎯 Trouver des candidats par compétences
            </button>
          </div>

          {searchMode === "offers" ? (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="relative md:col-span-2">
                <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <input
                  type="text"
                  placeholder="Rechercher un candidat ou une offre..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                  value={searchTerm}
                  onChange={e => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="relative">
                <FunnelIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                <select
                  className="w-full pl-10 pr-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
                  value={filterStatus}
                  onChange={e => setFilterStatus(e.target.value)}
                >
                  <option value="all">Tous les statuts</option>
                  <option value="pending">⏳ En attente</option>
                  <option value="interview">🤝 Test en attente</option>
                  <option value="accepted">✅ Acceptée</option>
                  <option value="rejected">❌ Refusée</option>
                  <option value="interview_scheduled">📅 Entretien programmé</option>
                </select>
              </div>
            </div>
          ) : (
            <div className="flex flex-col md:flex-row gap-4">
              <div className="flex-1">
                <SkillsInput
                  value={skillsSearch}
                  onChange={setSkillsSearch}
                  placeholder="Ex: React, Python, Gestion de projet..."
                />
              </div>
              <button
                onClick={handleSearchBySkills}
                disabled={searchingSkills || skillsSearch.length === 0}
                className="px-6 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 disabled:opacity-50 transition flex items-center gap-2 shrink-0"
              >
                {searchingSkills ? (
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <SparklesIcon className="w-4 h-4" />
                )}
                Rechercher
              </button>
            </div>
          )}

          {searchMode === "skills" && recommendedCandidates.length > 0 && (
            <div className="mt-6 pt-4 border-t border-gray-100">
              <h3 className="font-semibold text-gray-800 mb-3 flex items-center gap-2">
                <StarIcon className="w-5 h-5 text-amber-500" />
                {recommendedCandidates.length} candidat(s) recommandé(s)
              </h3>
              <div className="space-y-3">
                {recommendedCandidates.map(candidate => (
                  <div key={candidate.id} className="border border-gray-100 rounded-xl p-4 hover:shadow-sm transition bg-gray-50">
                    <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-semibold text-gray-900">{candidate.full_name || candidate.email}</h4>
                          <span className="text-xs font-medium px-2 py-0.5 rounded-full bg-amber-100 text-amber-800">
                            Score {candidate.match_score}%
                          </span>
                        </div>
                        <p className="text-sm text-gray-500">{candidate.title || "Titre non renseigné"}</p>
                        <div className="flex flex-wrap gap-1 mt-1">
                          {candidate.skills?.slice(0, 5).map((skill, idx) => (
                            <span key={idx} className="text-xs bg-gray-100 text-gray-700 px-2 py-0.5 rounded-full">{skill}</span>
                          ))}
                          {candidate.skills?.length > 5 && (
                            <span className="text-xs text-gray-400">+{candidate.skills.length - 5}</span>
                          )}
                        </div>
                        <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                          <MapPinIcon className="w-3 h-3" />
                          {candidate.location || "Localisation non spécifiée"}
                        </p>
                      </div>
                      <button
                        onClick={() => {
                          const fakeApp = {
                            candidate_details: candidate,
                            job_details: null,
                            status: "pending",
                            cover_letter: null,
                          };
                          setSelectedApplication(fakeApp);
                          setShowApplicationModal(true);
                        }}
                        className="px-4 py-2 text-sm border border-gray-300 rounded-lg hover:bg-white transition"
                      >
                        Voir le profil
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {searchMode === "offers" && (
            <div className="flex items-center justify-between mt-3 pt-3 border-t border-gray-100">
              <p className="text-sm text-gray-600">
                <span className="font-semibold">{groups.length}</span> offre{groups.length > 1 ? "s" : ""} •{" "}
                <span className="font-semibold">{groups.reduce((acc, g) => acc + g.apps.length, 0)}</span> candidature{applications.length > 1 ? "s" : ""}
              </p>
              {(searchTerm || filterStatus !== "all") && (
                <button onClick={() => { setSearchTerm(""); setFilterStatus("all"); }} className="text-sm text-emerald-600 hover:text-emerald-700 font-medium">
                  Effacer les filtres
                </button>
              )}
            </div>
          )}
        </div>
      </motion.div>

      {/* TABS */}
      <div className="mb-6 border-b border-gray-200">
        <nav className="flex gap-6 overflow-x-auto pb-1">
          {[
            { key: "applications", icon: DocumentTextIcon, label: `Candidatures par offre (${groups.reduce((acc, g) => acc + g.apps.length, 0)})` },
            { key: "offers", icon: BriefcaseIcon, label: `Mes offres (${offers.length})` },
            { key: "testResults", icon: DocumentTextIcon, label: `Réponses des tests (${testResults.length})` },
            { key: "interviews", icon: CalendarIcon, label: `📅 Entretiens (${interviewScheduledCount})` },
            { key: "drafts", icon: EyeIcon, label: `Brouillons (${draftOffers.length})` },
            { key: "talents", icon: StarIcon, label: `⭐ Base de talents` },
          ].map(tab => (
            <button key={tab.key} onClick={() => setActiveTab(tab.key)}
              className={`pb-4 px-1 font-medium text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
                activeTab === tab.key ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
              }`}>
              <tab.icon className="w-5 h-5" /> {tab.label}
            </button>
          ))}
        </nav>
      </div>
    </>
  );
}