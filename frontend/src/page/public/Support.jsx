import PublicLayout from "../../components/layout/PublicLayout";
import { Link } from "react-router-dom";
import HomeFooter from "./home/HomeFooter";

export default function Support() {
  return (
    <PublicLayout>
      <div className="mx-auto max-w-5xl px-5 py-10">
        <h1 className="text-3xl font-bold text-slate-900">Support technique</h1>
        <p className="mt-2 text-slate-600">
          Besoin d’aide ? Voici les canaux les plus rapides.
        </p>

        <div className="mt-8 grid gap-5 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Centre d’aide</h3>
            <p className="mt-2 text-sm text-slate-600">
              Guides rapides et solutions aux problèmes courants.
            </p>
            <button className="mt-4 text-sm font-semibold text-emerald-700 hover:underline">
              Ouvrir →
            </button>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
            <h3 className="text-lg font-bold">Contacter le support</h3>
            <p className="mt-2 text-sm text-slate-600">
              Décris ton problème et on te répond rapidement.
            </p>
            <Link
              to="/contact"
              className="mt-4 inline-block text-sm font-semibold text-emerald-700 hover:underline"
            >
              Aller au contact →
            </Link>
             
          </div>
          
        </div>
      </div>
        {/* ✅ footer optionnel */}
                      <div className="mt-14">
                        <HomeFooter />
                      </div>
    </PublicLayout>
    
  );
}
