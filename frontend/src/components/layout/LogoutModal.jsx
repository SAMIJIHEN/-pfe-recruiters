// frontend/src/components/layout/LogoutModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { SignOutButton } from "@clerk/clerk-react";
import { ArrowPathIcon } from "@heroicons/react/24/outline";

export function LogoutModal({ show, onClose }) {
  return (
    <AnimatePresence>
      {show && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
          <div
            className="absolute inset-0 bg-slate-900/30 backdrop-blur-sm"
            onClick={onClose}
          />

          <motion.div
            initial={{ scale: 0.95, y: 20, opacity: 0 }}
            animate={{ scale: 1, y: 0, opacity: 1 }}
            exit={{ scale: 0.95, y: 20, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="relative w-full max-w-md overflow-hidden rounded-3xl bg-white shadow-2xl border border-emerald-100"
          >
            <div className="relative bg-gradient-to-r from-slate-800 via-slate-700 to-emerald-800 px-6 py-8 text-center">
              <div className="absolute inset-0 bg-white/5" />
              <div className="relative w-20 h-20 mx-auto mb-4 rounded-full bg-white/10 border border-white/20 flex items-center justify-center backdrop-blur-sm">
                <ArrowPathIcon className="w-10 h-10 text-emerald-100" />
              </div>
              <h3 className="relative text-2xl font-bold text-white mb-2">
                Déconnexion
              </h3>
              <p className="relative text-sm text-emerald-100/90">
                Voulez-vous vraiment quitter votre espace ?
              </p>
            </div>

            <div className="p-6">
              <div className="rounded-2xl bg-emerald-50 border border-emerald-100 px-4 py-4 mb-6">
                <p className="text-sm text-slate-700 leading-relaxed text-center">
                  Votre session sera fermée et vous serez redirigé vers la page d'accueil.
                </p>
              </div>

              <div className="flex gap-3">
                <button
                  onClick={onClose}
                  className="flex-1 px-4 py-3 rounded-2xl bg-slate-100 text-slate-700 font-semibold hover:bg-slate-200 transition-all duration-200"
                >
                  Annuler
                </button>

                <SignOutButton redirectUrl="/">
                  <button className="flex-1 px-4 py-3 rounded-2xl bg-emerald-600 text-white font-semibold hover:bg-emerald-700 shadow-md hover:shadow-lg transition-all duration-200">
                    Se déconnecter
                  </button>
                </SignOutButton>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}