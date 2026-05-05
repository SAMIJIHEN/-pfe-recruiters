import PublicLayout from "../../components/layout/PublicLayout";

const methods = [
  {
    title: "Entretien structuré",
    desc: "Même questions pour tous les candidats → meilleure comparaison et moins de biais.",
  },
  {
    title: "Scorecard (grille d’évaluation)",
    desc: "Critères clairs (compétences, culture fit, communication...) avec notes.",
  },
  {
    title: "STAR (Situation, Tâche, Action, Résultat)",
    desc: "Technique pour analyser des expériences réelles et éviter les réponses vagues.",
  },
];

export default function MethodesEntretien() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Méthodes d’entretien</h1>
        <p className="mt-2 text-slate-600">
          Des techniques simples pour rendre tes entretiens plus fiables.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-3">
          {methods.map((m) => (
            <div
              key={m.title}
              className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
            >
              <h3 className="text-lg font-bold text-slate-900">{m.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{m.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </PublicLayout>
  );
}
