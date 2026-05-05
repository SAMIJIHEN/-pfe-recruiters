// frontend/src/page/dashboard/components/Step3Additional.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ ÉTAPE 3 : BIO + PROFILS EN LIGNE (OPTIONNELS)
// ✅ AVEC BOUTON IA POUR GÉNÉRER LA BIO SIMPLE (SANS CV)
// ═══════════════════════════════════════════════════════════════

import { SparklesIcon } from "@heroicons/react/24/outline";

export function Step3Additional({ formData, errors, handleChange, generateSimpleBio, generatingBio }) {
  const inputClass = (hasError = false) =>
    `w-full px-4 py-3.5 border rounded-xl bg-white text-gray-800 placeholder:text-gray-400
     focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition
     ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"}`;

  return (
    <div className="space-y-8">
      {/* Bio - REQUIS AVEC BOUTON IA SIMPLE */}
      <div>
        <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
          <label className="block text-sm font-semibold text-gray-700">
            Bio / Présentation <span className="text-red-500">*</span>
          </label>
          <button
            type="button"
            onClick={generateSimpleBio}
            disabled={generatingBio}
            className="flex items-center gap-2 px-3 py-1.5 text-xs font-medium bg-gradient-to-r from-purple-600 to-indigo-600 text-white rounded-lg hover:from-purple-700 hover:to-indigo-700 transition disabled:opacity-50 shadow-sm"
          >
            {generatingBio ? (
              <>
                <div className="w-3.5 h-3.5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Génération...
              </>
            ) : (
              <>
                <SparklesIcon className="w-3.5 h-3.5" />
                Générer avec IA
              </>
            )}
          </button>
        </div>
        <textarea
          name="bio"
          value={formData.bio}
          onChange={handleChange}
          rows="6"
          maxLength={500}
          placeholder="Parlez brièvement de votre parcours, vos compétences clés et vos objectifs professionnels..."
          className={inputClass(!!errors.bio)}
        />
        {errors.bio && <p className="mt-1.5 text-sm text-red-600">{errors.bio}</p>}
        <p className="mt-2 text-xs text-gray-500 text-right">
          {formData.bio?.length || 0} / 500 caractères
        </p>
        <p className="mt-1 text-xs text-gray-400 flex items-center gap-1">
          <SparklesIcon className="w-3 h-3" />
          Astuce : renseignez d'abord votre titre et compétences (étape 2), puis cliquez sur "Générer avec IA"
        </p>
      </div>

      {/* Profils en ligne - TOUS OPTIONNELS */}
      <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Profils en ligne <span className="text-sm font-normal text-gray-500">(optionnel)</span>
        </h3>
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              LinkedIn <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
            </label>
            <input
              type="url"
              name="linkedin"
              value={formData.linkedin || ""}
              onChange={handleChange}
              placeholder="https://linkedin.com/in/votre-profil"
              className={inputClass(false)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              GitHub <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
            </label>
            <input
              type="url"
              name="github"
              value={formData.github || ""}
              onChange={handleChange}
              placeholder="https://github.com/votre-compte"
              className={inputClass(false)}
            />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Portfolio / Site web <span className="text-gray-400 text-xs font-normal">(optionnel)</span>
            </label>
            <input
              type="url"
              name="portfolio"
              value={formData.portfolio || ""}
              onChange={handleChange}
              placeholder="https://votre-portfolio.com"
              className={inputClass(false)}
            />
          </div>
        </div>
      </div>
    </div>
  );
}