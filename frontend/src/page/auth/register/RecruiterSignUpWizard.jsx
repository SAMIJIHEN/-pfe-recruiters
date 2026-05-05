// frontend/src/page/auth/register/RecruiterSignUpWizard.jsx
import { useSignUp } from "@clerk/clerk-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import api from "../../../services/api";
import { 
  Step1Company, 
  Step2Personal, 
  Step3Security,
  PasswordStrengthIndicator,
  VerificationForm
} from "./RecruiterSignUpSteps";

export default function RecruiterSignUpWizard() {
  const navigate = useNavigate();
  const { isLoaded, signUp, setActive } = useSignUp();

  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isVerifying, setIsVerifying] = useState(false);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});
  const [passwordStrength, setPasswordStrength] = useState(0);
  const [verificationCode, setVerificationCode] = useState("");

  const [formData, setFormData] = useState({
    companyName: "",
    companySize: "",
    sector: "",
    website: "",
    firstName: "",
    lastName: "",
    position: "",
    phone: "",
    email: "",
    password: "",
    confirmPassword: "",
  });

  const STORAGE_KEY = "recruiter-signup-pending";

  useEffect(() => {
    const saved = sessionStorage.getItem(STORAGE_KEY);
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        setFormData((prev) => ({ ...prev, ...parsed }));
      } catch (e) {
        console.error("Erreur lecture sessionStorage:", e);
      }
    }
  }, []);

  useEffect(() => {
    if (!formData.password) {
      setPasswordStrength(0);
      return;
    }

    let strength = 0;
    if (formData.password.length >= 8) strength += 25;
    if (/[a-z]/.test(formData.password)) strength += 25;
    if (/[A-Z]/.test(formData.password)) strength += 25;
    if (/[0-9!@#$%^&*]/.test(formData.password)) strength += 25;

    setPasswordStrength(strength);
  }, [formData.password]);

  useEffect(() => {
    if (!isLoaded) return;
  }, [isLoaded]);

  const validateField = (name, value) => {
    switch (name) {
      case "email":
        if (!value) return "L'email est requis";
        if (!/\S+@\S+\.\S+/.test(value)) return "Email invalide";
        return "";

      case "password":
        if (!value) return "Le mot de passe est requis";
        if (value.length < 8) return "Minimum 8 caractères";
        return "";

      case "confirmPassword":
        if (!value) return "Confirmation requise";
        if (value !== formData.password) return "Les mots de passe ne correspondent pas";
        return "";

      case "phone":
        if (!value) return "Le téléphone est requis";
        if (!/^[0-9+\-\s]{8,}$/.test(value)) return "Téléphone invalide";
        return "";

      case "companyName":
      case "companySize":
      case "firstName":
      case "lastName":
      case "position":
      case "sector":
        if (!value) return "Ce champ est requis";
        return "";

      default:
        return "";
    }
  };

  const validateStep = () => {
    const stepFields = {
      1: ["companyName", "companySize", "sector"],
      2: ["firstName", "lastName", "position", "phone", "email"],
      3: ["password", "confirmPassword"],
    };

    const fieldsToValidate = stepFields[step] || [];
    const newErrors = {};
    let isValid = true;

    fieldsToValidate.forEach((field) => {
      const error = validateField(field, formData[field]);
      if (error) {
        newErrors[field] = error;
        isValid = false;
      }
    });

    setErrors(newErrors);

    const touchedFields = {};
    fieldsToValidate.forEach((field) => {
      touchedFields[field] = true;
    });
    setTouched((prev) => ({ ...prev, ...touchedFields }));

    return isValid;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;

    setFormData((prev) => {
      const updated = { ...prev, [name]: value };
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(updated));
      return updated;
    });

    if (touched[name]) {
      const error = validateField(name, value);
      setErrors((prev) => ({
        ...prev,
        [name]: error,
      }));
    }

    if (name === "password" && touched.confirmPassword) {
      setErrors((prev) => ({
        ...prev,
        confirmPassword: validateField("confirmPassword", formData.confirmPassword),
      }));
    }
  };

  const handleBlur = (e) => {
    const { name, value } = e.target;

    setTouched((prev) => ({
      ...prev,
      [name]: true,
    }));

    const error = validateField(name, value);
    setErrors((prev) => ({
      ...prev,
      [name]: error,
    }));
  };

  const handleNext = () => {
    if (!validateStep()) return;
    setStep((prev) => prev + 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const handlePrevious = () => {
    setStep((prev) => prev - 1);
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  const getClerkErrorMessage = (err, fallback = "Une erreur est survenue") => {
    return (
      err?.errors?.[0]?.longMessage ||
      err?.errors?.[0]?.message ||
      err?.message ||
      fallback
    );
  };

  const handleRecruiterSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded) {
      alert("Clerk n'est pas encore chargé");
      return;
    }

    if (!validateStep()) return;

    setIsSubmitting(true);

    try {
      const signUpAttempt = await signUp.create({
        emailAddress: formData.email.trim(),
        password: formData.password,
        firstName: formData.firstName.trim(),
        lastName: formData.lastName.trim(),
        unsafeMetadata: {
          userType: "recruiter",
        },
      });

      console.log("Compte Clerk créé:", signUpAttempt);

      sessionStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({
          ...formData,
          clerkUserId: signUpAttempt.createdUserId || "",
        })
      );

      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });

      setStep(4);
      window.scrollTo({ top: 0, behavior: "smooth" });
    } catch (err) {
      console.error("Erreur création compte Clerk:", err);
      alert(getClerkErrorMessage(err, "Erreur d'inscription"));
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleVerificationSubmit = async (e) => {
    e.preventDefault();

    if (!isLoaded || !signUp) {
      alert("Session de vérification introuvable. Recommencez l'inscription.");
      return;
    }

    const code = verificationCode.trim();

    if (!code || code.length !== 6) {
      alert("Veuillez saisir un code de 6 chiffres.");
      return;
    }

    setIsVerifying(true);

    try {
      const completeSignUp = await signUp.attemptEmailAddressVerification({
        code,
      });

      console.log("Réponse Clerk vérification:", completeSignUp);

      if (completeSignUp.status !== "complete") {
        alert("La vérification n'est pas terminée. Réessayez.");
        return;
      }

      await setActive({ session: completeSignUp.createdSessionId });

      const verifiedClerkUserId =
        completeSignUp.createdUserId || signUp.createdUserId || "";

      try {
        await api.post(
          "/recruiters/register/",
          {
            position: formData.position,
            phone: formData.phone,
            companyName: formData.companyName,
            companySize: formData.companySize,
            sector: formData.sector,
            website: formData.website,
            email: formData.email,
            firstName: formData.firstName,
            lastName: formData.lastName,
            clerk_user_id: verifiedClerkUserId,
          },
          {
            headers: {
              "X-Clerk-User-Id": verifiedClerkUserId,
              "X-User-Email": formData.email,
              "X-User-Firstname": formData.firstName,
              "X-User-Lastname": formData.lastName,
            },
          }
        );

        console.log("Données recruteur envoyées au backend après vérification");
      } catch (backendError) {
        console.error("Erreur backend après vérification:", backendError);
        alert("Compte vérifié, mais une erreur est survenue côté serveur.");
        return;
      }

      sessionStorage.removeItem(STORAGE_KEY);
      setVerificationCode("");
      navigate("/recruiter-pending", { replace: true });
    } catch (err) {
      console.error("Erreur vérification Clerk:", err);
      alert(getClerkErrorMessage(err, "Code incorrect ou expiré"));
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendCode = async () => {
    if (!isLoaded || !signUp) {
      alert("Impossible de renvoyer le code. Recommencez l'inscription.");
      return;
    }

    try {
      await signUp.prepareEmailAddressVerification({
        strategy: "email_code",
      });
      alert("Nouveau code envoyé. Utilisez uniquement le dernier email reçu.");
    } catch (err) {
      console.error("Erreur renvoi code:", err);
      alert(getClerkErrorMessage(err, "Impossible de renvoyer le code"));
    }
  };

  const companySizeOptions = [
    { value: "1-10", label: "1-10 employés" },
    { value: "11-50", label: "11-50 employés" },
    { value: "51-200", label: "51-200 employés" },
    { value: "201-500", label: "201-500 employés" },
    { value: "500+", label: "500+ employés" },
  ];

  const sectorOptions = [
    "Technologies",
    "Santé",
    "Finance",
    "Éducation",
    "Commerce",
    "Industrie",
    "Services",
    "Autre",
  ];

  return (
    <div className="w-full">
      {step < 4 && (
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700">
                Étape {step}/3
              </span>
              <span className="text-xs text-gray-500">
                {step === 1 && "Informations entreprise"}
                {step === 2 && "Informations personnelles"}
                {step === 3 && "Sécurité"}
              </span>
            </div>
            <span className="text-xs text-gray-500">
              {step === 1 && "🏢"}
              {step === 2 && "👤"}
              {step === 3 && "🔐"}
            </span>
          </div>

          <div className="flex gap-2">
            {[1, 2, 3].map((s) => (
              <div
                key={s}
                className={`flex-1 h-2 rounded-full transition-all ${
                  s <= step ? "bg-emerald-600" : "bg-gray-200"
                }`}
              />
            ))}
          </div>
        </div>
      )}

      {step === 4 ? (
        <VerificationForm
          email={formData.email}
          verificationCode={verificationCode}
          setVerificationCode={setVerificationCode}
          isVerifying={isVerifying}
          handleVerificationSubmit={handleVerificationSubmit}
          handleResendCode={handleResendCode}
        />
      ) : (
        <form
          onSubmit={step === 3 ? handleRecruiterSubmit : (e) => e.preventDefault()}
        >
          {step === 1 && (
            <Step1Company
              formData={formData}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
              companySizeOptions={companySizeOptions}
              sectorOptions={sectorOptions}
            />
          )}

          {step === 2 && (
            <Step2Personal
              formData={formData}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
            />
          )}

          {step === 3 && (
            <Step3Security
              formData={formData}
              errors={errors}
              touched={touched}
              handleChange={handleChange}
              handleBlur={handleBlur}
              passwordStrength={passwordStrength}
              PasswordStrengthIndicator={PasswordStrengthIndicator}
            />
          )}

          <div className="flex gap-4 mt-8">
            {step > 1 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="flex-1 px-6 py-3 border-2 border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium flex items-center justify-center gap-2"
                disabled={isSubmitting}
              >
                <span>←</span> Retour
              </button>
            )}

            {step < 3 ? (
              <button
                type="button"
                onClick={handleNext}
                className={`flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium flex items-center justify-center gap-2 ${
                  step === 1 ? "w-full" : ""
                }`}
              >
                Continuer <span>→</span>
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting || !isLoaded}
                className="flex-1 px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Création en cours...
                  </>
                ) : (
                  <>
                    Créer mon compte <span>✓</span>
                  </>
                )}
              </button>
            )}
          </div>
        </form>
      )}
    </div>
  );
}