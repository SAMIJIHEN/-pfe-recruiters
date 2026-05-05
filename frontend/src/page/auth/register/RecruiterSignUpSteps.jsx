// frontend/src/page/auth/register/RecruiterSignUpSteps.jsx

// ==================== ÉTAPE 1 : INFORMATIONS ENTREPRISE ====================
export function Step1Company({
  formData,
  errors,
  touched,
  handleChange,
  handleBlur,
  companySizeOptions,
  sectorOptions,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Nom de l'entreprise <span className="text-red-500">*</span>
        </label>
        <input
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
            errors.companyName && touched.companyName
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          name="companyName"
          value={formData.companyName}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Ex: ABC Technologies"
          required
        />
        {errors.companyName && touched.companyName && (
          <p className="mt-1 text-sm text-red-600">{errors.companyName}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Taille de l'entreprise <span className="text-red-500">*</span>
        </label>
        <select
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white ${
            errors.companySize && touched.companySize
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          name="companySize"
          value={formData.companySize}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        >
          <option value="">Sélectionnez la taille</option>
          {companySizeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        {errors.companySize && touched.companySize && (
          <p className="mt-1 text-sm text-red-600">{errors.companySize}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Secteur d'activité <span className="text-red-500">*</span>
        </label>
        <select
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 appearance-none bg-white ${
            errors.sector && touched.sector
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          name="sector"
          value={formData.sector}
          onChange={handleChange}
          onBlur={handleBlur}
          required
        >
          <option value="">Sélectionnez un secteur</option>
          {sectorOptions.map((option) => (
            <option key={option} value={option}>
              {option}
            </option>
          ))}
        </select>
        {errors.sector && touched.sector && (
          <p className="mt-1 text-sm text-red-600">{errors.sector}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Site web (optionnel)
        </label>
        <input
          className="w-full px-4 py-3 border border-gray-300 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition"
          name="website"
          value={formData.website}
          onChange={handleChange}
          placeholder="https://www.exemple.com"
        />
      </div>
    </div>
  );
}

// ==================== ÉTAPE 2 : INFORMATIONS PERSONNELLES ====================
export function Step2Personal({
  formData,
  errors,
  touched,
  handleChange,
  handleBlur,
}) {
  return (
    <div className="space-y-6">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Prénom <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
              errors.firstName && touched.firstName
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            name="firstName"
            value={formData.firstName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.firstName && touched.firstName && (
            <p className="mt-1 text-sm text-red-600">{errors.firstName}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">
            Nom <span className="text-red-500">*</span>
          </label>
          <input
            className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
              errors.lastName && touched.lastName
                ? "border-red-500 bg-red-50"
                : "border-gray-300"
            }`}
            name="lastName"
            value={formData.lastName}
            onChange={handleChange}
            onBlur={handleBlur}
            required
          />
          {errors.lastName && touched.lastName && (
            <p className="mt-1 text-sm text-red-600">{errors.lastName}</p>
          )}
        </div>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Poste / Fonction <span className="text-red-500">*</span>
        </label>
        <input
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
            errors.position && touched.position
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          name="position"
          value={formData.position}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="Responsable RH, Talent Acquisition Manager"
          required
        />
        {errors.position && touched.position && (
          <p className="mt-1 text-sm text-red-600">{errors.position}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Téléphone professionnel <span className="text-red-500">*</span>
        </label>
        <input
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
            errors.phone && touched.phone
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          name="phone"
          value={formData.phone}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="01 23 45 67 89"
          required
        />
        {errors.phone && touched.phone && (
          <p className="mt-1 text-sm text-red-600">{errors.phone}</p>
        )}
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Email professionnel <span className="text-red-500">*</span>
        </label>
        <input
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
            errors.email && touched.email
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          type="email"
          name="email"
          value={formData.email}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="prenom@entreprise.com"
          required
        />
        {errors.email && touched.email && (
          <p className="mt-1 text-sm text-red-600">{errors.email}</p>
        )}
      </div>
    </div>
  );
}

// ==================== INDICATEUR FORCE MOT DE PASSE ====================
export function PasswordStrengthIndicator({ passwordStrength }) {
  const getStrengthLabel = () => {
    if (passwordStrength === 0) return "";
    if (passwordStrength <= 25) return "Faible";
    if (passwordStrength <= 50) return "Moyen";
    if (passwordStrength <= 75) return "Bon";
    return "Fort";
  };

  const getStrengthColor = () => {
    if (passwordStrength <= 25) return "bg-red-500";
    if (passwordStrength <= 50) return "bg-yellow-500";
    if (passwordStrength <= 75) return "bg-blue-500";
    return "bg-green-500";
  };

  if (passwordStrength === 0) return null;

  return (
    <div className="mt-2">
      <div className="flex items-center gap-2">
        <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
          <div
            className={`h-full ${getStrengthColor()} transition-all duration-300`}
            style={{ width: `${passwordStrength}%` }}
          />
        </div>
        <span className="text-xs font-medium text-gray-600">
          {getStrengthLabel()}
        </span>
      </div>
    </div>
  );
}

// ==================== ÉTAPE 3 : SÉCURITÉ ====================
export function Step3Security({
  formData,
  errors,
  touched,
  handleChange,
  handleBlur,
  passwordStrength,
  PasswordStrengthIndicator,
}) {
  return (
    <div className="space-y-6">
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Mot de passe <span className="text-red-500">*</span>
        </label>
        <input
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
            errors.password && touched.password
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="••••••••"
          minLength={8}
          required
        />
        <PasswordStrengthIndicator passwordStrength={passwordStrength} />
        {errors.password && touched.password && (
          <p className="mt-1 text-sm text-red-600">{errors.password}</p>
        )}
        <p className="mt-2 text-xs text-gray-500">
          Minimum 8 caractères avec lettres majuscules, minuscules et chiffres
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Confirmer le mot de passe <span className="text-red-500">*</span>
        </label>
        <input
          className={`w-full px-4 py-3 border rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500 transition ${
            errors.confirmPassword && touched.confirmPassword
              ? "border-red-500 bg-red-50"
              : "border-gray-300"
          }`}
          type="password"
          name="confirmPassword"
          value={formData.confirmPassword}
          onChange={handleChange}
          onBlur={handleBlur}
          placeholder="••••••••"
          required
        />
        {errors.confirmPassword && touched.confirmPassword && (
          <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>
        )}
      </div>

      <div className="bg-emerald-50 rounded-xl p-4">
        <p className="text-sm text-emerald-800 flex items-center gap-2">
          <span className="text-lg">🔒</span>
          Toutes vos données sont sécurisées et cryptées
        </p>
      </div>
    </div>
  );
}

// ==================== FORMULAIRE DE VÉRIFICATION EMAIL ====================
export function VerificationForm({
  email,
  verificationCode,
  setVerificationCode,
  isVerifying,
  handleVerificationSubmit,
  handleResendCode,
}) {
  return (
    <form onSubmit={handleVerificationSubmit} className="space-y-6">
      <div className="text-center">
        <div className="w-20 h-20 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-4">
          <span className="text-3xl">📧</span>
        </div>

        <h3 className="text-xl font-bold text-gray-900 mb-2">
          Vérification email
        </h3>

        <p className="text-gray-600 mb-6">
          Un code de confirmation a été envoyé à
          <br />
          <strong className="text-emerald-600">{email}</strong>
        </p>
      </div>

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Code de vérification
        </label>

        <input
          className="w-full px-4 py-3 border border-gray-300 rounded-xl text-center text-2xl tracking-widest font-bold focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
          name="code"
          value={verificationCode}
          onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ""))}
          placeholder="123456"
          maxLength={6}
          required
          autoFocus
        />
      </div>

      <button
        type="submit"
        disabled={isVerifying}
        className="w-full py-3 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 font-medium transition disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {isVerifying ? "Vérification..." : "Vérifier mon compte"}
      </button>

      <p className="text-center text-sm text-gray-500">
        Vous n'avez pas reçu le code ?{" "}
        <button
          type="button"
          className="text-emerald-600 hover:text-emerald-700 font-medium"
          onClick={handleResendCode}
        >
          Renvoyer
        </button>
      </p>
    </form>
  );
}