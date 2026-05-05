export const validateStep = (step, form) => {
  if (!form) return { ok: false, errors: {} };

  const newErrors = {};

  if (step === 1) {
    if (!form.companyName?.value) newErrors.companyName = "Nom d'entreprise requis";
    if (!form.companySize?.value) newErrors.companySize = "Taille d'entreprise requise";
    if (!form.sector?.value) newErrors.sector = "Secteur requis";
  }

  if (step === 2) {
    if (!form.firstName?.value) newErrors.firstName = "Prénom requis";
    if (!form.lastName?.value) newErrors.lastName = "Nom requis";
    if (!form.position?.value) newErrors.position = "Poste requis";
    if (!form.phone?.value) newErrors.phone = "Téléphone requis";
    if (!form.email?.value) {
      newErrors.email = "Email requis";
    } else if (!form.email.value.includes("@")) {
      newErrors.email = "Email invalide";
    }
  }

  if (step === 3) {
    if (!form.password?.value) {
      newErrors.password = "Mot de passe requis";
    } else if (form.password.value.length < 8) {
      newErrors.password = "Minimum 8 caractères";
    }

    if (!form.confirmPassword?.value) {
      newErrors.confirmPassword = "Confirmation requise";
    } else if (form.password?.value !== form.confirmPassword?.value) {
      newErrors.confirmPassword = "Les mots de passe ne correspondent pas";
    }
  }

  return { ok: Object.keys(newErrors).length === 0, errors: newErrors };
};