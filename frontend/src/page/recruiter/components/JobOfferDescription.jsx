// frontend/src/page/recruiter/components/JobOfferDescription.jsx
import { DocumentTextIcon, TagIcon, SparklesIcon } from "@heroicons/react/24/outline";

function formatDescriptionToHtml(text) {
  if (!text) return "";
  let html = text.replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;");
  html = html.replace(/^###\s*##\s*/gm, "## ").replace(/^##\s*##\s*/gm, "## ");
  const sections = [
    { name: "Présentation du poste", icon: "🎯", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-800", hoverBorder: "hover:border-emerald-300" },
    { name: "Missions principales", icon: "📋", bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-800", hoverBorder: "hover:border-blue-300" },
    { name: "Profil recherché", icon: "👤", bgColor: "bg-purple-50", borderColor: "border-purple-200", textColor: "text-purple-800", hoverBorder: "hover:border-purple-300" },
    { name: "Avantages", icon: "⭐", bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-800", hoverBorder: "hover:border-amber-300" },
  ];
  let result = "";
  let remaining = html;
  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const regex = new RegExp(`## ${section.name}\\s*([\\s\\S]*?)(?=## |$)`, "i");
    const match = remaining.match(regex);
    if (match) {
      let content = match[1].trim();
      content = content.replace(/^[-*] (.*)$/gm, (match, item) => `<li class="flex items-start gap-2 mb-2"><svg class="w-5 h-5 ${section.textColor} shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path></svg><span class="text-gray-700">${item}</span></li>`);
      content = content.replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-1">$&</ul>');
      content = content.replace(/\n{2,}/g, '</p><p class="mb-3">');
      content = '<p class="mb-3">' + content + '</p>';
      content = content.replace(/<p>\s*<\/p>/g, '');
      result += `<div class="bg-white rounded-xl shadow-sm overflow-hidden border ${section.borderColor} ${section.hoverBorder} transition-all duration-200 mb-6"><div class="${section.bgColor} px-5 py-3 flex items-center gap-2 border-b ${section.borderColor}"><span class="text-xl">${section.icon}</span><h3 class="text-lg font-semibold ${section.textColor}">${section.name}</h3></div><div class="p-5 text-gray-700">${content}</div></div>`;
      remaining = remaining.replace(regex, "");
    }
  }
  if (remaining.trim()) result += `<div class="bg-gray-50 rounded-xl p-5 border border-gray-200">${remaining}</div>`;
  return result;
}

export function JobOfferDescription({ offer }) {
  return (
    <div className="lg:col-span-2 space-y-6">
      <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
        <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
          <DocumentTextIcon className="w-6 h-6 text-emerald-600" />
          <h2 className="text-xl font-bold text-gray-800">Description du poste</h2>
        </div>
        <div className="prose max-w-none" dangerouslySetInnerHTML={{ __html: formatDescriptionToHtml(offer.description || "") }} />
      </div>

      {offer.skills_required?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <TagIcon className="w-6 h-6 text-emerald-600" />
            <h2 className="text-xl font-bold text-gray-800">Compétences requises</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {offer.skills_required.map((skill, i) => (
              <span key={i} className="px-4 py-2 bg-emerald-50 text-emerald-700 rounded-xl text-sm font-medium border border-emerald-200 hover:bg-emerald-100 transition">{skill}</span>
            ))}
          </div>
        </div>
      )}

      {offer.skills_preferred?.length > 0 && (
        <div className="bg-white rounded-2xl p-6 border border-gray-100 shadow-sm">
          <div className="flex items-center gap-2 mb-4 pb-2 border-b border-gray-100">
            <SparklesIcon className="w-6 h-6 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-800">Compétences souhaitées</h2>
          </div>
          <div className="flex flex-wrap gap-2">
            {offer.skills_preferred.map((skill, i) => (
              <span key={i} className="px-4 py-2 bg-purple-50 text-purple-700 rounded-xl text-sm font-medium border border-purple-200 hover:bg-purple-100 transition">{skill}</span>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}