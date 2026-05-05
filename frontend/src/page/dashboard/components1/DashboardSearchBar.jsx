// frontend/src/page/dashboard/components/DashboardSearchBar.jsx
import { MagnifyingGlassIcon, MapPinIcon, BriefcaseIcon } from "@heroicons/react/24/outline";

export function DashboardSearchBar({ searchFilters, setSearchFilters, filteredJobs }) {
  const handleSearchChange = (e) => {
    const { name, value } = e.target;
    setSearchFilters((prev) => ({ ...prev, [name]: value }));
  };

  const clearSearch = () =>
    setSearchFilters({ keyword: "", location: "", contractType: "" });

  return (
    <div className="bg-white rounded-xl shadow-lg border border-gray-100 p-4 mb-6">
      <div className="flex flex-col md:flex-row md:items-center gap-4">
        <div className="flex-1">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
            <div className="relative md:col-span-2">
              <MagnifyingGlassIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="keyword"
                value={searchFilters.keyword}
                onChange={handleSearchChange}
                placeholder="Titre du poste, mot-clé..."
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="relative">
              <MapPinIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <input
                type="text"
                name="location"
                value={searchFilters.location}
                onChange={handleSearchChange}
                placeholder="Localisation"
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
              />
            </div>
            <div className="relative">
              <BriefcaseIcon className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                name="contractType"
                value={searchFilters.contractType}
                onChange={handleSearchChange}
                className="w-full pl-10 pr-3 py-2.5 border border-gray-200 rounded-lg focus:ring-2 focus:ring-emerald-500 appearance-none bg-white"
              >
                <option value="">Tous les contrats</option>
                <option value="CDI">CDI</option>
                <option value="CDD">CDD</option>
                <option value="Stage">Stage</option>
                <option value="Alternance">Alternance</option>
                <option value="Freelance">Freelance</option>
              </select>
            </div>
          </div>
        </div>
      </div>

      {(searchFilters.keyword || searchFilters.location || searchFilters.contractType) && (
        <div className="flex justify-between items-center mt-3 pt-3 border-t border-gray-100">
          <p className="text-sm text-gray-500">
            <span className="font-semibold">{filteredJobs.length}</span> offre(s) trouvée(s)
          </p>
          <button onClick={clearSearch} className="text-sm text-emerald-600 hover:text-emerald-700 flex items-center gap-1">
            ✕ Effacer
          </button>
        </div>
      )}
    </div>
  );
}