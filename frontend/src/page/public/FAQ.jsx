import PublicLayout from "../../components/layout/PublicLayout";
import HomeFooter from "./home/HomeFooter";

const faqs = [
  {
    q: "Puis-je tester la plateforme gratuitement ?",
    a: "Oui, tu peux démarrer un essai gratuit pour découvrir les fonctionnalités principales.",
  },
  {
    q: "Est-ce adapté aux PME ?",
    a: "Oui, l’outil est pensé pour les PME/ETI et peut évoluer vers des besoins plus avancés.",
  },
  {
    q: "Mes données sont-elles sécurisées ?",
    a: "Oui, on applique des bonnes pratiques de sécurité et des accès contrôlés.",
  },
  {
    q: "Proposez-vous une démo ?",
    a: "Oui, une démo est disponible sur demande (contact commercial).",
  },
];

export default function FAQ() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-4xl px-5 py-10">
        <h1 className="text-3xl font-bold text-slate-900">FAQ</h1>
        <p className="mt-2 text-slate-600">
          Les réponses aux questions les plus fréquentes.
        </p>

        <div className="mt-8 space-y-4">
          {faqs.map((item) => (
            <details
              key={item.q}
              className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm"
            >
              <summary className="cursor-pointer text-lg font-semibold text-slate-900">
                {item.q}
              </summary>
              <p className="mt-3 text-slate-600">{item.a}</p>
            </details>
          ))}
        </div>
      </div>
        {/* ✅ footer optionnel */}
                            <div className="mt-14">
                              <HomeFooter />
                            </div>
    </PublicLayout>
  );
}
