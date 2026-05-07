import NavbarPro from "../../components/layout/NavbarPro"; // ✅ change le chemin/nom si besoin
import HomeFooter from "./home/HomeFooter"; // ✅ optionnel (si tu veux aussi le footer)

export default function About() {
  return (
    <div className="min-h-screen">
      {/* ✅ Navbar */}
      <NavbarPro />

      {/* ✅ Background style (comme Blog) */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-white/0 to-blue-500/10" />
        <div className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-40 bottom-10 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />

        {/* content */}
        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">À propos</h1>
          <p className="mt-3 max-w-2xl opacity-80">
            Recruiters est une plateforme de recrutement nouvelle génération pour
            centraliser les offres, candidatures, entretiens et décisions.
          </p>

          {/* cards */}
          <div className="mt-10 grid gap-6 md:grid-cols-3">
            <div className="rounded-2xl border border-white/10 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-semibold text-emerald-700">Mission</div>
              <div className="mt-2 text-xl font-semibold">
                Simplifier et accélérer le recrutement
              </div>
              <p className="mt-3 opacity-80">
                Un espace clair pour piloter tout le processus et gagner du temps
                à chaque étape.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-semibold text-emerald-700">Valeur</div>
              <div className="mt-2 text-xl font-semibold">
                Décisions plus justes, plus rapides
              </div>
              <p className="mt-3 opacity-80">
                Standardiser les étapes et garder une traçabilité complète pour
                mieux choisir.
              </p>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-semibold text-emerald-700">Expérience</div>
              <div className="mt-2 text-xl font-semibold">
                Interface pro et intuitive
              </div>
              <p className="mt-3 opacity-80">
                Une navigation simple, des vues claires et une expérience agréable
                pour RH et candidats.
              </p>
            </div>
          </div>

          {/* section */}
          <div className="mt-10 grid gap-6 md:grid-cols-2">
            <div className="rounded-2xl border border-white/10 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-semibold text-emerald-700">Pourquoi nous ?</div>
              <div className="mt-2 text-xl font-semibold">
                Un workflow de A à Z
              </div>
              <ul className="mt-3 list-disc space-y-2 pl-5 opacity-80">
                <li>Créer et publier des offres</li>
                <li>Suivre les candidatures et les statuts</li>
                <li>Planifier entretiens et validations</li>
                <li>Centraliser les décisions</li>
              </ul>
            </div>

            <div className="rounded-2xl border border-white/10 bg-white/70 p-6 shadow-sm backdrop-blur">
              <div className="text-sm font-semibold text-emerald-700">Notre promesse</div>
              <div className="mt-2 text-xl font-semibold">
                Clarté, fiabilité, efficacité
              </div>
              <p className="mt-3 opacity-80">
                Recruiters te donne une vision complète du pipeline et t’aide à
                garder un process propre, cohérent et professionnel.
              </p>
            </div>
          </div>

          {/* ✅ footer optionnel */}
          <div className="mt-14">
            <HomeFooter />
          </div>
        </div>
      </div>
    </div>
  );
}