import { useState } from "react";
import NavbarPro from "../../components/layout/NavbarPro"; // adapte si besoin
import HomeFooter from "./home/HomeFooter"; // adapte si besoin
<BackButton fallbackPath="/" className="mb-6" />
export default function Contact() {
  const [status, setStatus] = useState("");

  const handleSubmit = (e) => {
    e.preventDefault();
    setStatus("Message envoyé ✅ (placeholder).");
  };

  return (
    <div className="min-h-screen">
      {/* ✅ Navbar */}
      <NavbarPro />

      {/* ✅ Background style (comme Blog) */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-500/10 via-white/0 to-blue-500/10" />
        <div className="absolute -right-40 top-10 h-[520px] w-[520px] rounded-full bg-emerald-500/10 blur-3xl" />
        <div className="absolute -left-40 bottom-10 h-[520px] w-[520px] rounded-full bg-blue-500/10 blur-3xl" />

        <div className="relative mx-auto max-w-6xl px-6 py-16">
          <h1 className="text-4xl font-bold tracking-tight">Contact</h1>
          <p className="mt-3 max-w-2xl opacity-80">
            Une question ? Besoin d’une démo ? Écris-nous et on te répond
            rapidement.
          </p>

          {/* Form */}
          <div className="mt-10 max-w-xl">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-white/10 bg-white/70 p-6 shadow-sm backdrop-blur"
            >
              <div className="text-sm font-semibold text-emerald-700">
                Envoyer un message
              </div>

              <div className="mt-4 space-y-3">
                <div>
                  <label className="text-sm opacity-80">Nom</label>
                  <input
                    required
                    className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2 outline-none"
                    placeholder="Votre nom"
                  />
                </div>

                <div>
                  <label className="text-sm opacity-80">Email</label>
                  <input
                    required
                    type="email"
                    className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2 outline-none"
                    placeholder="vous@email.com"
                  />
                </div>

                <div>
                  <label className="text-sm opacity-80">Sujet</label>
                  <input
                    className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2 outline-none"
                    placeholder="Démo / Support / Partenariat..."
                  />
                </div>

                <div>
                  <label className="text-sm opacity-80">Message</label>
                  <textarea
                    required
                    rows={5}
                    className="mt-1 w-full rounded-xl border border-black/10 bg-white/80 px-4 py-2 outline-none"
                    placeholder="Votre message..."
                  />
                </div>

                <button
                  type="submit"
                  className="w-full rounded-xl bg-emerald-500 px-4 py-2 font-semibold text-black hover:opacity-90"
                >
                  Envoyer
                </button>

                {status && (
                  <div className="rounded-xl border border-black/10 bg-white/60 p-3 text-sm">
                    {status}
                  </div>
                )}
              </div>
            </form>
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