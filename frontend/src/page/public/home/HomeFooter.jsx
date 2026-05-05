import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { ShieldCheckIcon } from "@heroicons/react/24/outline";
import logo from "../../../components/layout/AJ.png";
import "../Home.css";
export default function HomeFooter() {
  return (
    <div className="relative left-1/2 right-1/2 mt-12 w-screen -ml-[50vw] -mr-[50vw]">
      <motion.footer
        initial={{ opacity: 0, y: 30 }}
        whileInView={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        viewport={{ once: true }}
        className="w-full"
      >
        <div className="f-inner">
          <div className="absolute -right-20 -top-20 h-[600px] w-[600px] rounded-full bg-emerald-500/5 blur-3xl" />
          <div className="absolute -left-20 -bottom-20 h-[600px] w-[600px] rounded-full bg-blue-500/5 blur-3xl" />

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

          <div className="f-content">
            <div className="f-grid">
              {/* Brand - AVEC LOGO AJ RECRUITERS */}
              <motion.div
                initial={{ opacity: 0, x: -20 }}
                whileInView={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.2 }}
                viewport={{ once: true }}
                className="f-brand-col"
              >
                <div className="f-brand">
                  <div className="f-logo">
                    <img
                      src={logo}
                      alt="AJ Recruiters"
                      className="h-16 w-auto object-contain"
                    />
                  </div>
                  <div>
                    <div className="f-name">Recruiters</div>
                    <div className="f-tag">Recrutement nouvelle génération</div>
                  </div>
                </div>

                <p className="f-desc">
                  La plateforme complète pour gérer vos recrutements de A à Z.
                  Offres, candidatures, entretiens et décisions, le tout dans
                  une interface intuitive et professionnelle.
                </p>

                <div className="f-social">
                  <a href="#" className="f-social-link" aria-label="Facebook">
                    f
                  </a>
                  <a href="#" className="f-social-link" aria-label="Twitter/X">
                    x
                  </a>
                  <a href="#" className="f-social-link" aria-label="LinkedIn">
                    in
                  </a>
                </div>

                {/* Bouton Admin discret */}
                <div className="mt-6 pt-4 border-t border-white/10">
                  <Link
                    to="/admin-login"
                    className="group flex items-center justify-center gap-2 px-4 py-2 rounded-xl bg-white/5 border border-white/10 text-white/40 hover:text-emerald-400 hover:bg-white/10 hover:border-emerald-500/30 transition-all duration-300"
                  >
                    <ShieldCheckIcon className="w-4 h-4 group-hover:scale-110 transition-transform" />
                    <span className="text-xs font-mono tracking-wider">ADMIN ACCESS</span>
                  </Link>
                </div>
              </motion.div>

              {/* Colonnes PLATEFORME */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.3 }}
                viewport={{ once: true }}
              >
                <div className="f-title">PLATEFORME</div>
                <Link className="f-link" to="/">Accueil</Link>
                <Link className="f-link" to="/solution-recruteurs">Fonctionnalités</Link>
                <Link className="f-link" to="/demo">Demo</Link>
              </motion.div>

              {/* Colonnes RESSOURCES */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.4 }}
                viewport={{ once: true }}
              >
                <div className="f-title">RESSOURCES</div>
                <Link className="f-link" to="/blog">Blog</Link>
                <Link className="f-link" to="/faq">FAQ</Link>
                <Link className="f-link" to="/support">Support</Link>
              </motion.div>

              {/* Colonnes ENTREPRISE */}
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.5 }}
                viewport={{ once: true }}
              >
                <div className="f-title">ENTREPRISE</div>
                <Link className="f-link" to="/about">À propos</Link>
                <Link className="f-link" to="/contact">Contact</Link>
              </motion.div>
            </div>
          </div>
        </div>
      </motion.footer>
    </div>
  );
}