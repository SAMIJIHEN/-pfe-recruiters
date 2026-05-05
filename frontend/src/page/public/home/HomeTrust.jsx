import { motion } from "framer-motion";
import { TRUST_TAGS, ICONS } from "./homeData";

const { CpuChipIcon } = ICONS;

export default function HomeTrust() {
  return (
    <motion.section
      initial={{ opacity: 0, y: 22 }}
      whileInView={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      viewport={{ once: true }}
      className="relative mt-8 overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-teal-900 p-8 text-white shadow-lg backdrop-blur-sm"
    >
      <div className="relative flex flex-wrap items-center justify-between gap-4">
        <div className="text-sm font-medium text-gray-300">
          <CpuChipIcon className="mr-2 inline h-5 w-5 text-teal-400" />
          Conçu pour des équipes professionnelles
        </div>

        <div className="flex flex-wrap gap-3 text-sm font-semibold">
          {TRUST_TAGS.map((text) => (
            <span
              key={text}
              className="cursor-pointer rounded-2xl bg-white/10 px-4 py-2 text-white/80 ring-1 ring-white/20 backdrop-blur-sm transition hover:bg-white/20 hover:text-white"
            >
              {text}
            </span>
          ))}
        </div>
      </div>
    </motion.section>
  );
}
