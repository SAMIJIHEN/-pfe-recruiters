import PublicLayout from "../../components/layout/PublicLayout";

export default function Diversite() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Diversité & inclusion</h1>
        <p className="mt-2 text-slate-600">
          Bonnes pratiques pour un recrutement plus équitable et plus inclusif.
        </p>

        <div className="mt-8 space-y-4">
          {[
            "Rédiger des offres neutres et claires",
            "Standardiser l’évaluation avec une grille",
            "Limiter les biais (questions, jugements rapides)",
            "Suivre des indicateurs simples (pipeline, conversions)",
          ].map((t) => (
            <div
              key={t}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <div className="text-sm font-semibold text-slate-900">✓ {t}</div>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
