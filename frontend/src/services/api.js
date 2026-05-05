// frontend/src/services/api.js
// ═══════════════════════════════════════════════════════════════
// ✅ CORRECTION: Changement de l'URL pour removeFromTalentPool
// ✅ AJOUT: Export de getJobOffers pour le recruteur
// ═══════════════════════════════════════════════════════════════

import axios from "axios";

// ✅ Correct
const API_BASE_URL = import.meta.env.VITE_API_URL || "http://127.0.0.1:8000/api";

const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true,
  timeout: 30000,
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

// ===============================
// INTERCEPTEUR REQUÊTE
// ===============================
api.interceptors.request.use(
  (config) => {
    try {
      // Récupération de l'utilisateur Clerk
      const user = window.Clerk?.user;

      if (user?.id) {
        config.headers["X-Clerk-User-Id"] = user.id;
        config.headers["X-User-Email"] = user.primaryEmailAddress?.emailAddress || "";
        config.headers["X-User-Firstname"] = user.firstName || "";
        config.headers["X-User-Lastname"] = user.lastName || "";
      }

      // IMPORTANT: Pour les uploads de fichiers, NE PAS forcer Content-Type
      if (config.data instanceof FormData) {
        delete config.headers["Content-Type"];
      }
    } catch (error) {
      console.error("Erreur lors de la configuration des headers :", error);
    }

    return config;
  },
  (error) => Promise.reject(error)
);

// ===============================
// INTERCEPTEUR RÉPONSE
// ===============================
api.interceptors.response.use(
  (response) => response,
  (error) => {
    // Affiche plus de détails sur l'erreur
    console.error("=== ERREUR API DÉTAILLÉE ===");
    console.error("URL:", error.config?.url);
    console.error("Méthode:", error.config?.method);
    console.error("Status:", error.response?.status);
    console.error("Message:", error.message);
    console.error("Données réponse:", error.response?.data);
    console.error("Headers envoyés:", error.config?.headers);
    console.error("============================");
    
    return Promise.reject(error);
  }
);

// ===============================
// NOTIFICATIONS
// ===============================

export const getNotifications = () => {
  return api.get("/notifications/");
};

export const markNotificationAsRead = (id) => {
  return api.patch(`/notifications/${id}/`, { is_read: true });
};

export const getUnreadCount = async () => {
  try {
    const response = await getNotifications();
    const data = response.data;
    const notifications = Array.isArray(data) ? data : data.results || [];
    const unread = notifications.filter(n => !n.is_read).length;
    return unread;
  } catch (error) {
    console.error("Erreur récupération compteur notifications:", error);
    return 0;
  }
};

// ===============================
// OFFRES D'EMPLOI (RECRUTEUR)
// ===============================

// ✅ AJOUT: Fonction pour récupérer les offres du recruteur connecté
export const getJobOffers = () => {
  return api.get("/job-offers/my_offers/");
};

// ===============================
// VIVIER DE TALENTS (TALENT POOL)
// ===============================

export const getTalentPool = () => {
  return api.get("/talent-pool/");
};

export const addToTalentPool = (candidateId, reason = "", score = 0) => {
  return api.post("/talent-pool/", {
    candidate_id: candidateId,
    reason: reason,
    score: score
  });
};

// ✅ CORRECTION: URL avec l'ID du talent dans le chemin
export const removeFromTalentPool = (talentId) => {
  return api.delete(`/talent-pool/${talentId}/`);
};

export const getTalentPoolCount = () => {
  return api.get("/talent-pool/count/");
};

export const inviteTalentsToApply = (jobOfferId, talentIds = [], sendEmail = true) => {
  return api.post("/talents/invite/", {
    job_offer_id: jobOfferId,
    talent_ids: talentIds,
    send_email: sendEmail
  });
};

export const getRecommendedTalentsForOffer = (jobOfferId) => {
  return api.get(`/job-offers/${jobOfferId}/recommend-talents/`);
};

export const isCandidateInTalentPool = async (candidateId) => {
  try {
    const response = await getTalentPool();
    const data = response.data;
    const talents = data.results || data || [];
    return talents.some(t => t.candidate === candidateId || t.candidate_id === candidateId);
  } catch (error) {
    console.error("Erreur vérification talent pool:", error);
    return false;
  }
};

export default api;