// frontend/src/page/dashboard/hooks/useProfileForm.js
// ═══════════════════════════════════════════════════════════════
// ✅ HOOK COMPLET POUR LE FORMULAIRE DE PROFIL CANDIDAT
// ✅ CORRECTION : bio et titre correctement séparés (CV autofill)
// ✅ FONCTIONNALITÉS : upload photo/CV, génération IA, validation
// ═══════════════════════════════════════════════════════════════

import { useState, useEffect } from "react";
import { useUser } from "@clerk/clerk-react";
import { useNavigate } from "react-router-dom";
import axios from "axios";

export function useProfileForm() {
  const { user } = useUser();
  const navigate = useNavigate();

  const [step, setStep] = useState(1);
  const [photo, setPhoto] = useState(null);
  const [photoFile, setPhotoFile] = useState(null);
  const [photoPreview, setPhotoPreview] = useState(null);
  const [cv, setCv] = useState(null);
  const [cvFile, setCvFile] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [message, setMessage] = useState({ text: "", type: "" });
  const [uploadProgress, setUploadProgress] = useState({ photo: 0, cv: 0 });
  const [showCvConfirmModal, setShowCvConfirmModal] = useState(false);
  const [pendingCvData, setPendingCvData] = useState(null);
  const [generatingBio, setGeneratingBio] = useState(false);
  const [formData, setFormData] = useState({
    phone: "", location: "", birthDate: "",
    title: "", experience: "", education: "",
    skills: [], newSkill: "",
    bio: "",
    linkedin: "", github: "", portfolio: "",
  });
  const [errors, setErrors] = useState({});

  // Axios instances
  const api = axios.create({
    baseURL: "https://pfe-recruiters-production.up.railway.app/api",
    headers: {
      "Content-Type": "application/json",
      "X-Clerk-User-Id": user?.id || "",
      "X-User-Email": user?.emailAddresses?.[0]?.emailAddress || "",
      "X-User-Firstname": user?.firstName || "",
      "X-User-Lastname": user?.lastName || "",
    },
  });

  const uploadApi = axios.create({
    baseURL: "https://pfe-recruiters-production.up.railway.app/api",
    headers: {
      "Content-Type": "multipart/form-data",
      "X-Clerk-User-Id": user?.id || "",
      "X-User-Email": user?.emailAddresses?.[0]?.emailAddress || "",
    },
  });

  // ============================================================
  // CHARGEMENT PROFIL EXISTANT
  // ============================================================
  useEffect(() => {
    const loadProfile = async () => {
      if (!user?.id) return;
      try {
        const response = await api.get("/profile/");
        const profile = response.data;
        if (profile) {
          setFormData({
            phone: profile.phone || "",
            location: profile.location || "",
            birthDate: profile.birth_date ? profile.birth_date.split("T")[0] : "",
            title: profile.title || "",
            experience: profile.experience || "",
            education: profile.education || "",
            skills: profile.skills || [],
            newSkill: "",
            bio: profile.bio || "",
            linkedin: profile.linkedin || "",
            github: profile.github || "",
            portfolio: profile.portfolio || "",
          });
          if (profile.photo) {
            const photoUrl = profile.photo.startsWith("http")
              ? profile.photo
              : `https://pfe-recruiters-production.up.railway.app${profile.photo}`;
            setPhoto(photoUrl);
            setPhotoPreview(photoUrl);
          }
          if (profile.cv_file_name) setCv(profile.cv_file_name);
        }
      } catch (error) {
        if (error.response?.status !== 404) console.error("Erreur chargement profil:", error);
      }
    };
    loadProfile();
  }, [user?.id]);

  // ============================================================
  // GÉNÉRATION DE BIO PAR IA (SANS CV)
  // ============================================================
  const generateSimpleBio = async () => {
    if (!formData.title && formData.skills.length === 0) {
      setMessage({ 
        text: "❌ Veuillez d'abord renseigner votre titre ou vos compétences (étape 2)", 
        type: "error" 
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 3000);
      return;
    }

    setGeneratingBio(true);
    setMessage({ text: "🤖 Génération de votre présentation...", type: "info" });

    try {
      const response = await api.post("/profile/generate-simple-bio/", {
        title: formData.title,
        skills: formData.skills,
        experience: formData.experience,
        education: formData.education,
      });

      if (response.data.success && response.data.bio) {
        setFormData(prev => ({ ...prev, bio: response.data.bio }));
        setMessage({ text: "✅ Présentation générée avec succès ! Vous pouvez la modifier.", type: "success" });
        setTimeout(() => setMessage({ text: "", type: "" }), 4000);
      }
    } catch (error) {
      console.error("Erreur génération bio:", error);
      setMessage({ 
        text: error.response?.data?.error || "❌ Erreur lors de la génération", 
        type: "error" 
      });
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    } finally {
      setGeneratingBio(false);
    }
  };

  // ============================================================
  // VALIDATION
  // ============================================================
  const validateStep = (currentStep) => {
    const newErrors = {};
    if (currentStep === 1) {
      if (!formData.phone) newErrors.phone = "Le téléphone est requis";
      if (!formData.location) newErrors.location = "La localisation est requise";
    }
    if (currentStep === 2) {
      if (!formData.title) newErrors.title = "Le titre professionnel est requis";
      if (!formData.experience) newErrors.experience = "L'expérience est requise";
      if (!formData.education) newErrors.education = "Le niveau d'études est requis";
      if (formData.skills.length === 0) newErrors.skills = "Ajoutez au moins une compétence";
    }
    if (currentStep === 3) {
      if (!formData.bio) newErrors.bio = "La bio est requise";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    if (name === "bio" && value.length > 500) return;
    setFormData(prev => ({ ...prev, [name]: value }));
    if (errors[name]) setErrors(prev => ({ ...prev, [name]: null }));
  };

  // ============================================================
  // COMPÉTENCES
  // ============================================================
  const addSkill = () => {
    const skill = formData.newSkill.trim();
    if (!skill) return;
    if (!formData.skills.includes(skill)) {
      setFormData(prev => ({
        ...prev,
        skills: [...prev.skills, skill],
        newSkill: "",
      }));
      if (errors.skills) setErrors(prev => ({ ...prev, skills: null }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setFormData(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skillToRemove),
    }));
  };

  // ============================================================
  // UPLOAD PHOTO
  // ============================================================
  const handlePhotoChange = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        alert("La photo ne doit pas dépasser 5 Mo");
        return;
      }
      if (!file.type.startsWith("image/")) {
        alert("Veuillez sélectionner une image valide");
        return;
      }
      const previewUrl = URL.createObjectURL(file);
      setPhotoPreview(previewUrl);
      setPhotoFile(file);
    }
  };

  // ============================================================
  // UPLOAD FICHIER GÉNÉRIQUE
  // ============================================================
  const uploadFile = async (file, type, options = {}) => {
    const fd = new FormData();
    fd.append(type, file);
    try {
      const response = await uploadApi.post(`/upload/${type}/`, fd, {
        onUploadProgress: (progressEvent) => {
          if (progressEvent.total) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            setUploadProgress(prev => ({ ...prev, [type]: percentCompleted }));
          }
        },
      });
      let url = response.data.url;
      if (url?.includes("http://localhost:8000/media/http")) {
        const parts = url.split("/media/");
        const lastPart = parts[parts.length - 1];
        url = `/media/${lastPart}`;
      } else if (url?.startsWith("http://localhost:8000/media/")) {
        url = url.replace("http://localhost:8000", "");
      }
      if (options.returnFullResponse) return { ...response.data, url };
      return url;
    } catch (error) {
      console.error(`Erreur upload ${type}:`, error);
      throw error;
    }
  };

  // ============================================================
  // CV PARSING ET AUTOFILL
  // ============================================================
  const handleCvParsed = (data) => {
    if (!data) return;
    setPendingCvData(data);
    setShowCvConfirmModal(true);
  };

  // ✅ CORRECTION : bio dans le bon champ, titre dans le bon champ
  const applyCvDataToForm = () => {
    if (!pendingCvData) return;
    
    setFormData(prev => ({
      ...prev,
      phone: prev.phone || pendingCvData.phone || "",
      location: prev.location || pendingCvData.location || "",
      title: prev.title || pendingCvData.headline || pendingCvData.title || "",
      skills: prev.skills?.length > 0 ? prev.skills : (Array.isArray(pendingCvData.skills) ? pendingCvData.skills : []),
      linkedin: prev.linkedin || pendingCvData.linkedin || "",
      github: prev.github || pendingCvData.github || "",
      portfolio: prev.portfolio || pendingCvData.portfolio || "",
      bio: prev.bio || pendingCvData.summary || pendingCvData.bio || "",
    }));
    
    setShowCvConfirmModal(false);
    setPendingCvData(null);
    setMessage({ text: "✅ Les champs vides ont été remplis à partir du CV.", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const cancelCvAutofill = () => {
    setShowCvConfirmModal(false);
    setPendingCvData(null);
    setMessage({ text: "ℹ️ CV importé, mais aucun champ n'a été rempli automatiquement.", type: "success" });
    setTimeout(() => setMessage({ text: "", type: "" }), 3000);
  };

  const handleCvSelected = (file) => {
    if (!file) { setCv(null); setCvFile(null); return; }
    setCv(file.name);
    setCvFile(file);
  };

  // ============================================================
  // NAVIGATION ÉTAPES
  // ============================================================
  const handleNext = () => {
    if (validateStep(step)) {
      setStep(step + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handlePrevious = () => {
    setStep(step - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  // ============================================================
  // SOUMISSION FINALE
  // ============================================================
  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateStep(3)) return;
    
    setIsSubmitting(true);
    setMessage({ text: "", type: "" });
    
    try {
      let photoUrl = null;
      if (photoFile) {
        photoUrl = await uploadFile(photoFile, "photo");
        setPhoto(photoUrl);
      }
      
      let cvUrl = null;
      if (cvFile) {
        cvUrl = await uploadFile(cvFile, "cv");
        setCv(cvUrl);
      }
      
      const profileData = {
        phone: formData.phone,
        location: formData.location,
        birth_date: formData.birthDate || null,
        title: formData.title,
        experience: formData.experience,
        education: formData.education,
        skills: formData.skills,
        bio: formData.bio,
        linkedin: formData.linkedin || null,
        github: formData.github || null,
        portfolio: formData.portfolio || null,
        photo: photoUrl || photo || null,
        cv: cvUrl || cv || null,
      };
      
      await api.post("/profile/", profileData);
      setMessage({ text: "✅ Profil sauvegardé avec succès !", type: "success" });
      setTimeout(() => navigate("/dashboard"), 1800);
    } catch (error) {
      console.error("Erreur sauvegarde:", error);
      setMessage({ text: error.response?.data?.error || "❌ Erreur lors de la sauvegarde du profil", type: "error" });
      setTimeout(() => setMessage({ text: "", type: "" }), 4000);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ============================================================
  // EXPORTS
  // ============================================================
  return {
    step,
    photo,
    photoFile,
    photoPreview,
    cv,
    cvFile,
    isSubmitting,
    message,
    uploadProgress,
    showCvConfirmModal,
    pendingCvData,
    formData,
    errors,
    generatingBio,
    setFormData,
    setErrors,
    handleChange,
    addSkill,
    removeSkill,
    handlePhotoChange,
    uploadFile,
    handleCvParsed,
    applyCvDataToForm,
    cancelCvAutofill,
    handleCvSelected,
    handleNext,
    handlePrevious,
    handleSubmit,
    validateStep,
    generateSimpleBio,
    user,
    api,
    uploadApi,
  };
}