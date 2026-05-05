// src/components/common/BackButton.jsx (version améliorée)
import { useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { ArrowLeftIcon, HomeIcon } from "@heroicons/react/24/outline";

export default function BackButton({ fallbackPath = "/", label = "Retour", showHome = false, className = "" }) {
  const navigate = useNavigate();

  const handleBack = () => {
    if (window.history.length > 1) {
      navigate(-1);
    } else {
      navigate(fallbackPath);
    }
  };

  const handleHome = () => {
    navigate("/");
  };

  return (
    <div className="flex items-center gap-3">
      <motion.button
        initial={{ opacity: 0, x: -20 }}
        animate={{ opacity: 1, x: 0 }}
        whileHover={{ x: -5 }}
        whileTap={{ scale: 0.98 }}
        onClick={handleBack}
        className={`group flex items-center gap-2 px-5 py-2.5 rounded-xl bg-gradient-to-r from-gray-50 to-white border border-gray-200 text-gray-700 hover:text-emerald-600 hover:border-emerald-200 hover:from-emerald-50 hover:to-white transition-all duration-300 shadow-sm hover:shadow-md ${className}`}
      >
        <ArrowLeftIcon className="w-5 h-5 transition-transform group-hover:-translate-x-1 duration-300" />
        <span className="font-medium">{label}</span>
       
      </motion.button>
      
      {showHome && (
        <motion.button
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={handleHome}
          className="p-2.5 rounded-xl bg-gray-100 text-gray-600 hover:bg-emerald-100 hover:text-emerald-600 transition-all duration-300"
          title="Accueil"
        >
          <HomeIcon className="w-5 h-5" />
        </motion.button>
      )}
    </div>
  );
}