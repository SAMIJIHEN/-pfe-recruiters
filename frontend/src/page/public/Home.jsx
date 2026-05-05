// frontend/src/page/public/Home.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ VERSION PRO FINALE
// ✅ HERO IMMERSIF AVEC GRADIENT ANIMÉ
// ✅ SECTION CITATION SAINT-EXUPÉRY AVEC IMAGE HERO.PNG
// ✅ CARTES DE SÉLECTION REDESIGNÉES (CANDIDAT VS RECRUTEUR)
// ✅ TRANSITIONS PROFESSIONNELLES (STAGGER, SPRING, PARALLAXE)
// ✅ SANS STATS HEADER / SANS TEXTE INTRO REDONDANT
// ═══════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { useState, useEffect, useRef } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/common/PageTransition";
import HomeFooter from "./home/HomeFooter";
import api from "../../services/api";

// Images
import heroImage from "../../assets/image/hero.png";
import can1Image from "../../assets/image/can1.png";
import can2Image from "../../assets/image/can2.png";
import can3Image from "../../assets/image/can3.png";
import rhImage from "../../assets/image/rh.png";
import rh1Image from "../../assets/image/rh1.png";
import rh2Image from "../../assets/image/rh2.png";
import rh3Image from "../../assets/image/rh3.png";

// Heroicons
import {
  BriefcaseIcon,
  UserGroupIcon,
  DocumentTextIcon,
  CalendarIcon,
  ChartBarIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  EnvelopeIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  UsersIcon,
  MegaphoneIcon,
  ChartPieIcon,
  StarIcon,
  CursorArrowRaysIcon,
  BoltIcon,
  BellIcon,
  AcademicCapIcon,
  TrophyIcon,
  WifiIcon,
  ClockIcon,
  BuildingOfficeIcon,
  LockClosedIcon,
} from "@heroicons/react/24/outline";

// ============================================================
// ANIMATION VARIANTS PROFESSIONNELLES
// ============================================================
const fadeInUp = {
  hidden: { opacity: 0, y: 40 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

const fadeInLeft = {
  hidden: { opacity: 0, x: -60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

const fadeInRight = {
  hidden: { opacity: 0, x: 60 },
  visible: { opacity: 1, x: 0, transition: { duration: 0.7, ease: [0.25, 0.1, 0.25, 1] } },
};

const staggerContainer = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { staggerChildren: 0.15, delayChildren: 0.2, ease: "easeOut" },
  },
};

const scaleSpring = {
  hidden: { scale: 0.9, opacity: 0 },
  visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 300, damping: 25 } },
};

// ============================================================
// HERO SECTION — IMMERSIF AVEC ORBES ANIMÉS
// ============================================================
function HeroSection({ selectedType, setSelectedType }) {
  const words = ["rapide", "intelligent", "humain", "efficace"];
  const [wordIndex, setWordIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setWordIndex((i) => (i + 1) % words.length);
    }, 2200);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative overflow-hidden rounded-3xl mb-16 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950 min-h-[560px] flex flex-col items-center justify-center px-6 py-20">
      {/* Orbes de fond animés */}
      <div
        aria-hidden="true"
        className="pointer-events-none absolute inset-0"
      >
        <motion.div
          animate={{ x: [0, 30, 0], y: [0, -20, 0], scale: [1, 1.1, 1] }}
          transition={{ duration: 12, repeat: Infinity, ease: "easeInOut" }}
          className="absolute -top-32 -left-32 w-[480px] h-[480px] rounded-full bg-emerald-500/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, -25, 0], y: [0, 25, 0], scale: [1, 1.08, 1] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute -bottom-32 -right-32 w-[420px] h-[420px] rounded-full bg-blue-500/10 blur-3xl"
        />
        <motion.div
          animate={{ x: [0, 15, 0], y: [0, -15, 0] }}
          transition={{ duration: 9, repeat: Infinity, ease: "easeInOut", delay: 1 }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] rounded-full bg-teal-500/8 blur-3xl"
        />
        {/* Grille subtile */}
        <div
          className="absolute inset-0 opacity-[0.04]"
          style={{
            backgroundImage:
              "linear-gradient(to right, #fff 1px, transparent 1px), linear-gradient(to bottom, #fff 1px, transparent 1px)",
            backgroundSize: "48px 48px",
          }}
        />
      </div>

      {/* Badge */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="relative mb-6 inline-flex items-center gap-2 px-4 py-2 rounded-full border border-emerald-500/30 bg-emerald-500/10 backdrop-blur-sm"
      >
        <span className="relative flex h-2 w-2">
          <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
          <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-400" />
        </span>
        <span className="text-emerald-300 text-sm font-medium tracking-wide">
          Plateforme de recrutement nouvelle génération
        </span>
      </motion.div>

      {/* Titre principal */}
      <motion.h1
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.15 }}
        className="relative text-center font-extrabold tracking-tight text-white"
        style={{ fontSize: "clamp(2.4rem, 6vw, 4.5rem)", lineHeight: 1.12 }}
      >
        Le recrutement,{" "}
        <br className="hidden sm:block" />
        enfin{" "}
        <span className="relative inline-block">
          <AnimatePresence mode="wait">
            <motion.span
              key={wordIndex}
              initial={{ opacity: 0, y: 20, filter: "blur(8px)" }}
              animate={{ opacity: 1, y: 0, filter: "blur(0px)" }}
              exit={{ opacity: 0, y: -20, filter: "blur(8px)" }}
              transition={{ duration: 0.45, ease: "easeOut" }}
              className="inline-block bg-gradient-to-r from-emerald-400 via-teal-300 to-cyan-400 bg-clip-text text-transparent"
            >
              {words[wordIndex]}
            </motion.span>
          </AnimatePresence>
          <motion.span
            className="absolute -bottom-1 left-0 h-[3px] rounded-full bg-gradient-to-r from-emerald-400 to-cyan-400"
            initial={{ scaleX: 0 }}
            animate={{ scaleX: 1 }}
            transition={{ duration: 0.6, delay: 0.5 }}
            style={{ transformOrigin: "left" }}
          />
        </span>
        .
      </motion.h1>

      {/* Sous-titre */}
      <motion.p
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.7, delay: 0.3 }}
        className="relative mt-6 text-center text-slate-300 max-w-2xl leading-relaxed"
        style={{ fontSize: "clamp(1rem, 2vw, 1.2rem)" }}
      >
        Connectez talents et entreprises sur une plateforme pensée pour l'essentiel —
        sans friction, sans complexité.
      </motion.p>

      {/* Cartes de sélection intégrées dans le hero */}
      <motion.div
        initial={{ opacity: 0, y: 40 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, delay: 0.45, ease: [0.25, 0.1, 0.25, 1] }}
        className="relative mt-12 grid grid-cols-1 sm:grid-cols-2 gap-5 w-full max-w-4xl"
      >
        <HeroSelectorCard
          type="candidate"
          title="Je suis Candidat"
          description="Trouvez l'offre idéale, postulez en un clic."
          tags={["Gratuit", "3 min", "IA intégrée"]}
          tagColor="emerald"
          icon={<CursorArrowRaysIcon className="w-6 h-6 text-emerald-400" />}
          isActive={selectedType === "candidate"}
          onClick={() => setSelectedType("candidate")}
        />
        <HeroSelectorCard
          type="recruiter"
          title="Je suis Recruteur"
          description="Publiez, gérez et analysez vos recrutements."
          tags={["ISO 27001", "RGPD", "SLA 99.9%"]}
          tagColor="blue"
          icon={<BuildingOfficeIcon className="w-6 h-6 text-blue-400" />}
          isActive={selectedType === "recruiter"}
          onClick={() => setSelectedType("recruiter")}
        />
      </motion.div>

      {/* Trust line */}
      <motion.p
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.75 }}
        className="relative mt-8 text-slate-500 text-sm flex items-center gap-2"
      >
        <ShieldCheckIcon className="w-4 h-4 text-emerald-500" />
        Données sécurisées · Aucune carte requise · Support réactif
      </motion.p>
    </div>
  );
}

// ============================================================
// CARTE DE SÉLECTION INTÉGRÉE HERO (REDESIGNÉE)
// ============================================================
function HeroSelectorCard({ type, title, description, tags, tagColor, icon, isActive, onClick }) {
  const activeBorder = type === "candidate" ? "border-emerald-500 ring-2 ring-emerald-500/30" : "border-blue-500 ring-2 ring-blue-500/30";
  const activeBg = type === "candidate" ? "bg-emerald-500/10" : "bg-blue-500/10";
  const inactiveBg = "bg-white/5 hover:bg-white/10";
  const tagBg = tagColor === "emerald" ? "bg-emerald-500/15 text-emerald-300 border border-emerald-500/20" : "bg-blue-500/15 text-blue-300 border border-blue-500/20";

  return (
    <motion.button
      whileHover={{ y: -6, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      onClick={onClick}
      className={`relative text-left rounded-2xl border p-6 backdrop-blur-sm transition-all duration-300 cursor-pointer ${
        isActive ? `${activeBorder} ${activeBg}` : `border-white/10 ${inactiveBg}`
      }`}
    >
      {isActive && (
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          className="absolute -top-2.5 -right-2.5 w-5 h-5 rounded-full bg-emerald-400 flex items-center justify-center shadow-lg"
        >
          <CheckCircleIcon className="w-3.5 h-3.5 text-white" />
        </motion.div>
      )}

      <div className="flex items-center gap-3 mb-3">
        <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${isActive ? (type === "candidate" ? "bg-emerald-500/20" : "bg-blue-500/20") : "bg-white/10"}`}>
          {icon}
        </div>
        <h3 className="text-white font-bold text-lg">{title}</h3>
      </div>

      <p className="text-slate-400 text-sm mb-4 leading-relaxed">{description}</p>

      <div className="flex flex-wrap gap-2">
        {tags.map((tag) => (
          <span key={tag} className={`text-xs font-medium px-2.5 py-1 rounded-full ${tagBg}`}>
            {tag}
          </span>
        ))}
      </div>

      <div className={`mt-4 flex items-center gap-1.5 text-xs font-semibold transition-colors duration-200 ${isActive ? (type === "candidate" ? "text-emerald-400" : "text-blue-400") : "text-slate-500"}`}>
        {isActive ? "Section active" : "Voir la solution"}
        <ArrowRightIcon className="w-3.5 h-3.5" />
      </div>
    </motion.button>
  );
}

// ============================================================
// COMPTEUR ANIMÉ
// ============================================================
function AnimatedCounter({ value, suffix = "" }) {
  const [count, setCount] = useState(0);
  const ref = useRef(null);
  const [hasAnimated, setHasAnimated] = useState(false);

  useEffect(() => {
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated) {
          setHasAnimated(true);
          let start = 0;
          const end = typeof value === "number" ? value : parseInt(value) || 0;
          const duration = 2000;
          const increment = end / (duration / 16);
          const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
              setCount(end);
              clearInterval(timer);
            } else {
              setCount(Math.floor(start));
            }
          }, 16);
          return () => clearInterval(timer);
        }
      },
      { threshold: 0.3 }
    );
    if (ref.current) observer.observe(ref.current);
    return () => observer.disconnect();
  }, [value, hasAnimated]);

  return (
    <span ref={ref} className="inline-block">
      {count}
      {suffix}
    </span>
  );
}

// ============================================================
// STATS CARD
// ============================================================
function StatCard({ value, label, icon: Icon, color, loading }) {
  return (
    <motion.div
      variants={fadeInUp}
      whileHover={{ y: -5, transition: { duration: 0.2 } }}
      className="text-center group"
    >
      <div
        className={`w-14 h-14 mx-auto mb-4 rounded-2xl bg-${color}-100 flex items-center justify-center group-hover:scale-110 transition-transform duration-500`}
      >
        <Icon className={`w-7 h-7 text-${color}-600`} />
      </div>
      <p className="text-3xl font-bold text-gray-900">
        {loading ? (
          "..."
        ) : (
          <AnimatedCounter
            value={value}
            suffix={value.toString().includes("%") ? "" : "+"}
          />
        )}
        {value.toString().includes("%") && "%"}
      </p>
      <p className="text-gray-500 text-sm mt-1">{label}</p>
      <p className="text-xs text-emerald-600 font-medium mt-1 opacity-0 group-hover:opacity-100 transition-opacity duration-500 flex items-center justify-center gap-1">
        <ChartBarIcon className="w-3 h-3" /> en temps réel
      </p>
    </motion.div>
  );
}

// ============================================================
// SECTION CITATION SAINT-EXUPÉRY AVEC IMAGE HERO.PNG
// ============================================================
function HeroCitationSection() {
  const ref = useRef(null);
  const [scrollY, setScrollY] = useState(0);

  useEffect(() => {
    const handleScroll = () => {
      if (ref.current) {
        const rect = ref.current.getBoundingClientRect();
        const scrollPosition = window.scrollY;
        setScrollY(Math.min(Math.max((rect.top - scrollPosition) / 10, -30), 30));
      }
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  return (
    <motion.div
      ref={ref}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, margin: "-100px" }}
      variants={fadeInUp}
      className="max-w-full mx-auto mb-20"
    >
      <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-slate-900 via-slate-800 to-emerald-900 shadow-2xl">
        {/* Fond animé */}
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/15 via-transparent to-transparent animate-pulse" />
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-emerald-500/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite]" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-blue-500/20 rounded-full blur-3xl animate-[pulse_4s_ease-in-out_infinite_1s]" />

        <div className="relative grid md:grid-cols-2 gap-0">
          {/* Image avec parallaxe */}
          <motion.div
            className="relative h-full min-h-[320px] md:min-h-[400px] overflow-hidden group"
            style={{ y: scrollY * 0.5 }}
          >
            <div className="absolute inset-0 bg-gradient-to-tr from-emerald-900/40 via-transparent to-transparent z-10" />
            <motion.img
              src={heroImage}
              alt="AJ Recruiters Platform"
              className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
              onError={(e) => {
                e.target.onerror = null;
                e.target.src = "https://placehold.co/800x600/1F7A5A/white?text=AJ+Recruiters";
              }}
              initial={{ scale: 1.1 }}
              animate={{ scale: 1 }}
              transition={{ duration: 1.2, ease: "easeOut" }}
            />
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.5, duration: 0.6 }}
              className="absolute bottom-4 left-4 z-20 bg-white/10 backdrop-blur-md rounded-full px-3 py-1 border border-white/20"
            >
              <span className="text-xs text-white/80 flex items-center gap-1">
                <SparklesIcon className="w-3 h-3" /> AJ Recruiters
              </span>
            </motion.div>
          </motion.div>

          {/* Citation */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            whileInView={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.7, delay: 0.2, ease: "easeOut" }}
            viewport={{ once: true }}
            className="p-8 md:p-12 flex flex-col justify-center bg-white/5 backdrop-blur-sm"
          >
            <motion.div
              initial={{ scale: 0, rotate: -180 }}
              whileInView={{ scale: 1, rotate: 0 }}
              transition={{ type: "spring", stiffness: 300, damping: 20, delay: 0.3 }}
              viewport={{ once: true }}
              className="mb-6"
            >
              <div className="w-12 h-12 rounded-full bg-emerald-500/20 flex items-center justify-center border border-emerald-500/30">
                <svg className="w-6 h-6 text-emerald-400" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M14.017 21v-7.391c0-5.704 3.731-9.57 8.983-10.609l.995 2.151c-2.432.917-3.995 3.638-3.995 5.849h4v10h-9.983zm-14.017 0v-7.391c0-5.704 3.748-9.57 9-10.609l.996 2.151c-2.433.917-3.996 3.638-3.996 5.849h3.983v10h-9.983z" />
                </svg>
              </div>
            </motion.div>

            <blockquote className="mb-6">
              <motion.p
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.6, delay: 0.4 }}
                viewport={{ once: true }}
                className="text-2xl md:text-3xl lg:text-4xl font-light text-white leading-relaxed italic"
              >
                "La perfection est atteinte, non quand il n'y a plus rien à ajouter,
                mais quand il n'y a plus rien à enlever."
              </motion.p>
              <motion.footer
                initial={{ opacity: 0 }}
                whileInView={{ opacity: 1 }}
                transition={{ duration: 0.5, delay: 0.6 }}
                viewport={{ once: true }}
                className="mt-4"
              >
                <p className="text-emerald-300 font-semibold">— Antoine de Saint-Exupéry</p>
                <p className="text-gray-400 text-sm mt-1">Écrivain, aviateur (1900-1944)</p>
              </motion.footer>
            </blockquote>

            <motion.div
              initial={{ width: 0 }}
              whileInView={{ width: "5rem" }}
              transition={{ duration: 1, delay: 0.7, ease: "easeOut" }}
              viewport={{ once: true }}
              className="h-px bg-gradient-to-r from-emerald-400 to-transparent my-4"
            />

            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.8 }}
              viewport={{ once: true }}
              className="mt-2"
            >
              <h3 className="text-xl font-bold text-white mb-3">
                AJ Recruiters applique cette philosophie
              </h3>
              <p className="text-gray-300 leading-relaxed">
                Pour{" "}
                <span className="text-emerald-400 font-semibold">
                  simplifier radicalement
                </span>{" "}
                le recrutement, nous avons conçu une plateforme intuitive où l'essentiel
                prime.
                <span className="block mt-2 text-emerald-300 text-sm">
                  🎯 Plus de complexité. Juste l'efficacité.
                </span>
              </p>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
}

// ============================================================
// CONTENU CANDIDAT
// ============================================================
function CandidateContent({ stats, loadingStats }) {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "🔍 Recherche intelligente",
      description: "Trouvez l'offre parfaite grâce à notre moteur de recherche avancé.",
      stat: "+78%",
      statLabel: "de pertinence",
      icon: MagnifyingGlassIcon,
      image: can1Image,
      benefits: ["Moteur intelligent", "Filtres personnalisables", "Alertes email"],
    },
    {
      title: "⚡ Candidature simplifiée",
      description: "Postulez en un clic avec votre profil pré-rempli par l'IA.",
      stat: "-65%",
      statLabel: "de temps perdu",
      icon: DocumentTextIcon,
      image: can2Image,
      benefits: ["Candidature en un clic", "Profil pré-rempli", "Sauvegarde auto"],
    },
    {
      title: "📊 Suivi en temps réel",
      description: "Suivez l'avancement de vos candidatures à chaque étape.",
      stat: "100%",
      statLabel: "de visibilité",
      icon: ChartBarIcon,
      image: can3Image,
      benefits: ["Notifications en temps réel", "Historique complet", "Statut clair"],
    },
    {
      title: "🎓 Préparation entretiens",
      description: "Accédez à des conseils personnalisés pour réussir vos entretiens.",
      stat: "+200%",
      statLabel: "de chances de réussite",
      icon: CalendarIcon,
      image: can1Image,
      benefits: ["Simulateur d'entretien", "Conseils personnalisés", "Questions fréquentes"],
    },
  ];

  const benefits = [
    { icon: CursorArrowRaysIcon, text: "Trouvez l'offre idéale en quelques minutes" },
    { icon: BoltIcon, text: "Postulez en un clic grâce à l'IA" },
    { icon: ChartBarIcon, text: "Suivez vos candidatures en temps réel" },
    { icon: BellIcon, text: "Recevez des alertes personnalisées" },
    { icon: AcademicCapIcon, text: "Accédez à des conseils d'experts" },
    { icon: TrophyIcon, text: "Maximisez vos chances de réussite" },
  ];

  const statsData = [
    { value: loadingStats ? "0" : stats.totalOffres || 0, label: "Offres actives", icon: BriefcaseIcon, color: "emerald" },
    { value: loadingStats ? "0" : stats.totalCandidats || 0, label: "Candidats inscrits", icon: UserGroupIcon, color: "blue" },
    { value: loadingStats ? "0" : stats.totalCandidatures || 0, label: "Candidatures", icon: DocumentTextIcon, color: "amber" },
    { value: loadingStats ? "0" : stats.tauxSatisfaction || 0, label: "Satisfaction", icon: StarIcon, color: "purple" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      variants={staggerContainer}
      className="space-y-16"
    >
      {/* Hero Candidats */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div variants={fadeInLeft}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 mb-6">
            <SparklesIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">Solution Candidats</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <CursorArrowRaysIcon className="w-10 h-10 inline-block mr-2 text-emerald-500" />
            Trouvez le{" "}
            <span className="bg-gradient-to-r from-emerald-500 to-teal-500 bg-clip-text text-transparent">
              job idéal
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            La plateforme qui connecte les talents aux meilleures opportunités
            professionnelles.{" "}
            <BoltIcon className="w-4 h-4 inline-block mx-1 text-emerald-500" />
            Simple, rapide, et totalement gratuit.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RocketLaunchIcon className="w-5 h-5" />
              Créer mon profil
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/jobs"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              <MagnifyingGlassIcon className="w-5 h-5" />
              Explorer les offres
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {["Gratuit", "Sans engagement", "3 min chrono", "Support réactif"].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeInRight} className="relative">
          <div className="bg-gradient-to-br from-white to-emerald-50 rounded-2xl p-4 border border-gray-200 shadow-xl">
            <img src={can1Image} alt="Recherche emploi" className="rounded-xl w-full mb-4" />
            <div className="grid grid-cols-2 gap-3">
              <img src={can2Image} alt="Candidature" className="rounded-lg h-28 object-cover" />
              <img src={can3Image} alt="Suivi" className="rounded-lg h-28 object-cover" />
            </div>
            <motion.div
              initial={{ scale: 0, rotate: -10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 15 }}
              className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl px-4 py-2 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-white" />
                <span className="text-xl font-bold text-white">
                  {loadingStats ? "..." : stats.tauxSatisfaction}%
                </span>
              </div>
              <p className="text-xs text-emerald-100">de satisfaction</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Statistiques */}
      <motion.div variants={staggerContainer} className="py-8 border-t border-gray-100">
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-emerald-500" />
            Ils nous font confiance
          </h3>
          <p className="text-gray-500">Des chiffres qui parlent d'eux-mêmes</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, idx) => (
            <StatCard key={idx} {...stat} loading={loadingStats} />
          ))}
        </div>
      </motion.div>

      {/* Fonctionnalités */}
      <motion.div variants={staggerContainer}>
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <SparklesIcon className="w-6 h-6 text-emerald-500" />
            Fonctionnalités clés
          </h3>
          <p className="text-gray-500">Tout pour réussir votre recherche d'emploi</p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInLeft}
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                onClick={() => setActiveFeature(idx)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeFeature === idx
                    ? "bg-emerald-50 border-l-4 border-emerald-500 shadow-md"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-emerald-100 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                  <span className="text-xl font-bold text-emerald-600">{feature.stat}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl"
          >
            <img
              src={features[activeFeature].image}
              alt={features[activeFeature].title}
              className="rounded-xl w-full"
            />
            <p className="text-white text-center mt-3 font-semibold">
              {features[activeFeature].title}
            </p>
            <p className="text-gray-400 text-center text-sm">
              {features[activeFeature].statLabel}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Avantages */}
      <motion.div variants={staggerContainer} className="py-8">
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <TrophyIcon className="w-6 h-6 text-emerald-500" />
            Pourquoi nous choisir ?
          </h3>
          <p className="text-gray-500">Une expérience candidat unique et innovante</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-emerald-100 flex items-center justify-center">
                <benefit.icon className="w-5 h-5 text-emerald-600" />
              </div>
              <span className="text-gray-700 font-medium">{benefit.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Final Candidats */}
      <motion.div
        variants={scaleSpring}
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-10 text-center shadow-xl"
      >
        <div className="relative">
          <RocketLaunchIcon className="w-12 h-12 text-white mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
            <CursorArrowRaysIcon className="w-6 h-6" />
            Prêt à décrocher le job de vos rêves ?
          </h3>
          <p className="text-emerald-100 mb-6">
            Rejoignez des milliers de talents qui ont trouvé leur bonheur
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl font-semibold hover:bg-gray-100 shadow-md transition-all duration-300"
          >
            <RocketLaunchIcon className="w-5 h-5" />
            Créer mon profil
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// CONTENU RECRUTEUR
// ============================================================
function RecruiterContent({ stats, loadingStats }) {
  const [activeFeature, setActiveFeature] = useState(0);

  const features = [
    {
      title: "📢 Publication d'offres IA",
      description: "Créez des offres attractives en quelques minutes.",
      stat: "+45%",
      statLabel: "de candidatures qualifiées",
      icon: MegaphoneIcon,
      image: rh2Image,
    },
    {
      title: "👥 Gestion des candidatures",
      description: "Pipeline visuel type Kanban pour suivre chaque candidat.",
      stat: "-60%",
      statLabel: "de temps de traitement",
      icon: UserGroupIcon,
      image: rh1Image,
    },
    {
      title: "📅 Planification entretiens",
      description: "Calendrier synchronisé avec les agendas des candidats.",
      stat: "3x",
      statLabel: "plus rapide",
      icon: CalendarIcon,
      image: rhImage,
    },
    {
      title: "📊 Statistiques avancées",
      description: "Dashboards interactifs avec indicateurs en temps réel.",
      stat: "100%",
      statLabel: "de visibilité",
      icon: ChartPieIcon,
      image: rh3Image,
    },
  ];

  const benefits = [
    { icon: ClockIcon, text: "Jusqu'à 60% de temps gagné" },
    { icon: StarIcon, text: "98% de satisfaction des recruteurs" },
    { icon: UserGroupIcon, text: "Collaboration en équipe" },
    { icon: ShieldCheckIcon, text: "Certification ISO 27001" },
    { icon: ChartBarIcon, text: "Tableaux de bord en temps réel" },
    { icon: SparklesIcon, text: "IA intégrée pour le screening" },
  ];

  const statsData = [
    { value: loadingStats ? "0" : stats.totalOffres || 0, label: "Offres actives", icon: BriefcaseIcon, color: "emerald" },
    { value: loadingStats ? "0" : stats.totalRecruteurs || 0, label: "Recruteurs inscrits", icon: UsersIcon, color: "blue" },
    { value: loadingStats ? "0" : stats.totalCandidatures || 0, label: "Candidatures", icon: DocumentTextIcon, color: "amber" },
    { value: loadingStats ? "0" : stats.tauxSatisfaction || 0, label: "Satisfaction", icon: StarIcon, color: "purple" },
  ];

  return (
    <motion.div
      initial="hidden"
      animate="visible"
      exit={{ opacity: 0, y: 20, transition: { duration: 0.3 } }}
      variants={staggerContainer}
      className="space-y-16"
    >
      {/* Hero Recruteurs */}
      <div className="grid lg:grid-cols-2 gap-12 items-center">
        <motion.div variants={fadeInLeft}>
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-blue-100 text-blue-700 mb-6">
            <SparklesIcon className="w-4 h-4" />
            <span className="text-sm font-semibold">Solution Recruteurs</span>
          </div>
          <h2 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-6">
            <BuildingOfficeIcon className="w-10 h-10 inline-block mr-2 text-blue-500" />
            Solution{" "}
            <span className="bg-gradient-to-r from-blue-500 to-indigo-600 bg-clip-text text-transparent">
              Recruteurs
            </span>
          </h2>
          <p className="text-lg text-gray-600 mb-8 leading-relaxed">
            La plateforme nouvelle génération qui transforme votre façon de recruter.{" "}
            <BoltIcon className="w-4 h-4 inline-block mx-1 text-blue-500" />
            Plus rapide, plus intelligent, plus efficace.
          </p>
          <div className="flex flex-wrap gap-4 mb-8">
            <Link
              to="/register"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white rounded-xl font-semibold shadow-lg hover:shadow-xl transition-all duration-300"
            >
              <RocketLaunchIcon className="w-5 h-5" />
              Commencer
              <ArrowRightIcon className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              to="/contact"
              className="group inline-flex items-center gap-2 px-6 py-3 bg-white border border-gray-200 text-gray-700 rounded-xl font-medium hover:bg-gray-50 transition-all duration-300"
            >
              <EnvelopeIcon className="w-5 h-5" />
              Demander une démo
            </Link>
          </div>
          <div className="flex flex-wrap gap-4 text-sm text-gray-500">
            {["ISO 27001", "RGPD conforme", "SLA 99.9%", "Support 24/7"].map((t) => (
              <span key={t} className="flex items-center gap-1">
                <CheckCircleIcon className="w-4 h-4 text-blue-500" />
                {t}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div variants={fadeInRight} className="relative">
          <div className="bg-gradient-to-br from-white to-blue-50 rounded-2xl p-4 border border-gray-200 shadow-xl">
            <img
              src={rhImage}
              alt="Dashboard recruteur"
              className="rounded-xl w-full mb-4"
            />
            <div className="grid grid-cols-2 gap-3">
              <img src={rh1Image} alt="Analytics" className="rounded-lg h-28 object-cover" />
              <img src={rh2Image} alt="Statistics" className="rounded-lg h-28 object-cover" />
            </div>
            <motion.div
              initial={{ scale: 0, rotate: 10 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.5, type: "spring", stiffness: 400, damping: 15 }}
              className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl px-4 py-2 shadow-xl"
            >
              <div className="flex items-center gap-2">
                <HeartIcon className="w-5 h-5 text-white" />
                <span className="text-xl font-bold text-white">
                  {loadingStats ? "..." : stats.tauxSatisfaction}%
                </span>
              </div>
              <p className="text-xs text-emerald-100">de satisfaction</p>
            </motion.div>
          </div>
        </motion.div>
      </div>

      {/* Statistiques */}
      <motion.div variants={staggerContainer} className="py-8 border-t border-gray-100">
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <ChartBarIcon className="w-6 h-6 text-blue-500" />
            Ils nous font confiance
          </h3>
          <p className="text-gray-500">Des chiffres qui parlent d'eux-mêmes</p>
        </motion.div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {statsData.map((stat, idx) => (
            <StatCard key={idx} {...stat} loading={loadingStats} />
          ))}
        </div>
      </motion.div>

      {/* Fonctionnalités */}
      <motion.div variants={staggerContainer}>
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <SparklesIcon className="w-6 h-6 text-blue-500" />
            Fonctionnalités clés
          </h3>
          <p className="text-gray-500">Tout ce dont vous avez besoin pour recruter efficacement</p>
        </motion.div>
        <div className="grid lg:grid-cols-2 gap-8">
          <div className="space-y-4">
            {features.map((feature, idx) => (
              <motion.div
                key={idx}
                variants={fadeInLeft}
                whileHover={{ x: 8, transition: { duration: 0.2 } }}
                onClick={() => setActiveFeature(idx)}
                className={`p-4 rounded-xl cursor-pointer transition-all duration-300 ${
                  activeFeature === idx
                    ? "bg-blue-50 border-l-4 border-blue-500 shadow-md"
                    : "hover:bg-gray-50"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-blue-100 flex items-center justify-center">
                    <feature.icon className="w-5 h-5 text-blue-600" />
                  </div>
                  <div className="flex-1">
                    <h4 className="font-semibold text-gray-900">{feature.title}</h4>
                    <p className="text-sm text-gray-600">{feature.description}</p>
                  </div>
                  <span className="text-xl font-bold text-blue-600">{feature.stat}</span>
                </div>
              </motion.div>
            ))}
          </div>
          <motion.div
            key={activeFeature}
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl"
          >
            <img
              src={features[activeFeature].image}
              alt={features[activeFeature].title}
              className="rounded-xl w-full"
            />
            <p className="text-white text-center mt-3 font-semibold">
              {features[activeFeature].title}
            </p>
            <p className="text-gray-400 text-center text-sm">
              {features[activeFeature].statLabel}
            </p>
          </motion.div>
        </div>
      </motion.div>

      {/* Avantages Recruteurs */}
      <motion.div variants={staggerContainer} className="py-8">
        <motion.div variants={fadeInUp} className="text-center mb-10">
          <h3 className="text-2xl font-bold text-gray-900 flex items-center justify-center gap-2">
            <TrophyIcon className="w-6 h-6 text-blue-500" />
            Pourquoi choisir notre solution ?
          </h3>
          <p className="text-gray-500">Des bénéfices concrets pour une efficacité maximale</p>
        </motion.div>
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4">
          {benefits.map((benefit, idx) => (
            <motion.div
              key={idx}
              variants={fadeInUp}
              whileHover={{ y: -5, scale: 1.02 }}
              transition={{ duration: 0.2 }}
              className="flex items-center gap-3 p-4 bg-white rounded-xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
            >
              <div className="w-8 h-8 rounded-lg bg-blue-100 flex items-center justify-center">
                <benefit.icon className="w-5 h-5 text-blue-600" />
              </div>
              <span className="text-gray-700 font-medium">{benefit.text}</span>
            </motion.div>
          ))}
        </div>
      </motion.div>

      {/* CTA Final Recruteurs */}
      <motion.div
        variants={scaleSpring}
        whileHover={{ scale: 1.02 }}
        className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-blue-600 to-indigo-600 p-10 text-center shadow-xl"
      >
        <div className="relative">
          <RocketLaunchIcon className="w-12 h-12 text-white mx-auto mb-4" />
          <h3 className="text-2xl font-bold text-white mb-3 flex items-center justify-center gap-2">
            <BuildingOfficeIcon className="w-6 h-6" />
            Prêt à révolutionner votre recrutement ?
          </h3>
          <p className="text-blue-100 mb-6">
            Rejoignez les centaines d'entreprises qui nous font confiance
          </p>
          <Link
            to="/register"
            className="inline-flex items-center gap-2 px-6 py-3 bg-white text-blue-600 rounded-xl font-semibold hover:bg-gray-100 shadow-md transition-all duration-300"
          >
            <RocketLaunchIcon className="w-5 h-5" />
            Commencer
            <ArrowRightIcon className="w-4 h-4" />
          </Link>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ============================================================
// PAGE PRINCIPALE
// ============================================================
export default function Home() {
  const [selectedType, setSelectedType] = useState("candidate");
  const [stats, setStats] = useState({
    totalOffres: 0,
    totalCandidats: 0,
    totalCandidatures: 0,
    totalRecruteurs: 0,
    tauxSatisfaction: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await api.get("/public/stats/");
        setStats({
          totalOffres: response.data.total_offres || 0,
          totalCandidats: response.data.total_candidats || 0,
          totalCandidatures: response.data.total_candidatures || 0,
          totalRecruteurs: response.data.total_recruteurs || 0,
          tauxSatisfaction: response.data.taux_satisfaction || 0,
        });
      } catch (error) {
        console.error("Erreur chargement stats:", error);
      } finally {
        setLoadingStats(false);
      }
    };
    fetchStats();
  }, []);

  return (
    <PublicLayout>
      <PageTransition>
        {/* ── SECTION CITATION SAINT-EXUPÉRY ── */}
        <HeroCitationSection />

        {/* ── HERO IMMERSIF avec sélection intégrée ── */}
        <HeroSection
          selectedType={selectedType}
          setSelectedType={setSelectedType}
        />

        {/* ── CONTENU DYNAMIQUE selon le profil ── */}
        <AnimatePresence mode="wait">
          {selectedType === "candidate" ? (
            <CandidateContent
              key="candidate"
              stats={stats}
              loadingStats={loadingStats}
            />
          ) : (
            <RecruiterContent
              key="recruiter"
              stats={stats}
              loadingStats={loadingStats}
            />
          )}
        </AnimatePresence>

        {/* ── FOOTER ── */}
        <HomeFooter />
      </PageTransition>
    </PublicLayout>
  );
}
