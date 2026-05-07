// src/page/recruiter/JobOfferForm.jsx
import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate, useParams } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import NavbarPro from "../../components/layout/NavbarPro";
import PageTransition from "../../components/common/PageTransition";
import api from "../../services/api";
import {
  BriefcaseIcon,
  CheckCircleIcon,
  XCircleIcon,
  PlusCircleIcon,
  DocumentTextIcon,
  BuildingOfficeIcon,
  TagIcon,
  LightBulbIcon,
  ArrowLeftIcon,
  EyeIcon,
  RocketLaunchIcon,
  PencilSquareIcon,
  SparklesIcon,
  StarIcon,
  EnvelopeIcon,
  PhoneIcon,
  AcademicCapIcon,
  ClockIcon,
} from "@heroicons/react/24/outline";

import {
  BasicTab,
  SkillsTab,
  DetailsTab,
  formatDescriptionToHtml,
  contractTypes,
  experienceLevels,
} from "./JobOfferFormTabs";

// ─────────────────────────────────────────────
// Clé API Groq — .env frontend
// ─────────────────────────────────────────────
const GROK_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

const initialFormData = {
  title: "",
  description: "",
  contract_type: "CDI",
  experience_level: "1-3",
  education_level: "",
  location: "",
  remote_possible: false,
  skills_required: [],
  skills_preferred: [],
  salary_min: "",
  salary_max: "",
  salary_visible: true,
  application_deadline: "",
  status: "draft",
};

export default function JobOfferForm() {
  const { user } = useUser();
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditing = !!id;

  const [formData, setFormData] = useState(initialFormData);
  const [newSkill, setNewSkill] = useState({ required: "", preferred: "" });
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [activeTab, setActiveTab] = useState("basic");
  const [previewMode, setPreviewMode] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [aiGenerated, setAiGenerated] = useState(false);
  const [recommendations, setRecommendations] = useState([]);
  const [loadingRecommendations, setLoadingRecommendations] = useState(false);
  const [showRecommendations, setShowRecommendations] = useState(false);
  const [invitingTalentId, setInvitingTalentId] = useState(null);

  const calculateCompletion = () => {
    const fields = [
      !!formData.title,
      formData.description.trim().length >= 50,
      !!formData.location,
      formData.skills_required.length > 0,
      !!formData.salary_min && !!formData.salary_max,
    ];
    return Math.round((fields.filter(Boolean).length / fields.length) * 100);
  };

  const stats = [
    { label: "Taux de complétion", value: calculateCompletion(), suffix: "%", icon: CheckCircleIcon },
    { label: "Caractères", value: wordCount, suffix: "", icon: DocumentTextIcon },
    { label: "Compétences", value: formData.skills_required.length, suffix: "", icon: TagIcon },
  ];

  useEffect(() => { if (isEditing) loadOffer(); }, [id]);
  useEffect(() => { setWordCount(formData.description.length); }, [formData.description]);

  useEffect(() => {
    const timer = setTimeout(() => {
      if ((formData.title && formData.title.length > 5) || (formData.skills_required && formData.skills_required.length > 0)) {
        loadRecommendations();
      }
    }, 800);
    return () => clearTimeout(timer);
  }, [formData.title, formData.skills_required]);

  const loadOffer = async () => {
    try {
      setLoading(true);
      const response = await api.get(`/job-offers/${id}/`);
      const data = response.data || {};
      setFormData({
        ...initialFormData,
        ...data,
        skills_required: Array.isArray(data.skills_required) ? data.skills_required : [],
        skills_preferred: Array.isArray(data.skills_preferred) ? data.skills_preferred : [],
        salary_min: data.salary_min ?? "",
        salary_max: data.salary_max ?? "",
        application_deadline: data.application_deadline ? String(data.application_deadline).split("T")[0] : "",
      });
    } catch {
      setError("Impossible de charger l'offre.");
    } finally {
      setLoading(false);
    }
  };

  const loadRecommendations = async () => {
    if (!formData.title && formData.skills_required.length === 0) return;
    setLoadingRecommendations(true);
    try {
      const response = await api.post("/talent-pool/recommend-for-offer/", {
        title: formData.title,
        skills_required: formData.skills_required
      });
      const recs = response.data.recommendations || [];
      setRecommendations(recs);
      setShowRecommendations(recs.length > 0);
    } catch (error) {
      console.error("Erreur chargement recommandations:", error);
      setRecommendations([]);
    } finally {
      setLoadingRecommendations(false);
    }
  };

  const handleInviteRecommendedTalent = async (talent) => {
    setInvitingTalentId(talent.talent_id);
    try {
      await api.post("/talents/invite/", {
        job_offer_id: isEditing ? id : null,
        talent_ids: [talent.talent_id],
        send_email: true
      });
      setSuccess(`✅ Invitation envoyée à ${talent.candidate_name}`);
      setTimeout(() => setSuccess(""), 3000);
    } catch (error) {
      console.error("Erreur invitation:", error);
      setError("❌ Erreur lors de l'invitation");
      setTimeout(() => setError(""), 3000);
    } finally {
      setInvitingTalentId(null);
    }
  };

  const generateWithAI = async () => {
    if (!formData.title.trim()) {
      setError("Veuillez d'abord saisir le titre du poste avant de générer.");
      return;
    }

    if (!GROK_API_KEY) {
      setError("Clé API Groq manquante. Ajoutez VITE_GROQ_API_KEY dans votre fichier .env frontend");
      return;
    }

    setGenerating(true);
    setError("");

    const prompt = `Tu es un expert RH. Génère une offre d'emploi professionnelle en français pour le poste : "${formData.title}".

IMPORTANT : utilise UNIQUEMENT la syntaxe suivante :
- Titres de section : commencent par "## " (deux dièses et un espace). Exemple : "## Présentation du poste"
- Listes à puces : chaque élément commence par "- " (tiret et espace)
- Paragraphes : texte normal sans caractères spéciaux.

Ne JAMAIS utiliser "###" ni "####". Ne mets aucun texte avant ou après le JSON.

Réponds UNIQUEMENT avec un JSON valide (sans markdown, sans backticks) dans ce format exact :
{
  "description": "## Présentation du poste\\nTexte de présentation...\\n\\n## Missions principales\\n- Mission 1\\n- Mission 2\\n- Mission 3\\n\\n## Profil recherché\\n- Compétence 1\\n- Compétence 2\\n- Qualité 1\\n\\n## Avantages\\n- Avantage 1\\n- Avantage 2",
  "skills_required": ["compétence1", "compétence2", "compétence3", "compétence4", "compétence5"],
  "skills_preferred": ["compétence_bonus1", "compétence_bonus2", "compétence_bonus3"],
  "experience_level": "une valeur parmi : 0-1, 1-3, 3-5, 5-10, 10+",
  "contract_type": "une valeur parmi : CDI, CDD, Stage, Alternance, Freelance",
  "education_level": "une valeur parmi : bac, bac+2, bac+3, bac+5, bac+8"
}`;

    try {
      const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${GROK_API_KEY}`,
        },
        body: JSON.stringify({
          model: "llama-3.3-70b-versatile",
          max_tokens: 1500,
          messages: [
            {
              role: "system",
              content: "Tu es un expert RH. Réponds uniquement en JSON valide, sans markdown ni backticks. N'utilise jamais '###'.",
            },
            { role: "user", content: prompt },
          ],
        }),
      });

      if (!response.ok) {
        const errData = await response.json();
        throw new Error(errData.error?.message || `Erreur API: ${response.status}`);
      }

      const data = await response.json();
      const rawText = data.choices?.[0]?.message?.content || "";

      const cleaned = rawText
        .replace(/```json/gi, "")
        .replace(/```/g, "")
        .trim();

      const generated = JSON.parse(cleaned);

      let cleanDescription = generated.description || "";
      cleanDescription = cleanDescription.replace(/^###\s*/gm, "");

      setFormData(prev => ({
        ...prev,
        description: cleanDescription,
        skills_required: generated.skills_required || prev.skills_required,
        skills_preferred: generated.skills_preferred || prev.skills_preferred,
        experience_level: generated.experience_level || prev.experience_level,
        contract_type: generated.contract_type || prev.contract_type,
        education_level: generated.education_level || prev.education_level,
      }));

      setAiGenerated(true);
      setSuccess("✨ Offre générée par l'IA avec une mise en forme professionnelle !");
      setTimeout(() => setSuccess(""), 4000);
      setActiveTab("basic");

    } catch (err) {
      console.error("Erreur Groq:", err);
      if (err.message.includes("JSON")) {
        setError("L'IA n'a pas retourné un format valide. Réessayez.");
      } else {
        setError(`Erreur IA : ${err.message}`);
      }
    } finally {
      setGenerating(false);
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({ ...prev, [name]: type === "checkbox" ? checked : value }));
    setError("");
  };

  const addSkill = (type) => {
    const skill = newSkill[type].trim();
    if (!skill) return;
    const key = `skills_${type}`;
    if (!formData[key].includes(skill)) {
      setFormData(prev => ({ ...prev, [key]: [...prev[key], skill] }));
    }
    setNewSkill(prev => ({ ...prev, [type]: "" }));
  };

  const removeSkill = (type, skill) => {
    const key = `skills_${type}`;
    setFormData(prev => ({ ...prev, [key]: prev[key].filter(s => s !== skill) }));
  };

  const validateForm = () => {
    if (!formData.title.trim()) { setError("Le titre du poste est requis."); return false; }
    if (formData.description.trim().length < 50) { setError("La description doit contenir au moins 50 caractères."); return false; }
    if (!formData.location.trim()) { setError("La localisation est requise."); return false; }
    if (formData.skills_required.length === 0) { setError("Au moins une compétence requise est nécessaire."); return false; }
    if (formData.salary_min && formData.salary_max &&
        Number(formData.salary_min) > Number(formData.salary_max)) {
      setError("Le salaire minimum ne peut pas être supérieur au salaire maximum.");
      return false;
    }
    return true;
  };

  const handleSubmit = async (e, publish = false) => {
    if (e) e.preventDefault();
    if (!validateForm()) return;

    setSaving(true);
    setError("");
    setSuccess("");

    try {
      const dataToSend = {
        ...formData,
        status: publish ? "active" : formData.status || "draft",
        salary_min: formData.salary_min === "" ? null : Number(formData.salary_min),
        salary_max: formData.salary_max === "" ? null : Number(formData.salary_max),
      };

      if (isEditing) {
        await api.patch(`/job-offers/${id}/`, dataToSend);
        setSuccess(publish ? "Offre publiée avec succès !" : "Offre mise à jour avec succès !");
      } else {
        await api.post("/job-offers/", dataToSend);
        setSuccess(publish ? "Offre créée et publiée !" : "Offre créée comme brouillon !");
      }

      setTimeout(() => navigate("/recruiter/job-offers"), 1500);
    } catch {
      setError("Erreur lors de la sauvegarde de l'offre.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
        <NavbarPro />
        <div className="flex items-center justify-center h-[80vh]">
          <div className="text-center">
            <div className="relative">
              <div className="w-20 h-20 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin mx-auto" />
              <div className="absolute inset-0 flex items-center justify-center">
                <BriefcaseIcon className="w-8 h-8 text-emerald-600 animate-pulse" />
              </div>
            </div>
            <p className="mt-4 text-gray-600 font-medium">Chargement de l'offre...</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-white to-emerald-50">
      <NavbarPro />
      <PageTransition>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">

          {/* HEADER */}
          <motion.div initial={{ opacity: 0, y: -20 }} animate={{ opacity: 1, y: 0 }} className="mb-8">
            <div className="bg-gradient-to-r from-slate-900 via-slate-800 to-emerald-900 rounded-3xl shadow-2xl overflow-hidden">
              <div className="relative px-8 py-10">
                <div className="absolute top-0 right-0 w-96 h-96 bg-emerald-500/10 rounded-full -translate-y-48 translate-x-48 blur-3xl" />
                <div className="absolute bottom-0 left-0 w-64 h-64 bg-blue-500/10 rounded-full translate-y-32 -translate-x-32 blur-3xl" />

                <div className="relative">
                  <button type="button" onClick={() => navigate(-1)}
                    className="flex items-center gap-2 text-emerald-100 hover:text-white mb-6 transition">
                    <ArrowLeftIcon className="w-5 h-5" />
                    Retour aux offres
                  </button>

                  <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6">
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-16 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-2xl flex items-center justify-center shadow-2xl">
                        {isEditing
                          ? <PencilSquareIcon className="w-8 h-8 text-white" />
                          : <PlusCircleIcon className="w-8 h-8 text-white" />
                        }
                      </div>
                      <div>
                        <h1 className="text-3xl font-bold text-white">
                          {isEditing ? "Modifier l'offre" : "Créer une nouvelle offre"}
                        </h1>
                        <p className="text-emerald-100 mt-1">
                          {isEditing
                            ? "Modifiez les détails de votre offre d'emploi"
                            : "Publiez une offre et trouvez les meilleurs talents"
                          }
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-3">
                      <button type="button" onClick={() => setPreviewMode(!previewMode)}
                        className="p-3 bg-white/10 backdrop-blur border border-white/20 rounded-xl hover:bg-white/20 transition" title="Aperçu">
                        <EyeIcon className="w-5 h-5 text-white" />
                      </button>
                      <button type="button" onClick={e => handleSubmit(e, true)} disabled={saving}
                        className="inline-flex items-center gap-2 px-6 py-3 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 font-semibold transition shadow-lg group disabled:opacity-50">
                        <RocketLaunchIcon className="w-5 h-5 group-hover:scale-110 transition" />
                        {saving ? "Publication..." : "Publier"}
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mt-8">
                    {stats.map((stat, i) => (
                      <motion.div key={i} initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
                        className="bg-white/10 backdrop-blur rounded-xl px-4 py-3 border border-white/20">
                        <div className="flex items-center gap-3">
                          <stat.icon className="w-5 h-5 text-emerald-300" />
                          <div>
                            <p className="text-emerald-100 text-xs">{stat.label}</p>
                            <p className="text-xl font-bold text-white">{stat.value}{stat.suffix}</p>
                          </div>
                        </div>
                      </motion.div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
<BackButton fallbackPath="/recruiter/job-offers" className="mb-6" />
          {/* MESSAGES */}
          <AnimatePresence>
            {error && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-center gap-3">
                <XCircleIcon className="w-5 h-5 text-red-600 shrink-0" />
                <p className="text-red-700">{error}</p>
              </motion.div>
            )}
            {success && (
              <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}
                className="mb-6 p-4 bg-emerald-50 border border-emerald-200 rounded-xl flex items-center gap-3">
                <CheckCircleIcon className="w-5 h-5 text-emerald-600 shrink-0" />
                <p className="text-emerald-700">{success}</p>
              </motion.div>
            )}
          </AnimatePresence>

          {/* HINT IA */}
          {!isEditing && (
            <motion.div initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.15 }}
              className="mb-6 flex items-center gap-3 px-4 py-3 bg-purple-50 border border-purple-100 rounded-xl">
              <SparklesIcon className="w-5 h-5 text-purple-500 shrink-0" />
              <p className="text-sm text-purple-700 flex-1">
                💡 <strong>Astuce IA :</strong> Saisissez le titre du poste puis cliquez sur{" "}
                <span className="font-semibold">"Générer avec IA"</span> pour remplir automatiquement la description et les compétences.
              </p>
              {aiGenerated && (
                <span className="text-xs bg-emerald-100 text-emerald-700 border border-emerald-200 px-2 py-0.5 rounded-full font-medium shrink-0">
                  ✓ Généré
                </span>
              )}
              {generating && (
                <div className="flex gap-1 shrink-0">
                  {[0, 1, 2].map(i => (
                    <div key={i} className="w-1.5 h-1.5 bg-purple-400 rounded-full animate-bounce"
                      style={{ animationDelay: `${i * 0.15}s` }} />
                  ))}
                </div>
              )}
            </motion.div>
          )}

          {/* RECOMMANDATIONS IA */}
          {showRecommendations && recommendations.length > 0 && !previewMode && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="mb-6 bg-gradient-to-r from-amber-50 to-orange-50 border border-amber-200 rounded-2xl overflow-hidden"
            >
              <div className="px-5 py-4 border-b border-amber-200 bg-amber-100/50">
                <div className="flex items-center gap-2">
                  <StarIcon className="w-5 h-5 text-amber-600" />
                  <h3 className="font-bold text-amber-800">💡 Talents recommandés par IA</h3>
                  <span className="text-xs text-amber-600 ml-2">
                    Basé sur votre offre, voici des candidats de votre vivier qui pourraient vous intéresser
                  </span>
                </div>
              </div>

              {loadingRecommendations ? (
                <div className="p-8 text-center">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-amber-600 mx-auto" />
                  <p className="text-sm text-amber-600 mt-2">Analyse des talents en cours...</p>
                </div>
              ) : (
                <div className="divide-y divide-amber-100">
                  {recommendations.slice(0, 5).map((talent, idx) => (
                    <div key={talent.talent_id} className="p-4 hover:bg-amber-50/50 transition">
                      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 flex-wrap">
                            <h4 className="font-semibold text-gray-900">{talent.candidate_name}</h4>
                            <span className={`text-xs font-medium px-2 py-0.5 rounded-full ${talent.match_score >= 80 ? "bg-emerald-100 text-emerald-700" :
                                talent.match_score >= 60 ? "bg-blue-100 text-blue-700" : "bg-amber-100 text-amber-700"
                              }`}>
                              Score {talent.match_score}%
                            </span>
                            {talent.domain && (
                              <span className="text-xs text-gray-500 border border-gray-200 px-2 py-0.5 rounded-full">
                                {talent.domain}
                              </span>
                            )}
                          </div>

                          <div className="flex flex-wrap gap-3 mt-2 text-sm text-gray-500">
                            {talent.skills && talent.skills.slice(0, 5).map((skill, i) => (
                              <span key={i} className="text-xs bg-gray-100 px-2 py-0.5 rounded-full">{skill}</span>
                            ))}
                            {talent.skills && talent.skills.length > 5 && (
                              <span className="text-xs text-gray-400">+{talent.skills.length - 5}</span>
                            )}
                          </div>

                          {talent.years_experience > 0 && (
                            <p className="text-xs text-gray-400 mt-1 flex items-center gap-1">
                              <ClockIcon className="w-3 h-3" />
                              {talent.years_experience} ans d'expérience
                            </p>
                          )}

                          {talent.match_reason && (
                            <p className="text-xs text-amber-600 mt-1 italic">💡 {talent.match_reason}</p>
                          )}
                        </div>

                        <button
                          onClick={() => handleInviteRecommendedTalent(talent)}
                          disabled={invitingTalentId === talent.talent_id}
                          className="px-4 py-2 text-sm font-medium bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition shadow-sm flex items-center gap-2 shrink-0 disabled:opacity-50"
                        >
                          {invitingTalentId === talent.talent_id ? (
                            <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                          ) : (
                            <EnvelopeIcon className="w-4 h-4" />
                          )}
                          Inviter à postuler
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {recommendations.length > 5 && (
                <div className="px-5 py-3 bg-amber-50 text-center border-t border-amber-100">
                  <p className="text-xs text-amber-600">
                    + {recommendations.length - 5} autre{recommendations.length - 5 > 1 ? "s" : ""} talent{recommendations.length - 5 > 1 ? "s" : ""} disponible{recommendations.length - 5 > 1 ? "s" : ""} dans votre vivier
                  </p>
                </div>
              )}
            </motion.div>
          )}

          {/* FORMULAIRE OU APERÇU */}
          {previewMode ? (
            <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
              className="bg-white rounded-2xl shadow-xl border border-gray-100 p-8">
              <div className="flex items-center justify-between mb-6">
                <h2 className="text-2xl font-bold text-gray-900">Aperçu de l'offre</h2>
                <button type="button" onClick={() => setPreviewMode(false)}
                  className="px-4 py-2 border border-gray-200 rounded-lg hover:bg-gray-50">
                  Retour à l'édition
                </button>
              </div>
              <div className="border-b border-gray-200 pb-6 mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">{formData.title || "Titre du poste"}</h1>
                <div className="flex flex-wrap gap-4 text-gray-600">
                  <span className="flex items-center gap-1"><BuildingOfficeIcon className="w-4 h-4" />{user?.fullName || "Entreprise"}</span>
                  <span className="flex items-center gap-1"><MapPinIcon className="w-4 h-4" />{formData.location || "Localisation"}</span>
                  <span className="flex items-center gap-1"><BriefcaseIcon className="w-4 h-4" />{contractTypes.find(c => c.value === formData.contract_type)?.label || "CDI"}</span>
                </div>
              </div>
              <div className="mb-6">
                <h2 className="text-xl font-semibold text-gray-900 mb-3">Description du poste</h2>
                <div
                  className="prose max-w-none"
                  dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(formData.description) }}
                />
              </div>
              {formData.skills_required.length > 0 && (
                <div className="mb-6">
                  <h2 className="text-xl font-semibold text-gray-900 mb-3">Compétences requises</h2>
                  <div className="flex flex-wrap gap-2">
                    {formData.skills_required.map((s, i) => (
                      <span key={i} className="px-3 py-1 bg-emerald-100 text-emerald-700 rounded-full text-sm">{s}</span>
                    ))}
                  </div>
                </div>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 bg-gray-50 p-6 rounded-xl">
                <div>
                  <h3 className="font-medium text-gray-700 mb-2">Informations complémentaires</h3>
                  <ul className="space-y-2 text-sm text-gray-600">
                    <li>• Expérience : {experienceLevels.find(e => e.value === formData.experience_level)?.label}</li>
                    <li>• Télétravail : {formData.remote_possible ? "Oui" : "Non"}</li>
                    {formData.salary_min && formData.salary_max && (
                      <li>• Salaire : {formData.salary_min} – {formData.salary_max} TND</li>
                    )}
                  </ul>
                </div>
              </div>
            </motion.div>
          ) : (
            <form onSubmit={e => handleSubmit(e, false)}>
              {/* TABS */}
              <div className="mb-6 border-b border-gray-200">
                <nav className="flex gap-6 overflow-x-auto">
                  {[
                    { key: "basic", icon: DocumentTextIcon, label: "Informations de base" },
                    { key: "skills", icon: TagIcon, label: "Compétences" },
                    { key: "details", icon: BriefcaseIcon, label: "Détails" },
                  ].map(tab => (
                    <button key={tab.key} type="button" onClick={() => setActiveTab(tab.key)}
                      className={`pb-4 px-1 font-medium text-sm border-b-2 transition flex items-center gap-2 ${activeTab === tab.key
                          ? "border-emerald-600 text-emerald-600"
                          : "border-transparent text-gray-500 hover:text-gray-700"
                        }`}
                    >
                      <tab.icon className="w-5 h-5" />{tab.label}
                      {aiGenerated && (tab.key === "basic" || tab.key === "skills") && (
                        <span className="ml-1 text-xs bg-purple-100 text-purple-600 px-1.5 py-0.5 rounded-full">IA</span>
                      )}
                    </button>
                  ))}
                </nav>
              </div>

              <AnimatePresence mode="wait">
                {activeTab === "basic" && (
                  <BasicTab
                    formData={formData}
                    handleChange={handleChange}
                    generateWithAI={generateWithAI}
                    generating={generating}
                    aiGenerated={aiGenerated}
                    wordCount={wordCount}
                    contractTypes={contractTypes}
                    experienceLevels={experienceLevels}
                  />
                )}

                {activeTab === "skills" && (
                  <SkillsTab
                    formData={formData}
                    newSkill={newSkill}
                    setNewSkill={setNewSkill}
                    addSkill={addSkill}
                    removeSkill={removeSkill}
                    aiGenerated={aiGenerated}
                  />
                )}

                {activeTab === "details" && (
                  <DetailsTab
                    formData={formData}
                    handleChange={handleChange}
                    aiGenerated={aiGenerated}
                  />
                )}
              </AnimatePresence>

              {/* BOUTONS BAS DE PAGE */}
              <div className="flex gap-4 mt-8">
                <button type="button" onClick={() => navigate("/recruiter/job-offers")}
                  className="px-6 py-3 border border-gray-200 rounded-xl hover:bg-gray-50 font-semibold transition flex items-center gap-2">
                  <XCircleIcon className="w-5 h-5" />Annuler
                </button>

                {!isEditing && (
                  <button type="submit" disabled={saving}
                    className="px-6 py-3 border border-gray-300 bg-white text-gray-700 rounded-xl hover:bg-gray-50 font-semibold transition flex items-center gap-2 disabled:opacity-50">
                    {saving ? (
                      <div className="w-5 h-5 border-2 border-gray-400 border-t-transparent rounded-full animate-spin" />
                    ) : (
                      <DocumentTextIcon className="w-5 h-5 text-gray-500" />
                    )}
                    Brouillon
                  </button>
                )}

                <button type="button" onClick={e => handleSubmit(e, !isEditing)} disabled={saving}
                  className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-semibold transition shadow-lg flex items-center justify-center gap-2 disabled:opacity-50">
                  {saving ? (
                    <>
                      <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                      {isEditing ? "Mise à jour..." : "Publication..."}
                    </>
                  ) : (
                    <>
                      <RocketLaunchIcon className="w-5 h-5" />
                      {isEditing ? "Mettre à jour" : "Publier"}
                    </>
                  )}
                </button>
              </div>
            </form>
          )}
        </div>
      </PageTransition>
    </div>
  );
}