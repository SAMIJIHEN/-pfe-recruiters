// frontend/src/page/recruiter/RecruiterDashboardTabs.jsx
import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Link } from "react-router-dom";
import {
  BriefcaseIcon, DocumentTextIcon, CalendarIcon, EyeIcon,
  MapPinIcon, CurrencyDollarIcon, UserGroupIcon, PlusCircleIcon,
  PhoneIcon, TrashIcon, ChevronUpIcon, ChevronDownIcon,
} from "@heroicons/react/24/outline";
import {
  OfferGroup,
  OfferTestResultsGroup,
} from "./RecruiterDashboardComponents";

// ==================== INTERVIEW GROUP ====================
function InterviewGroup({ offer, applications, onViewProfile, onCancelInterview }) {
  const [open, setOpen] = useState(true);

  const formatDate = (dateString) => {
    if (!dateString) return "Date non définie";
    const date = new Date(dateString);
    return date.toLocaleDateString("fr-FR", { day: "numeric", month: "long", year: "numeric" }) + 
           " à " + date.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit" });
  };

  return (
    <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden mb-4">
      <button
        className="w-full text-left px-6 py-5 hover:bg-gray-50 transition"
        onClick={() => setOpen(!open)}
      >
        <div className="flex flex-col md:flex-row md:items-center gap-4">
          <div className="flex items-center gap-4 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xl shrink-0">
              {offer.title?.charAt(0) || "O"}
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-bold text-gray-900 text-base">{offer.title}</h3>
                <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-700">
                  📅 {applications.length} entretien{applications.length > 1 ? "s" : ""}
                </span>
              </div>
              <div className="flex flex-wrap gap-3 mt-1 text-xs text-gray-500">
                <span className="flex items-center gap-1"><MapPinIcon className="w-3.5 h-3.5" />{offer.location || "Localisation non spécifiée"}</span>
                <span className="flex items-center gap-1"><BriefcaseIcon className="w-3.5 h-3.5" />{offer.contract_type || "Type non spécifié"}</span>
              </div>
            </div>
          </div>
          <div className="text-center px-4 py-2 bg-purple-50 rounded-xl">
            <p className="text-lg font-bold text-purple-700">{applications.length}</p>
            <p className="text-xs text-gray-500">entretien{applications.length > 1 ? "s" : ""}</p>
          </div>
          {open ? <ChevronUpIcon className="w-5 h-5 text-gray-400" /> : <ChevronDownIcon className="w-5 h-5 text-gray-400" />}
        </div>
      </button>

      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="overflow-hidden"
          >
            <div className="px-6 pb-6 border-t border-gray-100 pt-4">
              <div className="space-y-3">
                {applications.map((app) => {
                  const candidate = app.candidate_details;
                  const rawPhoto = candidate?.photo;
                  const photoUrl = rawPhoto || null;

                  return (
                    <div key={app.id} className="bg-white border border-gray-100 rounded-xl p-4 hover:shadow-md transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="relative shrink-0">
                            <div className="w-12 h-12 rounded-xl overflow-hidden border-2 border-gray-100 shadow-sm">
                              {photoUrl ? (
                                <img
                                  src={photoUrl}
                                  alt={candidate?.full_name || "Candidat"}
                                  className="w-full h-full object-cover"
                                  onError={(e) => {
                                    e.target.onerror = null;
                                    e.target.parentElement.classList.add("bg-gradient-to-br", "from-purple-500", "to-indigo-600", "flex", "items-center", "justify-center");
                                    e.target.parentElement.innerHTML = `<span class="text-white font-bold text-lg">${(candidate?.full_name?.charAt(0) || "C")}</span>`;
                                  }}
                                />
                              ) : (
                                <div className="w-full h-full bg-gradient-to-br from-purple-500 to-indigo-600 flex items-center justify-center">
                                  <span className="text-white font-bold text-lg">{candidate?.full_name?.charAt(0) || "C"}</span>
                                </div>
                              )}
                            </div>
                          </div>

                          <div>
                            <h4 className="font-semibold text-gray-900">{candidate?.full_name || "Candidat"}</h4>
                            <p className="text-sm text-gray-500">{candidate?.email || "Email non disponible"}</p>
                            {candidate?.phone && (
                              <p className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                                <PhoneIcon className="w-3 h-3" />
                                {candidate.phone}
                              </p>
                            )}
                          </div>
                        </div>

                        <div className="flex flex-wrap items-center gap-3">
                          {app.interview_date && (
                            <span className="text-sm text-purple-600 flex items-center gap-1 bg-purple-50 px-3 py-1.5 rounded-full">
                              <CalendarIcon className="w-4 h-4" />
                              {formatDate(app.interview_date)}
                            </span>
                          )}
                          {app.interview_link && (
                            <a
                              href={app.interview_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-emerald-600 hover:underline flex items-center gap-1"
                            >
                              🔗 Lien visio
                            </a>
                          )}
                          <button
                            onClick={() => onViewProfile(app)}
                            className="px-3 py-1.5 text-xs font-medium border border-gray-200 rounded-lg hover:bg-gray-50 transition"
                          >
                            Voir profil
                          </button>
                          <button
                            onClick={() => onCancelInterview && onCancelInterview(app.id)}
                            className="px-3 py-1.5 text-xs font-medium bg-red-50 text-red-600 border border-red-200 rounded-lg hover:bg-red-100 transition flex items-center gap-1"
                          >
                            <TrashIcon className="w-3.5 h-3.5" />
                            Annuler
                          </button>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

// ==================== TABS CONTENT ====================
export function RecruiterDashboardTabs({
  activeTab,
  groups,
  offers,
  testResultGroups,
  interviewGroups,
  draftOffers,
  applications,
  offersScoresState,
  handleStatusChange,
  setSelectedApplication,
  setShowApplicationModal,
  handleViewTest,
  sendingTestId,
  handleOpenTestEditor,
  handleCalculateScoresForOffer,
  handleScheduleInterview,
  handlePublishOffer,
  handleCancelInterview,
}) {
  return (
    <AnimatePresence mode="wait">
      {/* ONGLET 1 : CANDIDATURES PAR OFFRE */}
      {activeTab === "applications" && (
        <motion.div key="applications" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          {groups.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune candidature trouvée</h3>
              <p className="text-gray-500">Modifiez vos filtres ou créez de nouvelles offres.</p>
            </div>
          ) : (
            groups.map(({ offer, apps }) => {
              const offerState = offersScoresState[offer.id] || { scores: {}, scoresDone: false, scoringAll: false, scoredCount: 0, scoringError: "" };
              return (
                <OfferGroup
                  key={offer.id}
                  offer={offer}
                  applications={apps}
                  onStatusChange={handleStatusChange}
                  onView={app => { setSelectedApplication(app); setShowApplicationModal(true); }}
                  onViewTest={handleViewTest}
                  sendingTestId={sendingTestId}
                  onOpenTestEditor={handleOpenTestEditor}
                  scores={offerState.scores}
                  scoresDone={offerState.scoresDone}
                  scoringAll={offerState.scoringAll}
                  scoredCount={offerState.scoredCount}
                  scoringError={offerState.scoringError}
                  onCalculateScores={() => handleCalculateScoresForOffer(offer.id, apps)}
                  onScheduleInterview={handleScheduleInterview}
                />
              );
            })
          )}
        </motion.div>
      )}

      {/* ONGLET 2 : MES OFFRES */}
      {activeTab === "offers" && (
        <motion.div key="offers" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          {offers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <BriefcaseIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune offre créée</h3>
              <Link to="/recruiter/job-offers/new" className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700">
                <PlusCircleIcon className="w-5 h-5" />Créer ma première offre
              </Link>
            </div>
          ) : (
            offers.map(offer => {
              const offerApps = applications.filter(a => String(a.job) === String(offer.id));
              const interviewCount = offerApps.filter(a => a.status === "interview_scheduled").length;
              return (
                <motion.div key={offer.id} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-xl border border-gray-100 p-6 hover:shadow-lg transition">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                        <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                          offer.status === "active" ? "bg-green-100 text-green-700" :
                          offer.status === "draft" ? "bg-gray-100 text-gray-700" : "bg-red-100 text-red-700"
                        }`}>
                          {offer.status === "active" ? "Active" : offer.status === "draft" ? "Brouillon" : "Fermée"}
                        </span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" />{offer.location}</span>
                        <span className="flex items-center gap-1"><BriefcaseIcon className="w-4 h-4" />{offer.contract_type}</span>
                        {offer.salary_min && <span className="flex items-center gap-1"><CurrencyDollarIcon className="w-4 h-4" />{offer.salary_min}–{offer.salary_max} TND</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><UserGroupIcon className="w-4 h-4" />{offerApps.length} candidatures</span>
                        {interviewCount > 0 && (
                          <span className="flex items-center gap-1 text-purple-600"><CalendarIcon className="w-4 h-4" />{interviewCount} entretien{interviewCount > 1 ? "s" : ""}</span>
                        )}
                        <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4" />{offer.views_count || 0} vues</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/recruiter/job-offers/${offer.id}`} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">Détails</Link>
                      {offer.status === "draft" && (
                        <button onClick={() => handlePublishOffer(offer.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">Publier</button>
                      )}
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}

      {/* ONGLET 3 : RÉPONSES DES TESTS */}
      {activeTab === "testResults" && (
        <motion.div key="testResults" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          {testResultGroups.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun test complété</h3>
              <p className="text-gray-500">Les réponses des tests apparaîtront ici une fois que les candidats auront complété leurs évaluations.</p>
            </div>
          ) : (
            testResultGroups.map(({ offer, results }) => (
              <OfferTestResultsGroup 
                key={offer.id} 
                offer={offer} 
                testResults={results} 
                onViewDetails={handleViewTest}
                onScheduleInterview={handleScheduleInterview}
              />
            ))
          )}
        </motion.div>
      )}

      {/* ONGLET 4 : ENTRETIENS */}
      {activeTab === "interviews" && (
        <motion.div key="interviews" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          {interviewGroups.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <CalendarIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucun entretien programmé</h3>
              <p className="text-gray-500">Les candidats invités à un entretien apparaîtront ici.</p>
            </div>
          ) : (
            interviewGroups.map(({ offer, apps }) => (
              <InterviewGroup
                key={offer.id}
                offer={offer}
                applications={apps}
                onViewProfile={(app) => { setSelectedApplication(app); setShowApplicationModal(true); }}
                onCancelInterview={handleCancelInterview}
              />
            ))
          )}
        </motion.div>
      )}

      {/* ONGLET 5 : BROUILLONS */}
      {activeTab === "drafts" && (
        <motion.div key="drafts" initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: -20 }} className="space-y-4">
          {draftOffers.length === 0 ? (
            <div className="bg-white rounded-xl p-12 text-center border border-gray-100">
              <EyeIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-900 mb-2">Aucune offre en brouillon</h3>
              <p className="text-gray-500">Vos offres non publiées apparaîtront ici.</p>
            </div>
          ) : (
            draftOffers.map(offer => {
              const offerApps = applications.filter(a => String(a.job) === String(offer.id));
              return (
                <motion.div key={offer.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="bg-white rounded-2xl border border-gray-100 p-6 hover:shadow-md transition">
                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-gray-900">{offer.title}</h3>
                        <span className="px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-700">Brouillon</span>
                      </div>
                      <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-600">
                        <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" />{offer.location}</span>
                        <span className="flex items-center gap-1"><BriefcaseIcon className="w-4 h-4" />{offer.contract_type}</span>
                        {offer.salary_min && <span className="flex items-center gap-1"><CurrencyDollarIcon className="w-4 h-4" />{offer.salary_min}–{offer.salary_max} TND</span>}
                      </div>
                      <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                        <span className="flex items-center gap-1"><UserGroupIcon className="w-4 h-4" />{offerApps.length} candidatures</span>
                        <span className="flex items-center gap-1"><EyeIcon className="w-4 h-4" />{offer.views_count || 0} vues</span>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Link to={`/recruiter/job-offers/${offer.id}`} className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50 text-sm">Détails</Link>
                      <button onClick={() => handlePublishOffer(offer.id)} className="px-4 py-2 bg-emerald-600 text-white rounded-lg hover:bg-emerald-700 text-sm">Publier</button>
                    </div>
                  </div>
                </motion.div>
              );
            })
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}