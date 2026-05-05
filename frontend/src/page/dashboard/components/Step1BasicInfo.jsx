// frontend/src/page/dashboard/components/Step1BasicInfo.jsx
import ResumeUpload from "../ResumeUpload";

export function Step1BasicInfo({
  user,
  photoPreview,
  photo,
  handlePhotoChange,
  uploadProgress,
  cv,
  uploadFile,
  handleCvParsed,
  handleCvSelected,
  formData,
  errors,
  handleChange,
}) {
  const inputClass = (hasError = false) =>
    `w-full px-4 py-3.5 border rounded-xl bg-white text-gray-800 placeholder:text-gray-400
     focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition
     ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"}`;

  return (
    <div className="space-y-8">
      {/* Account block */}
      <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
        <div className="flex flex-col md:flex-row md:items-center gap-5">
          <div className="relative shrink-0">
            <div className="w-24 h-24 bg-gradient-to-br from-emerald-400 to-emerald-600 rounded-full flex items-center justify-center overflow-hidden ring-4 ring-white shadow-lg">
              {photoPreview ? (
                <img src={photoPreview} alt="Profile" className="w-full h-full object-cover" />
              ) : photo ? (
                <img src={photo} alt="Profile" className="w-full h-full object-cover" />
              ) : (
                <span className="text-3xl text-white font-bold">{user?.firstName?.charAt(0) || "👤"}</span>
              )}
            </div>
            <label
              htmlFor="photo-upload"
              className="absolute bottom-0 right-0 w-9 h-9 bg-emerald-600 text-white rounded-full flex items-center justify-center cursor-pointer hover:bg-emerald-700 transition shadow-md border-4 border-white"
            >
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 9a2 2 0 012-2h.93a2 2 0 001.664-.89l.812-1.22A2 2 0 0110.07 4h3.86a2 2 0 011.664.89l.812 1.22A2 2 0 0018.07 7H19a2 2 0 012 2v9a2 2 0 01-2 2H5a2 2 0 01-2-2V9z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 13a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
            </label>
            <input type="file" id="photo-upload" accept="image/*" onChange={handlePhotoChange} className="hidden" />
          </div>
          <div className="flex-1">
            <div className="flex flex-wrap items-center gap-3 mb-2">
              <h3 className="text-xl font-semibold text-gray-900">{user?.firstName} {user?.lastName}</h3>
              <span className="inline-flex items-center px-3 py-1 rounded-full text-xs font-semibold bg-emerald-100 text-emerald-700">Compte vérifié</span>
            </div>
            <p className="text-gray-600">{user?.emailAddresses?.[0]?.emailAddress}</p>
            <p className="text-sm text-gray-500 mt-2">Ajoutez une photo professionnelle pour renforcer votre profil.</p>
            {uploadProgress.photo > 0 && uploadProgress.photo < 100 && (
              <div className="mt-3 w-full bg-gray-200 rounded-full h-2 overflow-hidden">
                <div className="bg-emerald-600 h-2 rounded-full" style={{ width: `${uploadProgress.photo}%` }} />
              </div>
            )}
          </div>
        </div>
      </div>

      {/* CV Upload */}
      <ResumeUpload
        uploadFile={uploadFile}
        uploadProgress={uploadProgress.cv}
        initialFileName={cv || ""}
        onParsed={handleCvParsed}
        onFileSelected={handleCvSelected}
      />

      {/* Personal fields */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Téléphone <span className="text-red-500">*</span></label>
          <input type="tel" name="phone" value={formData.phone} onChange={handleChange} placeholder="+216 22 123 456" className={inputClass(!!errors.phone)} />
          {errors.phone && <p className="mt-1.5 text-sm text-red-600">{errors.phone}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Localisation <span className="text-red-500">*</span></label>
          <input type="text" name="location" value={formData.location} onChange={handleChange} placeholder="Tunis, Sousse, Remote..." className={inputClass(!!errors.location)} />
          {errors.location && <p className="mt-1.5 text-sm text-red-600">{errors.location}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Date de naissance</label>
          <input type="date" name="birthDate" value={formData.birthDate} onChange={handleChange} className={inputClass(false)} />
        </div>
      </div>
    </div>
  );
}