// frontend/src/page/dashboard/components/TestHeader.jsx
import { motion } from "framer-motion";
import { ClipboardDocumentCheckIcon, ExclamationTriangleIcon } from "@heroicons/react/24/outline";

export function TestHeader({ app, timeLeft, showWarning, currentQuestion, totalQuestions, answeredCount, progress, formatTime, getTimerColor, timeProgress }) {
  return (
    <div className="bg-gradient-to-r from-indigo-600 to-violet-600 px-6 py-5 shrink-0">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 bg-white/20 rounded-xl flex items-center justify-center">
            <ClipboardDocumentCheckIcon className="w-5 h-5 text-white" />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl">Évaluation technique</h2>
            <p className="text-indigo-200 text-sm">{app.job_details?.title || "Test de compétences"}</p>
          </div>
        </div>
        <div className={`text-center bg-white/20 rounded-xl px-4 py-2 ${timeLeft <= 5 ? "animate-pulse" : ""}`}>
          <p className="text-white font-mono font-bold text-2xl">{formatTime(timeLeft)}</p>
          <p className="text-indigo-200 text-xs">Temps restant</p>
        </div>
      </div>

      <div className="h-2 bg-white/20 rounded-full overflow-hidden mb-3">
        <div className={`h-full rounded-full transition-all duration-1000 ${getTimerColor()}`} style={{ width: `${timeProgress}%` }} />
      </div>

      {showWarning && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex items-center gap-2 bg-red-500/30 rounded-lg px-3 py-1.5 mb-3"
        >
          <ExclamationTriangleIcon className="w-4 h-4 text-white" />
          <span className="text-white text-xs">Plus que {formatTime(timeLeft)} pour répondre !</span>
        </motion.div>
      )}

      <div className="flex justify-between items-center">
        <div className="flex items-center gap-2">
          <span className="text-indigo-200 text-sm">
            Question {Math.min(currentQuestion + 1, totalQuestions)}/{totalQuestions}
          </span>
          <span className="text-indigo-200 text-sm">•</span>
          <span className="text-indigo-200 text-sm">{answeredCount} répondue(s)</span>
        </div>
        <div className="w-32 h-1.5 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-white rounded-full transition-all" style={{ width: `${progress}%` }} />
        </div>
      </div>
    </div>
  );
}