// frontend/src/page/dashboard/hooks/useDashboardData.js
import { useState, useEffect, useCallback } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";

export function useDashboardData() {
  const { user, isLoaded, isSignedIn } = useUser();
  const navigate = useNavigate();

  const [profile, setProfile] = useState(null);
  const [jobOffers, setJobOffers] = useState([]);
  const [filteredJobs, setFilteredJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [recommendedJobs, setRecommendedJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [searchFilters, setSearchFilters] = useState({
    keyword: "",
    location: "",
    contractType: "",
  });

  // Chargement des candidatures
  const loadApplications = useCallback(async () => {
    try {
      const res = await api.get("/applications/my-applications/");
      const apps = res.data.results || res.data || [];
      setApplications(apps);
    } catch (error) {
      console.error("Erreur chargement candidatures:", error);
      setApplications([]);
    }
  }, []);

  // Calcul local des recommandations (fallback)
  const calculateLocalRecommendations = (prof, jobs) => {
    if (!prof || !jobs.length) return [];
    const profileSkills = (prof.skills || []).map((s) => s.toLowerCase());
    return jobs
      .map((job) => {
        const jobSkills = (job.skills_required || []).map((s) => s.toLowerCase());
        if (jobSkills.length === 0) return { ...job, match_score: 0, matched_skills: [], total_skills: 0 };
        const matchedList = profileSkills.filter((s) => jobSkills.includes(s));
        const matched = matchedList.length;
        const score = Math.round((matched / jobSkills.length) * 100);
        return {
          ...job,
          match_score: score,
          matched_skills: matchedList,
          total_skills: jobSkills.length,
          isNew: new Date() - new Date(job.created_at) < 7 * 24 * 60 * 60 * 1000,
        };
      })
      .filter((j) => j.match_score > 20)
      .sort((a, b) => b.match_score - a.match_score);
  };

  // Chargement des recommandations (API ou fallback)
  const loadRecommendations = useCallback(async () => {
    if (!profile) return;
    setLoadingRecommendations(true);
    try {
      const response = await api.post("/job-offers/recommend-for-candidate/", {});
      setRecommendedJobs(response.data.recommendations || []);
    } catch (error) {
      console.error("Erreur chargement recommandations:", error);
      setRecommendedJobs(calculateLocalRecommendations(profile, jobOffers));
    } finally {
      setLoadingRecommendations(false);
    }
  }, [profile, jobOffers]);

  // Chargement initial
  useEffect(() => {
    if (!isLoaded) return;
    const loadData = async () => {
      try {
        setLoading(true);
        if (!isSignedIn || !user) {
          navigate("/login", { replace: true });
          return;
        }
        try {
          const profileRes = await api.get("/profile/");
          setProfile(profileRes.data);
        } catch (err) {
          if (err.response?.status === 404) {
            navigate("/complete-profile", { replace: true });
            return;
          }
        }
        const jobsRes = await api.get("/job-offers/");
        const allJobs = jobsRes.data.results || jobsRes.data || [];
        setJobOffers(allJobs);
        setFilteredJobs(allJobs);
        await loadApplications();
      } catch (error) {
        console.error("Erreur:", error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [isLoaded, isSignedIn, user, navigate, loadApplications]);

  // Recharger recommandations quand profil et offres sont prêts
  useEffect(() => {
    if (profile && jobOffers.length > 0 && !loading) {
      loadRecommendations();
    }
  }, [profile, jobOffers, loading, loadRecommendations]);

  // Filtrage des offres
  useEffect(() => {
    let filtered = [...jobOffers];
    if (searchFilters.keyword) {
      const kw = searchFilters.keyword.toLowerCase();
      filtered = filtered.filter(
        (j) => j.title?.toLowerCase().includes(kw) || j.description?.toLowerCase().includes(kw)
      );
    }
    if (searchFilters.location) {
      const loc = searchFilters.location.toLowerCase();
      filtered = filtered.filter((j) => j.location?.toLowerCase().includes(loc));
    }
    if (searchFilters.contractType) {
      filtered = filtered.filter((j) => j.contract_type === searchFilters.contractType);
    }
    setFilteredJobs(filtered);
  }, [searchFilters, jobOffers]);

  const handleApply = async (jobId) => {
    try {
      await api.post("/applications/", { job: jobId, cover_letter: "" });
      setMessage({ text: "✅ Candidature envoyée avec succès !", type: "success" });
      await loadApplications();
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    } catch (error) {
      setMessage({ text: "❌ Erreur lors de l'envoi", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
    }
  };

  const hasApplied = (jobId) =>
    applications.some((a) => a.job === jobId || a.job_details?.id === jobId);

  const getPhotoUrl = () => {
  if (!profile?.photo) return null;
  const base = import.meta.env.VITE_API_URL?.replace("/api", "") || "http://127.0.0.1:8080";
  return `${base}/media/photos/${profile.photo.split('/').pop()}`;
};
  const calculateCompletion = () => {
    if (!profile) return 0;
    const fields = [
      profile.phone,
      profile.location,
      profile.title,
      profile.experience,
      profile.education,
      profile.bio,
      profile.skills?.length > 0,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const completion = calculateCompletion();
  const savedJobs = JSON.parse(localStorage.getItem("savedJobs") || "[]");
  const savedOffers = jobOffers.filter((j) => savedJobs.includes(j.id));

  return {
    user,
    profile,
    jobOffers,
    filteredJobs,
    applications,
    recommendedJobs,
    loading,
    loadingRecommendations,
    message,
    searchFilters,
    setSearchFilters,
    handleApply,
    hasApplied,
    getPhotoUrl,
    completion,
    savedOffers,
    loadApplications,
    setMessage,
  };
}