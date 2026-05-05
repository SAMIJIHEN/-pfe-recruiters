// frontend/src/page/recruiter/components/DeleteConfirmModal.jsx
import { motion } from "framer-motion";
import { TrashIcon } from "@heroicons/react/24/outline";

export function DeleteConfirmModal({ show, onClose, onConfirm, offerTitle }) {
  if (!show) return null;
  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <motion.div initial={{ scale: 0.95, y: 20, opacity: 0 }} animate={{ scale: 1, y: 0, opacity: 1 }} exit={{ scale: 0.95, y: 20, opacity: 0 }} transition={{ duration: 0.2 }} className="relative w-full max-w-md bg-white rounded-2xl shadow-2xl overflow-hidden">
        <div className="bg-gradient-to-r from-red-500 to-red-600 px-6 py-8 text-center">
          <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4"><TrashIcon className="w-8 h-8 text-white" /></div>
          <h3 className="text-xl font-bold text-white mb-2">Supprimer l'offre</h3>
          <p className="text-red-100 text-sm">Cette action est irréversible</p>
        </div>
        <div className="p-6 text-center">
          <p className="text-gray-600 mb-6">Êtes-vous sûr de vouloir supprimer l'offre <strong className="text-gray-900">"{offerTitle}"</strong> ?</p>
          <div className="flex gap-3">
            <button onClick={onConfirm} className="flex-1 px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 font-semibold">Oui, supprimer</button>
            <button onClick={onClose} className="flex-1 px-4 py-3 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 font-semibold">Annuler</button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}