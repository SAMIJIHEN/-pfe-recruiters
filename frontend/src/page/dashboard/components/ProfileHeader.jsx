// frontend/src/page/dashboard/components/ProfileHeader.jsx
import logo from "../../../components/layout/AJ.png";

export function ProfileHeader({ step }) {
  return (
    <div className="mb-8">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-white rounded-2xl shadow-md border border-emerald-100 p-2 flex items-center justify-center">
            <img src={logo} alt="AJ Recruiters" className="w-full h-full object-contain" />
          </div>
          <div>
            <p className="text-sm font-medium text-emerald-600">Profil candidat</p>
            <h1 className="text-3xl md:text-4xl font-bold text-gray-900">Compléter votre profil</h1>
            <p className="text-gray-600 mt-1">Une interface plus claire, plus professionnelle et plus simple à remplir.</p>
          </div>
        </div>
        <div className="bg-white border border-gray-200 rounded-2xl px-5 py-4 shadow-sm min-w-[220px]">
          <p className="text-xs uppercase tracking-wide text-gray-500 mb-1">Progression</p>
          <p className="text-lg font-semibold text-gray-900">Étape {step} / 3</p>
          <div className="mt-3 h-2 bg-gray-100 rounded-full overflow-hidden">
            <div className="h-2 bg-emerald-600 rounded-full transition-all duration-500" style={{ width: `${(step / 3) * 100}%` }} />
          </div>
        </div>
      </div>
    </div>
  );
}