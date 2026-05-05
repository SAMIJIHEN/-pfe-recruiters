// frontend/src/page/admin/AdminLogin.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ PAGE DE CONNEXION ADMINISTRATEUR
// ✅ AVEC LOGO GRANDISSANT
// ═══════════════════════════════════════════════════════════════

import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { adminLogin } from "../../services/adminApi";
import NavbarPro from "../../components/layout/NavbarPro";
import logoSite from "../../components/layout/AJ.png";

export default function AdminLogin() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await adminLogin(email, password);
      if (response.data.success) {
        navigate("/admin-dashboard");
      }
    } catch (err) {
      console.error("Erreur connexion:", err);
      setError(
        err.response?.data?.error || 
        "Email ou mot de passe incorrect"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <NavbarPro />
      <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 flex items-center justify-center p-4 pt-24">
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl" />
        </div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="relative w-full max-w-md"
        >
          <div className="bg-white/10 backdrop-blur-xl rounded-3xl shadow-2xl border border-white/20 p-8">
            <div className="text-center mb-8">
              {/* Logo du site - GRAND VERSION */}
              <div className="relative inline-block group">
                <div className="absolute -inset-2 bg-gradient-to-r from-emerald-400 to-emerald-600 rounded-2xl blur opacity-30 group-hover:opacity-70 transition duration-500" />
                <div className="relative w-32 h-32 bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl flex items-center justify-center mx-auto mb-5 shadow-2xl border border-emerald-500/30 overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-tr from-emerald-500/20 to-transparent" />
                  <img 
                    src={logoSite} 
                    alt="AJ Recruiters" 
                    className="w-24 h-24 object-contain relative z-10"
                  />
                </div>
              </div>
              
              <h1 className="text-2xl font-bold text-white mb-2 tracking-tight">
                Administration
              </h1>
              <div className="w-12 h-0.5 bg-gradient-to-r from-emerald-400 to-emerald-600 mx-auto mb-3 rounded-full" />
              <p className="text-emerald-100 text-sm">
                Connectez-vous pour gérer les comptes recruteurs
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Email
                </label>
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="admin@aminejihen.com"
                  required
                  autoFocus
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-white mb-2">
                  Mot de passe
                </label>
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full px-4 py-3 bg-white/10 border border-white/20 rounded-xl text-white placeholder-white/50 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent transition-all duration-200"
                  placeholder="••••••••"
                  required
                />
              </div>

              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  className="p-3 bg-red-500/20 border border-red-500/30 rounded-xl"
                >
                  <p className="text-red-200 text-sm text-center flex items-center justify-center gap-2">
                    <span>⚠️</span> {error}
                  </p>
                </motion.div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-3 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white font-semibold rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 shadow-lg hover:shadow-xl disabled:opacity-50 flex items-center justify-center gap-2 group"
              >
                {loading ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    Connexion...
                  </>
                ) : (
                  <>
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                    </svg>
                    Se connecter
                  </>
                )}
              </button>
            </form>

            <div className="mt-6 text-center">
              <a 
                href="/" 
                className="text-emerald-300/70 text-xs hover:text-emerald-200 transition-colors duration-200 inline-flex items-center gap-1"
              >
                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 19l-7-7m0 0l7-7m-7 7h18" />
                </svg>
                Retour à l'accueil
              </a>
            </div>
          </div>
        </motion.div>
      </div>
    </>
  );
}