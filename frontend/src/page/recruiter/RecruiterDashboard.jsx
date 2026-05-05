// frontend/src/page/recruiter/RecruiterDashboard.jsx
import { useState, useEffect, useRef, useMemo } from "react";
import { useUser, SignOutButton } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavbarPro from "../../components/layout/NavbarPro";
import PageTransition from "../../components/common/PageTransition";
import api from "../../services/api";
import RecruiterTestEditor from "./RecruiterTestEditor";
import TalentPoolList from "./TalentPoolList";
import {
  BriefcaseIcon, UserGroupIcon, DocumentTextIcon, CheckCircleIcon,
  XCircleIcon, ArrowPathIcon, BuildingOfficeIcon, PlusCircleIcon,
  SparklesIcon, StarIcon, CalendarIcon, EyeIcon,
} from "@heroicons/react/24/outline";

import {
  computeScore,
} from "./RecruiterDashboardUtils";

import {
  OfferGroup,
  OfferTestResultsGroup,
} from "./RecruiterDashboardComponents";

import {
  TestAnswersModal,
  TestEditorModal,
  CandidateProfileModal,
} from "./RecruiterDashboardModals";

import { addToTalentPool } from "../../services/api";

import { RecruiterDashboardHeader } from "./RecruiterDashboardHeader";
import { RecruiterDashboardTabs } from "./RecruiterDashboardTabs";

// ==================== PAGE PRINCIPALE ====================
export default function RecruiterDashboard() {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [stats, setStats] = useState(null);
  const [offers, setOffers] = useState([]);
  const [applications, setApplications] = useState([]);
  const [testResults, setTestResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [sendingTestId, setSendingTestId] = useState(null);

  const [showTestViewModal, setShowTestViewModal] = useState(false);
  const [viewingTest, setViewingTest] = useState(null);

  const [activeTab, setActiveTab] = useState("applications");
  const [searchTerm, setSearchTerm] = useState("");
  const [filterStatus, setFilterStatus] = useState("all");
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [showApplicationModal, setShowApplicationModal] = useState(false);
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);
  const [showWelcome, setShowWelcome] = useState(false);
  const [welcomeData, setWelcomeData] = useState(null);

  const welcomeTimerRef = useRef(null);

  const [showTestEditor, setShowTestEditor] = useState(false);
  const [currentTestApp, setCurrentTestApp] = useState(null);
  const [offersScoresState, setOffersScoresState] = useState({});

  const [searchMode, setSearchMode] = useState("offers");
  const [skillsSearch, setSkillsSearch] = useState([]);
  const [recommendedCandidates, setRecommendedCandidates] = useState([]);
  const [searchingSkills, setSearchingSkills] = useState(false);

  const draftOffers = useMemo(() => offers.filter(o => o.status === "draft"), [offers]);
  const [talentsStatus, setTalentsStatus] = useState({});

  useEffect(() => {
    if (!isLoaded) return;
    const loadData = async () => {
      try {
        setError(null);
        if (!isSignedIn || !user) { navigate("/login", { replace: true }); return; }
        
        const profileRes = await api.get("/recruiter-profile/");
        const profileData = profileRes.data;
        setProfile(profileData);
        
        if (!profileData || profileData.status !== "approved") {
          navigate("/recruiter-pending", { replace: true });
          return;
        }
        
        try { 
          const statsRes = await api.get("/recruiters/stats/"); 
          setStats(statsRes.data); 
        } catch (_) {}
        
        let offersData = [];
        try {
          const offersRes = await api.get("/job-offers/my_offers/");
          offersData = offersRes.data.results || offersRes.data || [];
          setOffers(offersData);
        } catch (_) { setOffers([]); }
        
        try {
          const appsRes = await api.get("/applications/for-recruiter/");
          const appsData = appsRes.data.results || appsRes.data || [];
          setApplications(appsData);
          
          const testResultsData = appsData
            .filter(app => {
              const hasQ = app.test_questions && app.test_questions.length > 0;
              const hasR = app.test_result && Object.keys(app.test_result).length > 0;
              const isDone = app.test_completed_at !== null;
              return hasQ && (hasR || isDone);
            })
            .map(app => ({
              id: app.id,
              candidate_name: app.candidate_details?.full_name || "Candidat",
              candidate_email: app.candidate_details?.email,
              job_title: app.job_details?.title || "Offre",
              job_id: app.job,
              completed_at: app.test_completed_at || app.updated_at || app.applied_at,
              questions: app.test_questions || [],
              result: app.test_result || {},
              candidate_details: app.candidate_details,
              job_details: app.job_details,
            }));
          setTestResults(testResultsData);
        } catch (err) {
          console.error("Erreur chargement candidatures:", err);
          setApplications([]);
          setTestResults([]);
        }
        
        const firstLogin = localStorage.getItem("recruiter-first-login");
        if (!firstLogin) {
          setShowWelcome(true);
          setWelcomeData(profileData);
          localStorage.setItem("recruiter-first-login", "true");
          welcomeTimerRef.current = setTimeout(() => setShowWelcome(false), 4000);
        }
      } catch (err) {
        if (err.response?.status === 404) navigate("/recruiter/company-profile", { replace: true });
        else setError("Erreur de chargement des données");
      } finally {
        setLoading(false);
      }
    };
    loadData();
    return () => {
      clearTimeout(welcomeTimerRef.current);
    };
  }, [isLoaded, isSignedIn, user, navigate]);

  const handleOpenTestEditor = (app) => {
    setCurrentTestApp(app);
    setShowTestEditor(true);
  };

  const handleViewTest = async (applicationId) => {
    try {
      let id = applicationId;
      if (typeof applicationId === "object" && applicationId !== null) id = applicationId.id || applicationId;
      if (!id) { setMessage({ text: "ID de candidature invalide", type: "error" }); setTimeout(() => setMessage({ text: "", type: "" }), 3000); return; }
      const response = await api.get(`/applications/${id}/get-test/`);
      const app = applications.find(a => a.id === id);
      if (response.data) {
        const questions = response.data.test_questions || [];
        const result = response.data.test_result || {};
        if (questions.length > 0) {
          setViewingTest({ id, questions, result, candidate_name: app?.candidate_details?.full_name || "Candidat", job_title: app?.job_details?.title || "Offre" });
          setShowTestViewModal(true);
        } else {
          setMessage({ text: "Aucune question trouvée pour ce test", type: "info" });
          setTimeout(() => setMessage({ text: "", type: "" }), 3000);
        }
      }
    } catch (error) {
      console.error("Erreur chargement test:", error);
      setMessage({ text: "Erreur lors du chargement du test", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handlePublishOffer = async (offerId) => {
    try {
      await api.post(`/job-offers/${offerId}/publish/`);
      const offersRes = await api.get("/job-offers/my_offers/");
      const offersData = offersRes.data.results || offersRes.data || [];
      setOffers(offersData);
      setMessage({ text: "✅ Offre publiée avec succès !", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Erreur publication :", error);
      setMessage({ text: "❌ Erreur lors de la publication", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleStatusChange = async (appId, newStatus) => {
    try {
      await api.patch(`/applications/${appId}/`, { status: newStatus });
      setApplications(prev => prev.map(a => a.id === appId ? { ...a, status: newStatus } : a));
      setMessage({ text: "✅ Statut mis à jour", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 2000);
    } catch (err) { 
      console.error("Erreur changement statut:", err);
      setMessage({ text: "❌ Erreur lors du changement de statut", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleScheduleInterview = async (applicationId, interviewData) => {
    try {
      const response = await api.post(`/applications/${applicationId}/schedule-interview/`, interviewData);
      if (response.data.success) {
        setMessage({ text: "✅ Entretien programmé avec succès !", type: "success" });
        const appsRes = await api.get("/applications/for-recruiter/");
        const appsData = appsRes.data.results || appsRes.data || [];
        setApplications(appsData);
        
        const testResultsData = appsData
          .filter(app => {
            const hasQ = app.test_questions && app.test_questions.length > 0;
            const hasR = app.test_result && Object.keys(app.test_result).length > 0;
            const isDone = app.test_completed_at !== null;
            return hasQ && (hasR || isDone);
          })
          .map(app => ({
            id: app.id,
            candidate_name: app.candidate_details?.full_name || "Candidat",
            candidate_email: app.candidate_details?.email,
            job_title: app.job_details?.title || "Offre",
            job_id: app.job,
            completed_at: app.test_completed_at || app.updated_at || app.applied_at,
            questions: app.test_questions || [],
            result: app.test_result || {},
            candidate_details: app.candidate_details,
            job_details: app.job_details,
          }));
        setTestResults(testResultsData);
        
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    } catch (error) {
      console.error("Erreur programmation entretien:", error);
      setMessage({ text: "❌ Erreur lors de la programmation de l'entretien", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      throw error;
    }
  };

  const handleCancelInterview = async (applicationId) => {
    if (!window.confirm("Annuler cet entretien ? Le candidat sera remis dans la liste des candidatures.")) return;
    try {
      await api.patch(`/applications/${applicationId}/`, { status: "reviewed" });
      setMessage({ text: "✅ Entretien annulé, candidat remis dans la liste", type: "success" });
      const appsRes = await api.get("/applications/for-recruiter/");
      const appsData = appsRes.data.results || appsRes.data || [];
      setApplications(appsData);
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Erreur annulation entretien:", error);
      setMessage({ text: "❌ Erreur lors de l'annulation", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleAddToTalentPool = async (candidateId) => {
    try {
      await addToTalentPool(candidateId, "Ajouté depuis le profil candidat", 0);
      setTalentsStatus(prev => ({ ...prev, [candidateId]: true }));
      setMessage({ text: "✅ Candidat ajouté à la base de talents", type: "success" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      console.error("Erreur ajout base talents:", error);
      setMessage({ text: "❌ Erreur lors de l'ajout", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const handleCalculateScoresForOffer = async (offerId, applicationsList) => {
    setOffersScoresState(prev => ({
      ...prev,
      [offerId]: { scoringAll: true, scores: {}, scoredCount: 0, scoresDone: false, scoringError: "" }
    }));

    const loadingState = {};
    applicationsList.forEach(app => { loadingState[app.id] = { loading: true }; });
    setOffersScoresState(prev => ({
      ...prev,
      [offerId]: { ...prev[offerId], scores: loadingState }
    }));

    const newScores = { ...loadingState };
    let done = 0;

    for (const app of applicationsList) {
      try {
        const result = await computeScore(app);
        newScores[app.id] = { score: result.score, comment: result.comment, loading: false };
        done++;
        setOffersScoresState(prev => ({
          ...prev,
          [offerId]: { ...prev[offerId], scores: { ...newScores }, scoredCount: done }
        }));
      } catch {
        newScores[app.id] = { score: null, comment: "", loading: false, error: true };
        setOffersScoresState(prev => ({
          ...prev,
          [offerId]: { ...prev[offerId], scoringError: "Erreur lors du calcul" }
        }));
      }
      await new Promise(r => setTimeout(r, 300));
    }

    setOffersScoresState(prev => ({
      ...prev,
      [offerId]: { ...prev[offerId], scoringAll: false, scoresDone: true, scores: newScores }
    }));
  };

  const handleSearchBySkills = async () => {
    if (skillsSearch.length === 0) {
      setMessage({ text: "Veuillez saisir au moins une compétence", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }
    setSearchingSkills(true);
    try {
      const res = await api.post("/job-offers/recommend-candidates-by-skills/", {
        skills: skillsSearch
      });
      setRecommendedCandidates(res.data);
      if (res.data.length === 0) {
        setMessage({ text: "Aucun candidat trouvé pour ces compétences", type: "info" });
        setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      }
    } catch (error) {
      console.error("Erreur recherche par compétences:", error);
      setMessage({ text: "Erreur lors de la recherche", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } finally {
      setSearchingSkills(false);
    }
  };

  const groupByOffer = () => {
    let filtered = [...applications];
    filtered = filtered.filter(a => a.status !== "interview_scheduled");
    
    if (searchTerm) {
      const kw = searchTerm.toLowerCase();
      filtered = filtered.filter(a =>
        a.candidate_details?.full_name?.toLowerCase().includes(kw) ||
        a.job_details?.title?.toLowerCase().includes(kw)
      );
    }
    if (filterStatus !== "all") filtered = filtered.filter(a => a.status === filterStatus);
    const map = new Map();
    filtered.forEach(app => {
      const jobId = String(app.job || app.job_details?.id || "unknown");
      if (!map.has(jobId)) map.set(jobId, []);
      map.get(jobId).push(app);
    });
    const groups = [];
    map.forEach((apps, jobId) => {
      const offer = offers.find(o => String(o.id) === jobId) || {
        id: jobId, title: apps[0]?.job_details?.title || "Offre inconnue",
        location: apps[0]?.job_details?.location || "—", contract_type: apps[0]?.job_details?.contract_type || "—", status: "active",
      };
      groups.push({ offer, apps });
    });
    return groups.sort((a, b) => b.apps.length - a.apps.length);
  };

  const groupTestResultsByOffer = () => {
    const map = new Map();
    testResults.forEach(result => {
      const jobId = String(result.job_id || "unknown");
      if (!map.has(jobId)) map.set(jobId, []);
      map.get(jobId).push(result);
    });
    const groups = [];
    map.forEach((results, jobId) => {
      const offer = offers.find(o => String(o.id) === jobId) || { id: jobId, title: results[0]?.job_title || "Offre inconnue" };
      groups.push({ offer, results });
    });
    return groups.sort((a, b) => b.results.length - a.results.length);
  };

  const groupInterviewsByOffer = () => {
    const interviewApps = applications.filter(a => a.status === "interview_scheduled");
    const map = new Map();
    interviewApps.forEach(app => {
      const jobId = String(app.job || app.job_details?.id || "unknown");
      if (!map.has(jobId)) map.set(jobId, []);
      map.get(jobId).push(app);
    });
    const groups = [];
    map.forEach((apps, jobId) => {
      const offer = offers.find(o => String(o.id) === jobId) || {
        id: jobId, title: apps[0]?.job_details?.title || "Offre inconnue",
        location: apps[0]?.job_details?.location || "—", contract_type: apps[0]?.job_details?.contract_type || "—", status: "active",
      };
      groups.push({ offer, apps });
    });
    return groups.sort((a, b) => b.apps.length - a.apps.length);
  };

  const totalApplications = applications.length;
  const pendingCount = applications.filter(a => a.status === "pending").length;
  const interviewCount = applications.filter(a => a.status === "interview").length;
  const acceptedCount = applications.filter(a => a.status === "accepted").length;
  const interviewScheduledCount = applications.filter(a => a.status === "interview_scheduled").length;
  const completedTestsCount = testResults.length;

  const statCards = [
    { label: "Offres actives", value: stats?.active_offers || offers.filter(o => o.status === "active").length, icon: BriefcaseIcon, bg: "bg-emerald-50", tc: "text-emerald-700" },
    { label: "Candidatures totales", value: totalApplications, icon: UserGroupIcon, bg: "bg-blue-50", tc: "text-blue-700" },
    { label: "En attente", value: pendingCount, icon: ArrowPathIcon, bg: "bg-amber-50", tc: "text-amber-700" },
    { label: "Test en attente", value: interviewCount, icon: SparklesIcon, bg: "bg-purple-50", tc: "text-purple-700" },
    { label: "Tests complétés", value: completedTestsCount, icon: DocumentTextIcon, bg: "bg-indigo-50", tc: "text-indigo-700" },
    { label: "Acceptées", value: acceptedCount, icon: CheckCircleIcon, bg: "bg-green-50", tc: "text-green-700" },
    { label: "Entretiens", value: interviewScheduledCount, icon: CalendarIcon, bg: "bg-purple-50", tc: "text-purple-700" },
    { label: "Vues totales", value: stats?.total_views || 0, icon: EyeIcon, bg: "bg-gray-50", tc: "text-gray-700" },
    { label: "Base de talents", value: "→", icon: StarIcon, bg: "bg-amber-50", tc: "text-amber-700", link: "/recruiter/talent-pool" },
  ];

  const groups = groupByOffer();
  const testResultGroups = groupTestResultsByOffer();
  const interviewGroups = groupInterviewsByOffer();

  if (loading || !isLoaded) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <NavbarPro />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BuildingOfficeIcon className="w-8 h-8 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Chargement de votre espace recruteur...</p>
          </div>
        </div>
      </div>
    );
  }

  if (showWelcome) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
        <NavbarPro />
        <PageTransition>
          <div className="max-w-2xl mx-auto px-4 py-20">
            <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} className="bg-white rounded-3xl shadow-2xl overflow-visible">
              <div className="bg-gradient-to-r from-emerald-600 to-emerald-500 px-8 py-12 text-center">
                <div className="w-28 h-28 bg-white/20 rounded-full flex items-center justify-center mx-auto border-4 border-white/30">
                  <span className="text-5xl">🎉</span>
                </div>
                <h1 className="text-3xl font-bold text-white mt-6">Félicitations {welcomeData?.first_name} !</h1>
                <p className="text-emerald-100 mt-2">Votre compte pour {welcomeData?.company_name} est maintenant actif</p>
              </div>
              <div className="p-8">
                <button onClick={() => setShowWelcome(false)} className="w-full px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold">
                  Accéder au tableau de bord
                </button>
              </div>
            </motion.div>
          </div>
        </PageTransition>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
        <NavbarPro />
        <div className="max-w-md mx-auto px-4 py-20 text-center">
          <XCircleIcon className="w-16 h-16 text-red-500 mx-auto mb-4" />
          <h2 className="text-xl font-bold text-red-800 mb-2">Erreur</h2>
          <p className="text-red-600 mb-6">{error}</p>
          <button onClick={() => window.location.reload()} className="px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700">Réessayer</button>
        </div>
      </div>
    );
  }

  if (activeTab === "talents") {
    return <TalentPoolList />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-emerald-50">
      <NavbarPro />
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          
          {message.text && (
            <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
              className={`mb-6 p-4 rounded-xl ${message.type === "success" ? "bg-emerald-50 text-emerald-700 border border-emerald-200" : "bg-red-50 text-red-700 border border-red-200"}`}>
              {message.text}
            </motion.div>
          )}

          <RecruiterDashboardHeader
            profile={profile}
            statCards={statCards}
            searchMode={searchMode}
            setSearchMode={setSearchMode}
            searchTerm={searchTerm}
            setSearchTerm={setSearchTerm}
            filterStatus={filterStatus}
            setFilterStatus={setFilterStatus}
            skillsSearch={skillsSearch}
            setSkillsSearch={setSkillsSearch}
            searchingSkills={searchingSkills}
            handleSearchBySkills={handleSearchBySkills}
            recommendedCandidates={recommendedCandidates}
            setSelectedApplication={setSelectedApplication}
            setShowApplicationModal={setShowApplicationModal}
            groups={groups}
            applications={applications}
            activeTab={activeTab}
            setActiveTab={setActiveTab}
            offers={offers}
            testResults={testResults}
            interviewScheduledCount={interviewScheduledCount}
            draftOffers={draftOffers}
          />

          <RecruiterDashboardTabs
            activeTab={activeTab}
            groups={groups}
            offers={offers}
            testResultGroups={testResultGroups}
            interviewGroups={interviewGroups}
            draftOffers={draftOffers}
            applications={applications}
            offersScoresState={offersScoresState}
            handleStatusChange={handleStatusChange}
            setSelectedApplication={setSelectedApplication}
            setShowApplicationModal={setShowApplicationModal}
            handleViewTest={handleViewTest}
            sendingTestId={sendingTestId}
            handleOpenTestEditor={handleOpenTestEditor}
            handleCalculateScoresForOffer={handleCalculateScoresForOffer}
            handleScheduleInterview={handleScheduleInterview}
            handlePublishOffer={handlePublishOffer}
            handleCancelInterview={handleCancelInterview}
          />
        </div>

        <AnimatePresence>
          {showTestViewModal && viewingTest && (
            <TestAnswersModal test={viewingTest} onClose={() => setShowTestViewModal(false)} />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showTestEditor && currentTestApp && (
            <TestEditorModal
              app={currentTestApp}
              onClose={() => { setShowTestEditor(false); setCurrentTestApp(null); }}
              onSendSuccess={async () => {
                const response = await api.get("/applications/for-recruiter/");
                const appsData = response.data.results || response.data || [];
                setApplications(appsData);
                const testResultsData = appsData
                  .filter(app => {
                    const hasQ = app.test_questions && app.test_questions.length > 0;
                    const hasR = app.test_result && Object.keys(app.test_result).length > 0;
                    const isDone = app.test_completed_at !== null;
                    return hasQ && (hasR || isDone);
                  })
                  .map(app => ({
                    id: app.id,
                    candidate_name: app.candidate_details?.full_name || "Candidat",
                    candidate_email: app.candidate_details?.email,
                    job_title: app.job_details?.title || "Offre",
                    job_id: app.job,
                    completed_at: app.test_completed_at || app.updated_at || app.applied_at,
                    questions: app.test_questions || [],
                    result: app.test_result || {},
                    candidate_details: app.candidate_details,
                    job_details: app.job_details,
                  }));
                setTestResults(testResultsData);
                setShowTestEditor(false);
                setCurrentTestApp(null);
              }}
              RecruiterTestEditor={RecruiterTestEditor}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showApplicationModal && selectedApplication && (
            <CandidateProfileModal
              app={selectedApplication}
              onClose={() => setShowApplicationModal(false)}
              onStatusChange={handleStatusChange}
              onScheduleInterview={handleScheduleInterview}
              onAddToTalentPool={handleAddToTalentPool}
              isInTalentPool={talentsStatus[selectedApplication.candidate_details?.id] || false}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showLogoutConfirm && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 z-50 flex items-center justify-center p-4"
            >
              <div className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm" onClick={() => setShowLogoutConfirm(false)} />
              <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }}
                className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-100"
              >
                <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-800 px-6 py-8 text-center">
                  <div className="w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center">
                    <ArrowPathIcon className="w-10 h-10 text-emerald-100" />
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">Déconnexion</h3>
                  <p className="text-sm text-emerald-100/90">Voulez-vous vraiment quitter votre espace recruteur ?</p>
                </div>
                <div className="p-6">
                  <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4 mb-6">
                    <p className="text-sm text-slate-700 text-center">Votre session sera fermée et vous serez redirigé vers la page d'accueil.</p>
                  </div>
                  <div className="flex gap-3">
                    <button onClick={() => setShowLogoutConfirm(false)} className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition">
                      Annuler
                    </button>
                    <SignOutButton redirectUrl="/">
                      <button className="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-md transition">
                        Se déconnecter
                      </button>
                    </SignOutButton>
                  </div>
                </div>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </PageTransition>
    </div>
  );
}