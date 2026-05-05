// frontend/src/page/dashboard/components/CvAutofillModal.jsx
export function CvAutofillModal({ show, onConfirm, onCancel }) {
  if (!show) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={onCancel} />
      <div className="relative w-full max-w-xl bg-white rounded-3xl shadow-2xl border border-gray-200 p-6 sm:p-8 animate-[fadeIn_.2s_ease-out]">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 8h10M7 12h6m-6 4h8M7 4h10a2 2 0 012 2v12a2 2 0 01-2 2H7a2 2 0 01-2-2V6a2 2 0 012-2z" />
            </svg>
          </div>
          <div className="flex-1">
            <h3 className="text-2xl font-bold text-gray-900">Compléter le profil depuis le CV ?</h3>
            <p className="mt-3 text-gray-600 leading-7">
              Les informations détectées dans votre CV peuvent remplir automatiquement les champs vides du formulaire.
              <span className="font-medium text-gray-800"> Les données déjà saisies ne seront pas remplacées.</span>
            </p>
            <div className="mt-5 bg-gray-50 border border-gray-200 rounded-2xl p-4 text-sm text-gray-600">
              <p className="font-semibold text-gray-800 mb-2">Champs pouvant être complétés :</p>
              <div className="flex flex-wrap gap-2">
                {["Téléphone", "Localisation", "Titre", "Compétences", "LinkedIn", "GitHub", "Portfolio", "Bio"].map(item => (
                  <span key={item} className="px-3 py-1 rounded-full bg-white border border-gray-300 text-gray-700">{item}</span>
                ))}
              </div>
            </div>
            <div className="mt-6 flex flex-col sm:flex-row justify-end gap-3">
              <button type="button" onClick={onCancel} className="px-5 py-3 rounded-xl border border-gray-300 text-gray-700 hover:bg-gray-50 transition font-medium">
                Pas maintenant
              </button>
              <button type="button" onClick={onConfirm} className="px-5 py-3 rounded-xl bg-emerald-600 text-white hover:bg-emerald-700 transition font-medium shadow-md">
                Compléter le profil
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}