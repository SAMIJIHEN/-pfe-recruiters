// frontend/src/page/recruiter/RecruiterTestEditorConfig.jsx
import { BeakerIcon, SparklesIcon, XCircleIcon, PlusCircleIcon } from "@heroicons/react/24/outline";

export const contractTypes = [
  { value: "CDI", label: "CDI", icon: "📌", description: "Contrat à durée indéterminée" },
  { value: "CDD", label: "CDD", icon: "📅", description: "Contrat à durée déterminée" },
  { value: "Stage", label: "Stage", icon: "🎓", description: "Stage / Internship" },
  { value: "Alternance", label: "Alternance", icon: "🔄", description: "Contrat en alternance" },
  { value: "Freelance", label: "Freelance", icon: "⚡", description: "Mission freelance" },
];

export const experienceLevels = [
  { value: "0-1", label: "Moins d'un an", icon: "🌱" },
  { value: "1-3", label: "1 à 3 ans", icon: "🚀" },
  { value: "3-5", label: "3 à 5 ans", icon: "💪" },
  { value: "5-10", label: "5 à 10 ans", icon: "⭐" },
  { value: "10+", label: "Plus de 10 ans", icon: "🏆" },
];

export function TestConfigScreen({
  config,
  setConfig,
  userInstruction,
  setUserInstruction,
  generating,
  generateWithConfig,
  onClose,
}) {
  const updateConfig = (key, value) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  return (
    <div className="bg-white rounded-2xl shadow-xl border border-gray-100 p-6 md:p-8">
      <div className="text-center mb-8">
        <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-indigo-600 rounded-2xl flex items-center justify-center mx-auto mb-4 shadow-lg">
          <BeakerIcon className="w-8 h-8 text-white" />
        </div>
        <h2 className="text-2xl font-bold text-gray-900">Configuration du test technique</h2>
        <p className="text-gray-500 mt-2">Personnalisez le test avant génération par l'IA</p>
      </div>

      <div className="space-y-6">
        {/* Type de questions */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🎯 Type de questions
          </label>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              type="button"
              onClick={() => updateConfig("questionType", "qcm")}
              className={`py-3 rounded-xl border-2 transition-all ${
                config.questionType === "qcm"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              📝 QCM uniquement
            </button>
            <button
              type="button"
              onClick={() => updateConfig("questionType", "open")}
              className={`py-3 rounded-xl border-2 transition-all ${
                config.questionType === "open"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              ✏️ Questions ouvertes
            </button>
            <button
              type="button"
              onClick={() => updateConfig("questionType", "code")}
              className={`py-3 rounded-xl border-2 transition-all ${
                config.questionType === "code"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              💻 Code (complétion)
            </button>
            <button
              type="button"
              onClick={() => updateConfig("questionType", "mixed")}
              className={`py-3 rounded-xl border-2 transition-all ${
                config.questionType === "mixed"
                  ? "border-emerald-500 bg-emerald-50 text-emerald-700"
                  : "border-gray-200 bg-white text-gray-600 hover:border-gray-300"
              }`}
            >
              🔀 Mixte (QCM + ouvert + code)
            </button>
          </div>
        </div>

        {/* Configuration spécifique au code (mode code uniquement) */}
        {config.questionType === "code" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📊 Nombre de questions de code : <span className="text-emerald-600">{config.codeQuestionCount}</span>
              </label>
              <input
                type="range"
                min="1"
                max="10"
                step="1"
                value={config.codeQuestionCount}
                onChange={(e) => updateConfig("codeQuestionCount", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                💻 Langage de programmation
              </label>
              <select
                value={config.codeLanguage}
                onChange={(e) => updateConfig("codeLanguage", e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              >
                <option value="python">Python</option>
                <option value="javascript">JavaScript</option>
                <option value="sql">SQL</option>
              </select>
            </div>
          </>
        )}

        {/* Configuration pour le mode mixte : proportion QCM/ouvert + nombre de questions de code */}
        {config.questionType === "mixed" && (
          <>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📊 Proportion QCM / Questions ouvertes : {config.qcmPercentage}% QCM / {100 - config.qcmPercentage}% ouvert
              </label>
              <input
                type="range"
                min="10"
                max="90"
                step="10"
                value={config.qcmPercentage}
                onChange={(e) => updateConfig("qcmPercentage", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-2">
                📊 Nombre de questions de code : <span className="text-emerald-600">{config.codeQuestionCount}</span>
              </label>
              <input
                type="range"
                min="0"
                max="10"
                step="1"
                value={config.codeQuestionCount}
                onChange={(e) => updateConfig("codeQuestionCount", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <p className="text-xs text-gray-400 mt-1">0 = pas de question de code</p>
            </div>
          </>
        )}

        {/* Nombre total de questions pour les modes QCM ou ouvert seuls */}
        {(config.questionType === "qcm" || config.questionType === "open") && (
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              📊 Nombre de questions : <span className="text-emerald-600">{config.questionCount}</span>
            </label>
            <input
              type="range"
              min="3"
              max="20"
              step="1"
              value={config.questionCount}
              onChange={(e) => updateConfig("questionCount", parseInt(e.target.value))}
              className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
            />
          </div>
        )}

        {/* Niveau de difficulté */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-3">
            🧠 Niveau de difficulté
          </label>
          <div className="grid grid-cols-4 gap-2">
            <button
              type="button"
              onClick={() => updateConfig("difficulty", "easy")}
              className={`py-2 rounded-xl border-2 transition-all text-sm ${
                config.difficulty === "easy"
                  ? "border-green-500 bg-green-50 text-green-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              🌱 Facile
            </button>
            <button
              type="button"
              onClick={() => updateConfig("difficulty", "medium")}
              className={`py-2 rounded-xl border-2 transition-all text-sm ${
                config.difficulty === "medium"
                  ? "border-yellow-500 bg-yellow-50 text-yellow-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              📘 Moyen
            </button>
            <button
              type="button"
              onClick={() => updateConfig("difficulty", "hard")}
              className={`py-2 rounded-xl border-2 transition-all text-sm ${
                config.difficulty === "hard"
                  ? "border-red-500 bg-red-50 text-red-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              🚀 Difficile
            </button>
            <button
              type="button"
              onClick={() => updateConfig("difficulty", "mixed")}
              className={`py-2 rounded-xl border-2 transition-all text-sm ${
                config.difficulty === "mixed"
                  ? "border-purple-500 bg-purple-50 text-purple-700"
                  : "border-gray-200 bg-white text-gray-600"
              }`}
            >
              🎲 Mixte
            </button>
          </div>
        </div>

        {/* Temps par question */}
        <div>
          <label className="flex items-center gap-3 mb-3">
            <input
              type="checkbox"
              checked={config.customTimePerQuestion}
              onChange={(e) => updateConfig("customTimePerQuestion", e.target.checked)}
              className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
            />
            <span className="text-sm font-semibold text-gray-700">⏱️ Personnaliser le temps par question (valeur par défaut, l'IA pourra ajuster individuellement)</span>
          </label>
          {config.customTimePerQuestion && (
            <div>
              <input
                type="range"
                min="20"
                max="600"
                step="10"
                value={config.timePerQuestion}
                onChange={(e) => updateConfig("timePerQuestion", parseInt(e.target.value))}
                className="w-full h-2 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-emerald-600"
              />
              <div className="flex justify-between text-xs text-gray-400 mt-1">
                <span>20 sec</span>
                <span>{config.timePerQuestion} secondes</span>
                <span>600 sec (10 min)</span>
              </div>
            </div>
          )}
          <p className="text-xs text-gray-400 mt-2">
            💡 L'IA générera un temps estimé pour chaque question en fonction de sa difficulté. Vous pourrez modifier ces temps manuellement après génération.
          </p>
        </div>

        {/* Thèmes spécifiques */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            🎯 Thèmes spécifiques (optionnel)
          </label>
          <textarea
            value={config.customThemes}
            onChange={(e) => updateConfig("customThemes", e.target.value)}
            placeholder="Ex: React, Python, Gestion de projet, Communication, Leadership..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>

        {/* Instruction personnalisée */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            💬 Instruction personnalisée pour l'IA (optionnel)
          </label>
          <textarea
            value={userInstruction}
            onChange={(e) => setUserInstruction(e.target.value)}
            placeholder="Ex: Insiste sur les soft skills, ajoute des mises en situation concrètes..."
            rows={2}
            className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          />
        </div>
      </div>

      {/* Boutons */}
      <div className="flex gap-4 mt-8">
        <button
          type="button"
          onClick={onClose}
          className="flex-1 px-6 py-3 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition font-medium"
        >
          Annuler
        </button>
        <button
          type="button"
          onClick={generateWithConfig}
          disabled={generating}
          className="flex-1 px-6 py-3 bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-xl hover:from-purple-700 hover:to-indigo-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50"
        >
          {generating ? (
            <>
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              Génération en cours...
            </>
          ) : (
            <>
              <SparklesIcon className="w-5 h-5" />
              Générer le test
            </>
          )}
        </button>
      </div>
    </div>
  );
}