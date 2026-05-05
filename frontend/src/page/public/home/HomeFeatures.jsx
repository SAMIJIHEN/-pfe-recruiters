import { motion } from "framer-motion";
import { FEATURES } from "./homeData";
import { FeatureCardDark } from "./HomePieces";

export default function HomeFeatures() {
  return (
    <section className="mt-8">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-purple-900 p-8 shadow-xl"
      >
        <div className="relative">
          <div className="text-center">
            <span className="inline-block rounded-full bg-purple-500/20 px-4 py-2 text-sm font-semibold text-purple-300 ring-1 ring-purple-500/30">
              Pourquoi AJ Recruiters ?
            </span>
            <h2 className="mt-4 text-3xl font-bold text-white">
              Une solution <span className="text-purple-300">pro</span> et structurée
            </h2>
          </div>

          <div className="mt-8 grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {FEATURES.map((feature, index) => (
              <FeatureCardDark key={feature.title} {...feature} index={index} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
