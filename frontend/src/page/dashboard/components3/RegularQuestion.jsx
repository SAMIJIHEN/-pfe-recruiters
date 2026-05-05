// frontend/src/page/dashboard/components/RegularQuestion.jsx
import { ClockIcon, CheckCircleIcon } from "@heroicons/react/24/outline";
import { AnimatePresence, motion } from "framer-motion";

export function RegularQuestion({ question, isOpenEnded, currentIndex, answer, openAnswer, isAnswered, onAnswer, onOpenAnswerChange, onValidateOpenAnswer, formatTime }) {
  if (!question) return null;

  return (
    <div className="p-6">
      <AnimatePresence mode="wait">
        <motion.div
          key={currentIndex}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.2 }}
        >
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-3">
              <span className="w-8 h-8 bg-indigo-100 text-indigo-700 rounded-full flex items-center justify-center font-bold text-sm">
                {currentIndex + 1}
              </span>
              <span className="text-xs text-gray-400">{isOpenEnded ? "Question ouverte" : "QCM"}</span>
              {question.estimated_time && (
                <span className="text-xs text-gray-400 flex items-center gap-1 ml-2">
                  <ClockIcon className="w-3 h-3" />
                  Temps recommandé : {formatTime(question.estimated_time)}
                </span>
              )}
            </div>
            <p className="text-gray-900 font-semibold text-lg leading-relaxed">{question.question}</p>
          </div>

          {!isOpenEnded ? (
            <div className="space-y-3">
              {question.options?.map((option, idx) => {
                const optionLetter = ["A", "B", "C", "D"][idx];
                const isSelected = answer === idx;
                const isDisabled = isAnswered;
                return (
                  <button
                    key={idx}
                    onClick={() => !isDisabled && onAnswer(idx)}
                    disabled={isDisabled}
                    className={`w-full text-left p-4 rounded-xl border-2 transition-all duration-200 ${
                      isSelected
                        ? "border-indigo-500 bg-indigo-50 shadow-sm"
                        : isDisabled
                        ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60"
                        : "border-gray-200 hover:border-indigo-300 hover:bg-gray-50"
                    }`}
                  >
                    <div className="flex items-start gap-3">
                      <span className={`flex-shrink-0 w-7 h-7 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        isSelected ? "bg-indigo-500 text-white" : "bg-gray-100 text-gray-600"
                      }`}>
                        {optionLetter}
                      </span>
                      <span className={`flex-1 text-sm ${isSelected ? "text-indigo-700 font-medium" : "text-gray-700"}`}>
                        {option}
                      </span>
                      {isSelected && <span className="flex-shrink-0 text-xs text-indigo-600 font-medium">✓ Réponse enregistrée</span>}
                    </div>
                  </button>
                );
              })}
            </div>
          ) : (
            <div className="space-y-4">
              <textarea
                value={openAnswer || ""}
                onChange={(e) => onOpenAnswerChange(e.target.value)}
                disabled={isAnswered}
                rows={6}
                placeholder="Saisissez votre réponse ici..."
                className={`w-full p-4 border-2 rounded-xl text-gray-700 focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500 transition resize-y ${
                  isAnswered ? "border-gray-200 bg-gray-50 cursor-not-allowed opacity-60" : "border-gray-200 hover:border-indigo-300"
                }`}
              />
              <div className="text-xs text-gray-400 flex justify-between">
                <span>Réponse libre</span>
                <span>{openAnswer?.length || 0} caractères</span>
              </div>
              {!isAnswered && (
                <button
                  onClick={onValidateOpenAnswer}
                  className="w-full py-3 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl font-semibold hover:opacity-90 transition shadow-md mt-2"
                >
                  Valider et continuer →
                </button>
              )}
              {isAnswered && (
                <div className="mt-4 p-3 bg-emerald-50 rounded-lg border border-emerald-200">
                  <p className="text-sm text-emerald-700 flex items-center gap-2">
                    <CheckCircleIcon className="w-4 h-4" />
                    Réponse enregistrée - Passage à la question suivante...
                  </p>
                </div>
              )}
            </div>
          )}
        </motion.div>
      </AnimatePresence>
    </div>
  );
}