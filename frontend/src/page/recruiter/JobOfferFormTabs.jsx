// src/page/recruiter/JobOfferFormTabs.jsx
import { motion } from "framer-motion";
import {
  BriefcaseIcon,
  MapPinIcon,
  EyeIcon,
  SparklesIcon,
  PlusCircleIcon,
  XCircleIcon,
  LightBulbIcon,
  DocumentTextIcon,
  TagIcon,
} from "@heroicons/react/24/outline";

// ==================== CONSTANTES ====================
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

// ==================== FONCTION FORMATAGE DESCRIPTION ====================
export function formatDescriptionToHtml(text) {
  if (!text) return "";

  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/^###\s*##\s*/gm, "## ");
  html = html.replace(/^##\s*##\s*/gm, "## ");

  const sections = [
    { name: "Présentation du poste", icon: "🎯", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-800", hoverBorder: "hover:border-emerald-300" },
    { name: "Missions principales", icon: "📋", bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-800", hoverBorder: "hover:border-blue-300" },
    { name: "Profil recherché", icon: "👤", bgColor: "bg-purple-50", borderColor: "border-purple-200", textColor: "text-purple-800", hoverBorder: "hover:border-purple-300" },
    { name: "Avantages", icon: "⭐", bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-800", hoverBorder: "hover:border-amber-300" },
  ];

  let result = "";
  let remaining = html;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const regex = new RegExp(`## ${section.name}\\s*([\\s\\S]*?)(?=## |$)`, "i");
    const match = remaining.match(regex);
    if (match) {
      let content = match[1].trim();
      content = content.replace(/^[-*] (.*)$/gm, (match, item) => {
        return `<li class="flex items-start gap-2 mb-2">
                  <svg class="w-5 h-5 ${section.textColor} shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-gray-700">${item}</span>
                </li>`;
      });
      content = content.replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-1">$&</ul>');
      content = content.replace(/\n{2,}/g, '</p><p class="mb-3">');
      content = '<p class="mb-3">' + content + '</p>';
      content = content.replace(/<p>\s*<\/p>/g, '');

      result += `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border ${section.borderColor} ${section.hoverBorder} transition-all duration-200 mb-6">
          <div class="${section.bgColor} px-5 py-3 flex items-center gap-2 border-b ${section.borderColor}">
            <span class="text-xl">${section.icon}</span>
            <h3 class="text-lg font-semibold ${section.textColor}">${section.name}</h3>
          </div>
          <div class="p-5 text-gray-700">
            ${content}
          </div>
        </div>
      `;
      remaining = remaining.replace(regex, "");
    }
  }

  if (remaining.trim()) {
    result += `<div class="bg-gray-50 rounded-xl p-5 border border-gray-200">${remaining}</div>`;
  }

  return result;
}

// ==================== INPUT CLASS ====================
const inputClass = (hasError = false) =>
  `w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
    hasError ? "border-red-500 bg-red-50" : "border-gray-200"
  }`;

// ==================== TAB BASIC ====================
export function BasicTab({
  formData,
  handleChange,
  generateWithAI,
  generating,
  aiGenerated,
  wordCount,
  contractTypes,
  experienceLevels,
}) {
  return (
    <motion.div
      key="basic"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
    >
      <div className="space-y-6">
        {/* Titre + bouton IA */}
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">
            Titre du poste <span className="text-red-500">*</span>
          </label>
          <div className="flex gap-3">
            <input
              type="text"
              name="title"
              value={formData.title}
              onChange={handleChange}
              required
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
              placeholder="Ex: Développeur Full Stack Senior"
            />
            <button
              type="button"
              onClick={generateWithAI}
              disabled={generating || !formData.title.trim()}
              className={`flex items-center gap-2 px-4 py-3 rounded-xl font-semibold text-sm transition-all shrink-0 ${
                generating || !formData.title.trim()
                  ? "bg-gray-100 text-gray-400 cursor-not-allowed"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 text-white hover:from-violet-700 hover:to-purple-700 shadow-md"
              }`}
            >
              {generating ? (
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <SparklesIcon className="w-4 h-4" />
              )}
              <span className="hidden sm:inline">
                {generating ? "Génération..." : "Générer avec IA"}
              </span>
            </button>
          </div>
          <p className="mt-1 text-xs text-gray-500">
            Saisissez le titre puis cliquez sur <strong>"Générer avec IA"</strong> pour remplir automatiquement la description et les compétences
          </p>
        </div>

        {/* Description */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Description du poste <span className="text-red-500">*</span>
            </label>
            {aiGenerated && (
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" /> Généré par IA
              </span>
            )}
          </div>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleChange}
            required
            rows={10}
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
              aiGenerated && formData.description
                ? "border-purple-200 bg-purple-50/30"
                : "border-gray-200"
            }`}
            placeholder="Décrivez les missions, le profil recherché, les avantages... ou utilisez l'IA pour générer automatiquement"
          />
          <div className="flex justify-between mt-1 text-xs">
            <span className={formData.description.length < 50 ? "text-red-500" : "text-emerald-600"}>
              {formData.description.length}/50 caractères minimum
            </span>
            <span className="text-gray-500">{wordCount} caractères</span>
          </div>

          {/* Aperçu stylisé */}
          {formData.description.length > 50 && (
            <div className="mt-6 p-5 bg-gradient-to-br from-white to-gray-50 rounded-2xl border border-gray-200 shadow-sm">
              <div className="flex items-center gap-2 text-sm font-semibold text-gray-500 mb-4 border-b border-gray-100 pb-2">
                <EyeIcon className="w-4 h-4" /> Aperçu professionnel
              </div>
              <div
                className="prose max-w-none"
                dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(formData.description) }}
              />
            </div>
          )}
        </div>

        {/* Type contrat + Localisation */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">
                Type de contrat <span className="text-red-500">*</span>
              </label>
              {aiGenerated && <span className="text-xs text-purple-500">✨ IA</span>}
            </div>
            <select
              name="contract_type"
              value={formData.contract_type}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
            >
              {contractTypes.map(t => <option key={t.value} value={t.value}>{t.icon} {t.label}</option>)}
            </select>
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">
              Localisation <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleChange}
              required
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 transition"
              placeholder="Ex: Tunis, Sfax, Remote..."
            />
          </div>
        </div>

        {/* Expérience + Télétravail */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-semibold text-gray-700">Niveau d'expérience</label>
              {aiGenerated && <span className="text-xs text-purple-500">✨ IA</span>}
            </div>
            <select
              name="experience_level"
              value={formData.experience_level}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
            >
              {experienceLevels.map(l => <option key={l.value} value={l.value}>{l.icon} {l.label}</option>)}
            </select>
          </div>

          <div className="flex items-center">
            <label className="flex items-center gap-3 cursor-pointer group">
              <div className="relative">
                <input
                  type="checkbox"
                  name="remote_possible"
                  checked={formData.remote_possible}
                  onChange={handleChange}
                  className="sr-only"
                />
                <div className={`w-12 h-6 rounded-full transition-colors duration-200 ${formData.remote_possible ? "bg-emerald-600" : "bg-gray-300"}`}>
                  <div className={`absolute top-0.5 w-5 h-5 bg-white rounded-full shadow transform transition-transform duration-200 ${formData.remote_possible ? "translate-x-6" : "translate-x-1"}`} />
                </div>
              </div>
              <span className="text-sm font-medium text-gray-700 group-hover:text-emerald-600 transition">Télétravail possible</span>
            </label>
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== TAB SKILLS ====================
export function SkillsTab({
  formData,
  newSkill,
  setNewSkill,
  addSkill,
  removeSkill,
  aiGenerated,
}) {
  return (
    <motion.div
      key="skills"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
    >
      <div className="space-y-8">
        {/* Compétences requises */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">
              Compétences requises <span className="text-red-500">*</span>
            </label>
            {aiGenerated && formData.skills_required.length > 0 && (
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" /> Générées par IA
              </span>
            )}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill.required}
              onChange={e => setNewSkill(prev => ({ ...prev, required: e.target.value }))}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: React, Python, Gestion de projet..."
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill("required"); } }}
            />
            <button
              type="button"
              onClick={() => addSkill("required")}
              className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium flex items-center gap-2"
            >
              <PlusCircleIcon className="w-5 h-5" />Ajouter
            </button>
          </div>
          <div className={`flex flex-wrap gap-2 min-h-[60px] p-3 rounded-xl ${aiGenerated && formData.skills_required.length > 0 ? "bg-purple-50 border border-purple-100" : "bg-gray-50"}`}>
            {formData.skills_required.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">
                {skill}
                <button type="button" onClick={() => removeSkill("required", skill)} className="text-emerald-700 hover:text-red-600 transition">
                  <XCircleIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
            {formData.skills_required.length === 0 && (
              <p className="text-sm text-gray-400 italic">Aucune compétence ajoutée</p>
            )}
          </div>
        </div>

        {/* Compétences préférées */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-semibold text-gray-700">Compétences préférées (optionnel)</label>
            {aiGenerated && formData.skills_preferred.length > 0 && (
              <span className="text-xs bg-purple-100 text-purple-600 px-2 py-0.5 rounded-full flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" /> Générées par IA
              </span>
            )}
          </div>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={newSkill.preferred}
              onChange={e => setNewSkill(prev => ({ ...prev, preferred: e.target.value }))}
              className="flex-1 px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
              placeholder="Ex: TypeScript, AWS, Méthodes agiles..."
              onKeyDown={e => { if (e.key === "Enter") { e.preventDefault(); addSkill("preferred"); } }}
            />
            <button
              type="button"
              onClick={() => addSkill("preferred")}
              className="px-6 py-3 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition font-medium flex items-center gap-2"
            >
              <PlusCircleIcon className="w-5 h-5" />Ajouter
            </button>
          </div>
          <div className={`flex flex-wrap gap-2 min-h-[60px] p-3 rounded-xl ${aiGenerated && formData.skills_preferred.length > 0 ? "bg-purple-50 border border-purple-100" : "bg-gray-50"}`}>
            {formData.skills_preferred.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1 px-3 py-1 bg-purple-100 text-purple-700 rounded-full text-sm">
                {skill}
                <button type="button" onClick={() => removeSkill("preferred", skill)} className="text-purple-700 hover:text-red-600 transition">
                  <XCircleIcon className="w-4 h-4" />
                </button>
              </span>
            ))}
            {formData.skills_preferred.length === 0 && (
              <p className="text-sm text-gray-400 italic">Aucune compétence préférée ajoutée</p>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}

// ==================== TAB DETAILS ====================
export function DetailsTab({ formData, handleChange, aiGenerated }) {
  return (
    <motion.div
      key="details"
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      exit={{ opacity: 0, x: -20 }}
      className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8"
    >
      <div className="space-y-6">
        <div>
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Rémunération</h3>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salaire minimum (TND)</label>
              <input
                type="number"
                name="salary_min"
                value={formData.salary_min}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                placeholder="2000"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Salaire maximum (TND)</label>
              <input
                type="number"
                name="salary_max"
                value={formData.salary_max}
                onChange={handleChange}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
                placeholder="4000"
              />
            </div>
            <div className="flex items-center">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="salary_visible"
                  checked={formData.salary_visible}
                  onChange={handleChange}
                  className="w-4 h-4 text-emerald-600 rounded focus:ring-emerald-500"
                />
                <span className="text-sm text-gray-700">Afficher le salaire</span>
              </label>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">Date limite de candidature</label>
            <input
              type="date"
              name="application_deadline"
              value={formData.application_deadline}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="block text-sm font-medium text-gray-700">Niveau d'études requis</label>
              {aiGenerated && <span className="text-xs text-purple-500">✨ IA</span>}
            </div>
            <select
              name="education_level"
              value={formData.education_level}
              onChange={handleChange}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
            >
              <option value="">Non spécifié</option>
              <option value="bac">Baccalauréat</option>
              <option value="bac+2">Bac+2 (BTS, DUT)</option>
              <option value="bac+3">Bac+3 (Licence)</option>
              <option value="bac+5">Bac+5 (Master, Ingénieur)</option>
              <option value="bac+8">Bac+8 (Doctorat)</option>
            </select>
          </div>
        </div>

        <div className="bg-gradient-to-r from-emerald-50 to-teal-50 rounded-xl p-6">
          <div className="flex items-start gap-3">
            <LightBulbIcon className="w-6 h-6 text-emerald-600 shrink-0" />
            <div>
              <h4 className="font-semibold text-gray-900 mb-2">Conseils pour une offre attractive</h4>
              <ul className="text-sm text-gray-600 space-y-1">
                <li>• Un titre clair et précis augmente les candidatures de 30%</li>
                <li>• Décrivez les missions et le profil recherché en détail</li>
                <li>• Mentionnez les avantages (télétravail, horaires flexibles…)</li>
                <li>• Un salaire attractif attire plus de candidats qualifiés</li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </motion.div>
  );
}