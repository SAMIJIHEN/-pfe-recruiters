// frontend/src/services/adminApi.js
// ═══════════════════════════════════════════════════════════════
// ✅ API CLIENT POUR L'ADMINISTRATEUR (AVEC TOKEN)
// ═══════════════════════════════════════════════════════════════

import axios from "axios";

const API_BASE_URL = "http://127.0.0.1:8000/api/admin";

let authToken = localStorage.getItem("admin_token");

const adminApi = axios.create({
  baseURL: API_BASE_URL,
  timeout: 30000,
  headers: {
    "Content-Type": "application/json",
  },
});

// Intercepteur pour ajouter le token à chaque requête
adminApi.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem("admin_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ============================================================
// AUTHENTIFICATION
// ============================================================

export const adminLogin = async (email, password) => {
  const response = await adminApi.post("/login/", { email, password });
  if (response.data.success && response.data.token) {
    // Stocker le token
    localStorage.setItem("admin_token", response.data.token);
    authToken = response.data.token;
  }
  return response;
};

export const adminLogout = async () => {
  try {
    await adminApi.post("/logout/");
  } finally {
    localStorage.removeItem("admin_token");
    authToken = null;
  }
};

export const adminCheckAuth = async () => {
  try {
    const response = await adminApi.get("/check-auth/");
    return response;
  } catch (error) {
    if (error.response?.status === 401) {
      localStorage.removeItem("admin_token");
    }
    throw error;
  }
};

// ============================================================
// GESTION DES RECRUTEURS
// ============================================================

export const getAllRecruiters = () => adminApi.get("/recruiters/all/");
export const getPendingRecruiters = () => adminApi.get("/recruiters/pending/");
export const getApprovedRecruiters = () => adminApi.get("/recruiters/approved/");
export const getRejectedRecruiters = () => adminApi.get("/recruiters/rejected/");
export const approveRecruiter = (recruiterId, forceEmail = false) => 
  adminApi.post(`/recruiters/${recruiterId}/approve/`, { force_email: forceEmail });
export const rejectRecruiter = (recruiterId, reason = "") => 
  adminApi.post(`/recruiters/${recruiterId}/reject/`, { reason });

export default adminApi;