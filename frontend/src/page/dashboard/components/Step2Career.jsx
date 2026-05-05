// frontend/src/page/dashboard/components/Step2Career.jsx
export function Step2Career({ formData, errors, handleChange, addSkill, removeSkill }) {
  const inputClass = (hasError = false) =>
    `w-full px-4 py-3.5 border rounded-xl bg-white text-gray-800 placeholder:text-gray-400
     focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition
     ${hasError ? "border-red-500 bg-red-50" : "border-gray-300"}`;

  return (
    <div className="space-y-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Titre professionnel <span className="text-red-500">*</span></label>
          <input type="text" name="title" value={formData.title} onChange={handleChange} placeholder="Ex: Développeur Full Stack" className={inputClass(!!errors.title)} />
          {errors.title && <p className="mt-1.5 text-sm text-red-600">{errors.title}</p>}
        </div>
        <div>
          <label className="block text-sm font-semibold text-gray-700 mb-2">Années d'expérience <span className="text-red-500">*</span></label>
          <select name="experience" value={formData.experience} onChange={handleChange} className={inputClass(!!errors.experience)}>
            <option value="">Sélectionnez</option>
            <option value="0-1">Moins d'un an</option>
            <option value="1-3">1 à 3 ans</option>
            <option value="3-5">3 à 5 ans</option>
            <option value="5-10">5 à 10 ans</option>
            <option value="10+">Plus de 10 ans</option>
          </select>
          {errors.experience && <p className="mt-1.5 text-sm text-red-600">{errors.experience}</p>}
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-semibold text-gray-700 mb-2">Niveau d'études <span className="text-red-500">*</span></label>
          <select name="education" value={formData.education} onChange={handleChange} className={inputClass(!!errors.education)}>
            <option value="">Sélectionnez</option>
            <option value="bac">Baccalauréat</option>
            <option value="bac+2">Bac+2 (BTS, DUT)</option>
            <option value="bac+3">Bac+3 (Licence)</option>
            <option value="bac+5">Bac+5 (Master, Ingénieur)</option>
            <option value="bac+8">Bac+8 (Doctorat)</option>
          </select>
          {errors.education && <p className="mt-1.5 text-sm text-red-600">{errors.education}</p>}
        </div>
      </div>

      {/* Skills */}
      <div className="border border-gray-200 rounded-2xl p-5 bg-gray-50">
        <label className="block text-sm font-semibold text-gray-700 mb-3">Compétences <span className="text-red-500">*</span></label>
        <div className="flex flex-col sm:flex-row gap-3">
          <input
            type="text"
            value={formData.newSkill}
            onChange={(e) => formData.setNewSkill ? formData.setNewSkill(e.target.value) : null}
            placeholder="Ex: React, Python, Communication..."
            className="flex-1 px-4 py-3.5 border border-gray-300 rounded-xl focus:outline-none focus:ring-4 focus:ring-emerald-100 focus:border-emerald-500 transition"
            onKeyDown={(e) => e.key === "Enter" && (e.preventDefault(), addSkill())}
          />
          <button type="button" onClick={addSkill} className="px-6 py-3.5 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition font-medium">
            Ajouter
          </button>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {formData.skills.map((skill, index) => (
            <span key={index} className="inline-flex items-center gap-2 bg-white text-gray-700 px-4 py-2 rounded-full text-sm font-medium border border-gray-300">
              {skill}
              <button type="button" onClick={() => removeSkill(skill)} className="text-gray-500 hover:text-red-600 font-bold leading-none">×</button>
            </span>
          ))}
          {formData.skills.length === 0 && <p className="text-sm text-gray-500 italic">Aucune compétence ajoutée</p>}
        </div>
        {errors.skills && <p className="mt-2 text-sm text-red-600">{errors.skills}</p>}
      </div>
    </div>
  );
}