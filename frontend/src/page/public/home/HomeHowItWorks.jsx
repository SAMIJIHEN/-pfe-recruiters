import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { STEPS, ICONS } from "./homeData";
import { StepCardDark } from "./HomePieces";

const { ArrowTrendingUpIcon } = ICONS;

export default function HomeHowItWorks() {
  return (
    <section className="mt-8">
      <motion.div
        initial={{ opacity: 0, y: 22 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        viewport={{ once: true }}
        className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-blue-900 p-8 shadow-xl"
      >
        <div className="relative">
          <div className="flex flex-col items-center justify-between gap-4 md:flex-row">
            <div>
              <h2 className="text-3xl font-bold text-white">
                Comment <span className="text-blue-300">ça marche</span>
              </h2>
              <p className="mt-2 text-gray-300">3 étapes simples pour un process clair</p>
            </div>

            <div>
              <Link
                to="/about"
                className="group flex items-center gap-2 rounded-2xl bg-blue-500/20 px-6 py-3 text-sm font-semibold text-blue-300 ring-1 ring-blue-500/30 backdrop-blur-sm transition-all hover:bg-blue-500/30 hover:shadow-xl hover:shadow-blue-500/20"
              >
                En savoir plus
                <ArrowTrendingUpIcon className="h-4 w-4 transition-transform group-hover:translate-x-1" />
              </Link>
            </div>
          </div>

          <div className="mt-10 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <StepCardDark key={step.number} {...step} index={index} />
            ))}
          </div>
        </div>
      </motion.div>
    </section>
  );
}
