// frontend/src/page/dashboard/components/DashboardTabs.jsx
import { SparklesIcon, BriefcaseIcon, DocumentTextIcon, HeartIcon } from "@heroicons/react/24/outline";

export function DashboardTabs({ activeTab, setActiveTab, loadingRecommendations, recommendedJobs, filteredJobs, applications, savedOffers }) {
  const tabs = [
    { key: "recommended", icon: SparklesIcon, label: `Recommandations (${loadingRecommendations ? "..." : recommendedJobs.length})` },
    { key: "all", icon: BriefcaseIcon, label: `Toutes les offres (${filteredJobs.length})` },
    { key: "applications", icon: DocumentTextIcon, label: `Mes candidatures (${applications.length})` },
    { key: "saved", icon: HeartIcon, label: `Sauvegardées (${savedOffers.length})` },
  ];

  return (
    <div className="flex gap-6 border-b border-gray-200 mb-6 overflow-x-auto pb-1">
      {tabs.map((tab) => (
        <button
          key={tab.key}
          onClick={() => setActiveTab(tab.key)}
          className={`pb-3 px-1 font-medium text-sm border-b-2 transition whitespace-nowrap flex items-center gap-2 ${
            activeTab === tab.key ? "border-emerald-600 text-emerald-600" : "border-transparent text-gray-500 hover:text-gray-700"
          }`}
        >
          <tab.icon className="w-4 h-4" /> {tab.label}
        </button>
      ))}
    </div>
  );
}