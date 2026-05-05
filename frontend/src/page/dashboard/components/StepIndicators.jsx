// frontend/src/page/dashboard/components/StepIndicators.jsx
export function StepIndicators({ step }) {
  const steps = [
    { id: 1, label: "Infos de base" },
    { id: 2, label: "Parcours" },
    { id: 3, label: "Compléments" },
  ];
  return (
    <div className="mb-8 grid grid-cols-1 sm:grid-cols-3 gap-3">
      {steps.map((item) => (
        <div
          key={item.id}
          className={`rounded-2xl border px-4 py-3 flex items-center gap-3 transition ${
            item.id === step
              ? "bg-emerald-600 text-white border-emerald-600 shadow-md"
              : item.id < step
              ? "bg-emerald-50 text-emerald-700 border-emerald-200"
              : "bg-white text-gray-600 border-gray-200"
          }`}
        >
          <div
            className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${
              item.id === step
                ? "bg-white/20"
                : item.id < step
                ? "bg-emerald-600 text-white"
                : "bg-gray-100 text-gray-600"
            }`}
          >
            {item.id < step ? "✓" : item.id}
          </div>
          <span className="font-medium">{item.label}</span>
        </div>
      ))}
    </div>
  );
}