import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { COLOR } from "./homeData";

export function MetricItem({ value, label }) {
  return (
    <div>
      <div className="text-xl font-bold text-white">{value}</div>
      <div className="text-xs text-slate-400">{label}</div>
    </div>
  );
}

export function KpiCardDark({ label, value, trend, icon: Icon, loading }) {
  return (
    <motion.div
      whileHover={{ y: -2 }}
      className="rounded-xl border border-white/10 bg-white/5 p-4 backdrop-blur-sm transition-all hover:border-emerald-500/30"
    >
      <div className="flex items-start justify-between">
        <Icon className="h-4 w-4 text-emerald-400" />
        {trend ? (
          <span className="rounded-full bg-emerald-500/20 px-2 py-0.5 text-xs font-medium text-emerald-300">
            {trend}
          </span>
        ) : null}
      </div>

      {loading ? (
        /* Skeleton pendant le chargement */
        <div className="mt-2 space-y-1.5">
          <div className="h-5 w-14 animate-pulse rounded bg-white/10" />
          <div className="h-3 w-20 animate-pulse rounded bg-white/10" />
        </div>
      ) : (
        <>
          <div className="mt-2 text-xl font-bold text-white">{value}</div>
          <div className="text-xs text-slate-400">{label}</div>
        </>
      )}
    </motion.div>
  );
}

export function FeatureCardDark({ title, desc, icon: Icon, color = "emerald", index, to }) {
  const c = COLOR[color] ?? COLOR.emerald;

  return (
    <motion.div
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.06 }}
      whileHover={{ y: -10, scale: 1.02 }}
      className={`group relative overflow-hidden rounded-3xl border border-white/10 bg-white/5 p-8 backdrop-blur-sm transition-all hover:shadow-xl ${c.glow} ${c.borderHover}`}
    >
      <div className={`inline-block rounded-2xl bg-gradient-to-r ${c.overlay} p-3 text-white shadow-lg opacity-90`}>
        <Icon className="h-6 w-6" />
      </div>

      <h3 className="mt-4 text-xl font-bold text-white">{title}</h3>
      <p className="mt-2 text-gray-400">{desc}</p>

      <Link
        to={to || "#"}
        className="mt-5 inline-block text-sm font-semibold text-emerald-400 hover:text-emerald-300 transition-colors"
      >
        En savoir plus →
      </Link>
    </motion.div>
  );
}

export function StepCardDark({ number, title, desc, icon: Icon, index }) {
  const colors = [
    "from-emerald-400 to-teal-400",
    "from-blue-400 to-indigo-400",
    "from-purple-400 to-pink-400",
  ];

  return (
    <motion.div
      initial={{ opacity: 0, x: -22 }}
      whileInView={{ opacity: 1, x: 0 }}
      viewport={{ once: true }}
      transition={{ delay: index * 0.14 }}
      whileHover={{ scale: 1.04 }}
      className="relative rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-sm transition-all hover:border-blue-400/30"
    >
      <div className={`absolute -right-2 -top-2 flex h-10 w-10 items-center justify-center rounded-xl bg-gradient-to-br ${colors[index]} text-lg font-bold text-white shadow-lg`}>
        {number}
      </div>

      <Icon className="h-8 w-8 text-blue-400" />
      <h4 className="mt-4 text-lg font-bold text-white">{title}</h4>
      <p className="mt-2 text-sm text-gray-400">{desc}</p>
    </motion.div>
  );
}
