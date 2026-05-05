// frontend/src/page/dashboard/CompleteProfile.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ PAGE COMPLÈTE DE COMPLÉTION DE PROFIL
// ✅ AVEC GESTION DE LA GÉNÉRATION DE BIO PAR IA
// ═══════════════════════════════════════════════════════════════

import { useUser } from "@clerk/clerk-react";
import PageTransition from "../../components/common/PageTransition";
import NavbarPro from "../../components/layout/NavbarPro";
import { useProfileForm } from "./hooks/useProfileForm";
import { ProfileHeader } from "./components/ProfileHeader";
import { StepIndicators } from "./components/StepIndicators";
import { Step1BasicInfo } from "./components/Step1BasicInfo";
import { Step2Career } from "./components/Step2Career";
import { Step3Additional } from "./components/Step3Additional";
import { CvAutofillModal } from "./components/CvAutofillModal";

export default function CompleteProfile() {
  const { user } = useUser();
  const {
    step, photoPreview, photo, uploadProgress, cv, formData, errors,
    handleChange, handlePhotoChange, uploadFile, handleCvParsed, handleCvSelected,
    addSkill, removeSkill,
    handleNext, handlePrevious, handleSubmit,
    showCvConfirmModal, applyCvDataToForm, cancelCvAutofill,
    isSubmitting, message,
    generateSimpleBio, generatingBio,
  } = useProfileForm();

  const sectionCard = "bg-white border border-gray-200 rounded-2xl p-6 shadow-sm";

  const getStepTitle = () => {
    switch (step) {
      case 1: return "Informations de base";
      case 2: return "Parcours professionnel";
      case 3: return "Informations complémentaires";
      default: return "";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-white to-emerald-50">
      <NavbarPro />
      <PageTransition>
        <div className="max-w-5xl mx-auto px-4 py-10 sm:px-6 lg:px-8">
          <ProfileHeader step={step} />

          {message.text && (
            <div className={`mb-6 rounded-2xl px-5 py-4 text-sm font-medium border ${
              message.type === "success"
                ? "bg-green-50 text-green-700 border-green-200"
                : message.type === "error"
                ? "bg-red-50 text-red-700 border-red-200"
                : "bg-blue-50 text-blue-700 border-blue-200"
            }`}>
              {message.text}
            </div>
          )}

          <StepIndicators step={step} />

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className={sectionCard}>
              <div className="mb-6">
                <h2 className="text-2xl font-bold text-gray-900">{getStepTitle()}</h2>
                <p className="text-sm text-gray-500 mt-1">Merci de renseigner les informations demandées.</p>
              </div>

              {step === 1 && (
                <Step1BasicInfo
                  user={user}
                  photoPreview={photoPreview}
                  photo={photo}
                  handlePhotoChange={handlePhotoChange}
                  uploadProgress={uploadProgress}
                  cv={cv}
                  uploadFile={uploadFile}
                  handleCvParsed={handleCvParsed}
                  handleCvSelected={handleCvSelected}
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                />
              )}

              {step === 2 && (
                <Step2Career
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                  addSkill={addSkill}
                  removeSkill={removeSkill}
                  onNewSkillChange={(value) => {}} // handled by handleChange
                />
              )}

              {step === 3 && (
                <Step3Additional
                  formData={formData}
                  errors={errors}
                  handleChange={handleChange}
                  generateSimpleBio={generateSimpleBio}
                  generatingBio={generatingBio}
                />
              )}
            </div>

            {/* Footer actions */}
            <div className="bg-white border border-gray-200 rounded-2xl p-5 shadow-sm flex justify-between items-center">
              {step > 1 ? (
                <button type="button" onClick={handlePrevious} disabled={isSubmitting}
                  className="px-6 py-3 border border-gray-300 rounded-xl hover:bg-gray-50 transition font-medium text-gray-700">
                  ← Précédent
                </button>
              ) : <div />}

              {step < 3 ? (
                <button type="button" onClick={handleNext}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium shadow-md">
                  Suivant →
                </button>
              ) : (
                <button type="submit" disabled={isSubmitting}
                  className="px-6 py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium shadow-md disabled:opacity-50">
                  {isSubmitting ? "Enregistrement..." : "Terminer le profil"}
                </button>
              )}
            </div>

            <div className="text-center">
              <p className="text-sm text-gray-600">Toutes vos informations sont sécurisées 🔒</p>
            </div>
          </form>
        </div>

        <CvAutofillModal
          show={showCvConfirmModal}
          onConfirm={applyCvDataToForm}
          onCancel={cancelCvAutofill}
        />
      </PageTransition>
    </div>
  );
}