import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { METRICS, KPI_TEMPLATE, ICONS } from "./homeData";
import { MetricItem, KpiCardDark } from "./HomePieces";
import { useHomeStats } from "./useHomeStats";

const { CheckBadgeIcon, ArrowTrendingUpIcon, BuildingOfficeIcon, ShieldCheckIcon, CpuChipIcon } = ICONS;

export default function HomeHero() {
  const { stats, loading } = useHomeStats();

  // Construit le tableau KPI avec les vraies valeurs ou des placeholders pendant le chargement
  const kpiData = KPI_TEMPLATE.map((item) => {
    let value = "--";
    if (!loading && stats) {
      const raw = stats[item.key];
      value = item.percent ? `${raw}%` : String(raw);
    }
    return { ...item, value, trend: "" };
  });

  return (
    <motion.section
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.8 }}
      className="relative mb-8 overflow-hidden rounded-[32px] bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 p-8 text-white shadow-2xl md:p-12"
    >
      <div className="absolute -right-20 -top-20 h-[500px] w-[500px] rounded-full bg-emerald-500/5 blur-3xl" />
      <div className="absolute -left-20 -bottom-20 h-[500px] w-[500px] rounded-full bg-blue-500/5 blur-3xl" />

      <div className="absolute inset-0 opacity-5">
        <div
          className="h-full w-full"
          style={{
            backgroundImage:
              "linear-gradient(rgba(255,255,255,0.05) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,0.05) 1px, transparent 1px)",
            backgroundSize: "50px 50px",
          }}
        />
      </div>

      <div className="relative">
        <div className="grid items-center gap-12 lg:grid-cols-[1.3fr_0.9fr]">
          {/* LEFT */}
          <motion.div
            initial={{ opacity: 0, x: -30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
          >
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3 }}
              className="inline-flex items-center gap-2 rounded-full bg-white/5 px-4 py-2 text-sm font-medium text-emerald-300 ring-1 ring-white/10 backdrop-blur-sm"
            >
              <CheckBadgeIcon className="h-4 w-4 text-emerald-400" />
              Solution RH certifiée
              <span className="ml-1 rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs text-emerald-300">
                Enterprise Grade
              </span>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="mt-8"
            >
              <h1 className="text-5xl font-light tracking-tight text-white lg:text-6xl">
                <span className="font-bold">Recrutement</span>
                <span className="relative mx-3 inline-block">
                  <span className="relative z-10 bg-gradient-to-r from-emerald-300 via-teal-300 to-[#025AC4] bg-clip-text font-bold text-transparent">
                    nouvelle génération
                  </span>
                  <span className="absolute -bottom-1 left-0 h-[2px] w-full bg-gradient-to-r from-emerald-400 via-teal-400 to-blue-400" />
                </span>
              </h1>

              <p className="mt-4 max-w-xl text-lg font-light leading-relaxed text-slate-300">
                Une plateforme qui{" "}
                <span className="font-medium text-white">structure</span>,{" "}
                <span className="font-medium text-white">simplifie</span> et{" "}
                <span className="font-medium text-white">accélère</span> vos processus RH pour des décisions plus éclairées.
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5 }}
              className="mt-10 flex flex-wrap gap-4"
            >
              <Link
                to="/register"
                className="group relative overflow-hidden rounded-2xl bg-emerald-500 px-8 py-4 text-base font-semibold text-white transition-all hover:bg-emerald-600 hover:shadow-2xl hover:shadow-emerald-500/25"
              >
                <span className="relative z-10">Commencer </span>
              </Link>

              <Link
                to="/demo"
                className="group relative overflow-hidden rounded-2xl border border-white/20 bg-white/5 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition-all hover:border-emerald-400/50 hover:bg-white/10"
              >
                <span className="relative z-10">Voir une démo</span>
              </Link>

              <Link
                to="/contact"
                className="group flex items-center gap-2 rounded-2xl px-4 py-4 text-sm font-medium text-slate-300 transition-all hover:text-white"
              >
                <span>Contact commercial</span>
                <ArrowTrendingUpIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </motion.div>

            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="mt-12"
            >
              <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-slate-400">
                <div className="h-px w-8 bg-emerald-500/50" />
                <span>Ils nous font confiance</span>
                <div className="h-px w-8 bg-emerald-500/50" />
              </div>

              <div className="mt-6 grid grid-cols-4 gap-6">
                {METRICS.map((m) => (
                  <MetricItem key={m.label} value={m.value} label={m.label} />
                ))}
              </div>
            </motion.div>
          </motion.div>

          {/* RIGHT — Dashboard avec stats réelles */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, x: 30 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.7 }}
            className="relative"
          >
            <div className="relative">
              <div className="absolute -inset-4 rounded-3xl bg-gradient-to-r from-emerald-500/20 to-blue-500/20 blur-2xl" />

              <div className="relative rounded-3xl border border-white/10 bg-gradient-to-br from-white/10 to-white/5 p-6 shadow-2xl backdrop-blur-xl">
                <div className="flex items-center justify-between border-b border-white/10 pb-4">
                  <div className="flex items-center gap-3">
                    <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-500/20">
                      <BuildingOfficeIcon className="h-4 w-4 text-emerald-400" />
                    </div>
                    <div>
                      <div className="text-sm font-semibold text-white">AJ Recruiters Dashboard</div>
                      <div className="flex items-center gap-1.5 text-xs text-slate-400">
                        {loading ? (
                          <>
                            <span className="inline-block h-1.5 w-1.5 animate-pulse rounded-full bg-yellow-400" />
                            Chargement…
                          </>
                        ) : (
                          <>
                            <span className="inline-block h-1.5 w-1.5 rounded-full bg-emerald-400" />
                            Données en temps réel
                          </>
                        )}
                      </div>
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    <div className="h-2 w-2 rounded-full bg-emerald-400" />
                    <div className="h-2 w-2 rounded-full bg-yellow-400" />
                    <div className="h-2 w-2 rounded-full bg-blue-400" />
                  </div>
                </div>

                <div className="mt-6 grid grid-cols-2 gap-3">
                  {kpiData.map((k) => (
                    <KpiCardDark
                      key={k.label}
                      label={k.label}
                      value={k.value}
                      trend={k.trend}
                      icon={k.icon}
                      loading={loading}
                    />
                  ))}
                </div>

                <div className="mt-4 flex items-center justify-center gap-4 rounded-xl bg-white/5 p-3 text-xs text-slate-400">
                  <span className="flex items-center gap-1">
                    <ShieldCheckIcon className="h-3 w-3 text-emerald-400" />
                    ISO 27001
                  </span>
                  <span className="flex items-center gap-1">
                    <CheckBadgeIcon className="h-3 w-3 text-emerald-400" />
                    RGPD
                  </span>
                  <span className="flex items-center gap-1">
                    <CpuChipIcon className="h-3 w-3 text-emerald-400" />
                    SaaS
                  </span>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </motion.section>
  );
}
