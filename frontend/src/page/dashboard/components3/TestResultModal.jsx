// frontend/src/page/dashboard/components/TestResultModal.jsx
import { motion } from "framer-motion";

export function TestResultModal({ onClose }) {
  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 999999,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        background: "rgba(0,0,0,0.8)",
        backdropFilter: "blur(8px)",
      }}
    >
      <motion.div
        initial={{ scale: 0.9, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        className="bg-white rounded-2xl max-w-md w-full mx-4 p-8 text-center shadow-2xl"
      >
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", damping: 15 }}
          className="text-6xl mb-4"
        >
          ✅
        </motion.div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">Test complété !</h3>
        <p className="text-gray-500 mb-6">
          Votre test a été envoyé avec succès. Le recruteur examinera vos réponses.
        </p>
        <button
          onClick={onClose}
          className="w-full py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:opacity-90 transition shadow-md"
        >
          Fermer
        </button>
      </motion.div>
    </div>
  );
}