// frontend/src/page/public/SolutionRecruteurs.jsx
// ═══════════════════════════════════════════════════════════════
// ✅ VERSION COMPLÈTE AVEC STATISTIQUES RÉELLES
// ✅ UTILISE L'ENDPOINT PUBLIC /api/public/stats/
// ═══════════════════════════════════════════════════════════════

import { Link } from "react-router-dom";
import { motion, useScroll, useTransform, useSpring } from "framer-motion";
import { useRef, useState, useEffect } from "react";
import PublicLayout from "../../components/layout/PublicLayout";
import PageTransition from "../../components/common/PageTransition";
import HomeFooter from "./home/HomeFooter";
import api from "../../services/api";

// Import des images
import rhImage from "../../assets/image/rh.png";
import rh1Image from "../../assets/image/rh1.png";
import rh2Image from "../../assets/image/rh2.png";
import rh3Image from "../../assets/image/rh3.png";

// Heroicons
import {
  BriefcaseIcon,
  UserGroupIcon,
  CalendarIcon,
  ChartBarIcon,
  ClockIcon,
  CheckCircleIcon,
  SparklesIcon,
  ArrowRightIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  DocumentTextIcon,
  EnvelopeIcon,
  StarIcon,
  UsersIcon,
  MagnifyingGlassIcon,
  HeartIcon,
  BuildingOfficeIcon,
  MegaphoneIcon,
  ChartPieIcon,
} from "@heroicons/react/24/outline";

const scaleOnHover = {
  whileHover: { scale: 1.03, transition: { duration: 0.2 } },
  whileTap: { scale: 0.98 }
};

export default function SolutionRecruteurs() {
  const heroRef = useRef(null);
  const [activeFeature, setActiveFeature] = useState(0);
  const [stats, setStats] = useState({
    totalOffres: 0,
    totalCandidats: 0,
    totalCandidatures: 0,
    totalRecruteurs: 0,
    tauxSatisfaction: 0,
  });
  const [loadingStats, setLoadingStats] = useState(true);
  
  const { scrollYProgress } = useScroll({
    target: heroRef,
    offset: ["start start", "end start"],
  });
  
  const heroOpacity = useTransform(scrollYProgress, [0, 0.5], [1, 0]);
  const heroScale = useSpring(useTransform(scrollYProgress, [0, 0.5], [1, 0.95]), {
    stiffness: 100,
    damping: 30,
  });

  // Chargement des statistiques réelles depuis l'API publique
  useEffect(() => {
    const fetchRealStats = async () => {
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
    
    fetchRealStats();
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveFeature((prev) => (prev + 1) % features.length);
    }, 6000);
    return () => clearInterval(interval);
  }, []);

  const formatNumber = (num) => {
    if (num === 0) return "0";
    return num.toLocaleString();
  };

  const statsData = [
    { 
      value: loadingStats ? "..." : `${formatNumber(stats.totalOffres)}+`, 
      label: "Offres actives", 
      trend: "en temps réel", 
      icon: BriefcaseIcon, 
      color: "emerald" 
    },
    { 
      value: loadingStats ? "..." : `${formatNumber(stats.totalRecruteurs)}+`, 
      label: "Recruteurs inscrits", 
      trend: "en temps réel", 
      icon: UsersIcon, 
      color: "blue" 
    },
    { 
      value: loadingStats ? "..." : `${formatNumber(stats.totalCandidatures)}+`, 
      label: "Candidatures", 
      trend: "en temps réel", 
      icon: DocumentTextIcon, 
      color: "amber" 
    },
    { 
      value: loadingStats ? "..." : `${stats.tauxSatisfaction}%`, 
      label: "Satisfaction", 
      trend: "en temps réel", 
      icon: StarIcon, 
      color: "purple" 
    },
  ];

  const features = [
    {
      title: "Publication d'offres",
      description: "Créez des offres attractives en quelques minutes avec notre éditeur intelligent.",
      longDescription: "Générez des descriptions optimisées par IA, ajoutez des questions de screening, et diffusez automatiquement sur plusieurs canaux.",
      stat: "+45%",
      statLabel: "de candidatures qualifiées",
      icon: MegaphoneIcon,
      image: rh2Image,
      benefits: ["Templates personnalisables", "Diffusion multi-canaux", "Screening automatique"],
    },
    {
      title: "Gestion des candidatures",
      description: "Pipeline visuel type Kanban pour suivre chaque candidat efficacement.",
      longDescription: "Visualisez l'avancement, glissez-déposez entre les étapes, et ne perdez jamais une candidature.",
      stat: "-60%",
      statLabel: "de temps de traitement",
      icon: UserGroupIcon,
      image: rh1Image,
      benefits: ["Pipelines personnalisables", "Tags et filtres avancés", "Collaboration en équipe"],
    },
    {
      title: "Planification d'entretiens",
      description: "Calendrier synchronisé avec les agendas des candidats.",
      longDescription: "Les candidats choisissent directement leur créneau. Intégration avec Google Calendar, Outlook, Zoom.",
      stat: "3x",
      statLabel: "plus rapide",
      icon: CalendarIcon,
      image: rhImage,
      benefits: ["Liens visio automatiques", "Rappels email/SMS", "Synchronisation calendrier"],
    },
    {
      title: "Statistiques avancées",
      description: "Dashboards interactifs avec indicateurs en temps réel.",
      longDescription: "Suivez vos KPIs, analysez les sources de recrutement, et optimisez votre stratégie.",
      stat: "100%",
      statLabel: "de visibilité",
      icon: ChartPieIcon,
      image: rh3Image,
      benefits: ["Rapports personnalisables", "Export PDF/Excel", "Alertes personnalisées"],
    },
  ];

  const benefits = [
    "Jusqu'à 60% de temps gagné sur le processus de recrutement",
    "98% de taux de satisfaction des recruteurs",
    "Collaboration en équipe avec historique complet",
    "Certification ISO 27001 et conformité RGPD",
    "Tableaux de bord en temps réel",
    "IA intégrée pour le screening automatique",
  ];

  const targetAudience = [
    "Responsables RH",
    "Talent Acquisition Managers",
    "Recruteurs indépendants",
    "Agences de recrutement",
    "PME et grandes entreprises",
  ];

  const securityPoints = [
    "Certification ISO 27001",
    "Conformité RGPD",
    "Hébergement sécurisé",
    "Sauvegardes quotidiennes",
  ];

  return (
    <PublicLayout>
      <PageTransition>
        {/* ============================================================
            SECTION HERO
        ============================================================ */}
        <section ref={heroRef} className="relative min-h-screen overflow-hidden">
          <div className="absolute inset-0">
            <div className="absolute inset-0 bg-gradient-to-br from-slate-950 via-slate-900 to-emerald-950" />
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top_right,_var(--tw-gradient-stops))] from-emerald-500/10 via-transparent to-transparent" />
            <div className="absolute top-1/3 left-1/4 w-[500px] h-[500px] bg-emerald-500/15 rounded-full blur-[100px]" />
            <div className="absolute bottom-1/3 right-1/4 w-[400px] h-[400px] bg-blue-500/10 rounded-full blur-[100px]" />
          </div>

          <motion.div style={{ opacity: heroOpacity, scale: heroScale }}>
            <div className="relative min-h-screen flex items-center">
              <div className="max-w-6xl mx-auto px-6 lg:px-8 py-24 lg:py-32 w-full">
                <div className="grid lg:grid-cols-2 gap-12 lg:gap-20 items-center">
                  {/* Colonne gauche */}
                  <motion.div
                    initial={{ opacity: 0, x: -40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8 }}
                  >
                    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-emerald-500/20 border border-emerald-500/30 mb-6">
                      <SparklesIcon className="w-4 h-4 text-emerald-400" />
                      <span className="text-sm font-medium text-emerald-300 tracking-wide">
                        SOLUTION PROFESSIONNELLE
                      </span>
                    </div>

                    <h1 className="text-5xl lg:text-6xl xl:text-7xl font-bold text-white mb-6 leading-tight tracking-tight">
                      Solution{" "}
                      <span className="bg-gradient-to-r from-emerald-400 via-teal-400 to-cyan-400 bg-clip-text text-transparent">
                        Recruteurs
                      </span>
                    </h1>

                    <p className="text-lg text-gray-300 max-w-xl leading-relaxed mb-8">
                      La plateforme nouvelle génération qui transforme votre façon de recruter.
                    </p>
                    <p className="text-emerald-400 font-medium text-lg mb-10">
                      Plus rapide, plus intelligent, plus efficace.
                    </p>

                    <div className="flex flex-wrap gap-4 mb-10">
                      <Link
                        to="/register"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-emerald-500 to-emerald-600 text-white rounded-xl hover:from-emerald-600 hover:to-emerald-700 transition-all duration-300 font-semibold shadow-lg"
                      >
                        Commencer
                        <ArrowRightIcon className="w-5 h-5" />
                      </Link>
                      <Link
                        to="/contact"
                        className="inline-flex items-center gap-2 px-8 py-4 bg-white/10 backdrop-blur border border-white/20 text-white rounded-xl hover:bg-white/20 transition-all duration-300 font-medium"
                      >
                        <EnvelopeIcon className="w-5 h-5" />
                        Demander une démo
                      </Link>
                    </div>

                    <div className="flex flex-wrap gap-x-6 gap-y-3 pt-6 border-t border-white/10">
                      {["ISO 27001 certifié", "RGPD conforme", "SLA 99.9%", "Support 24/7"].map((item, idx) => (
                        <div key={idx} className="flex items-center gap-2">
                          <CheckCircleIcon className="w-4 h-4 text-emerald-400" />
                          <span className="text-sm text-gray-400">{item}</span>
                        </div>
                      ))}
                    </div>
                  </motion.div>

                  {/* Colonne droite - Images */}
                  <motion.div
                    initial={{ opacity: 0, x: 40 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ duration: 0.8, delay: 0.2 }}
                    className="relative"
                  >
                    <div className="relative bg-white/5 backdrop-blur-sm rounded-2xl p-4 border border-white/10">
                      <div className="rounded-xl overflow-hidden mb-4">
                        <img src={rhImage} alt="Dashboard" className="w-full h-auto" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-3">
                        <div className="rounded-lg overflow-hidden">
                          <img src={rh1Image} alt="Analytics" className="w-full h-28 object-cover" />
                        </div>
                        <div className="rounded-lg overflow-hidden">
                          <img src={rh2Image} alt="Statistics" className="w-full h-28 object-cover" />
                        </div>
                      </div>

                      <div className="absolute -top-4 -right-4 bg-gradient-to-r from-emerald-500 to-teal-500 rounded-xl px-4 py-2 shadow-xl">
                        <div className="flex items-center gap-2">
                          <HeartIcon className="w-5 h-5 text-white" />
                          <span className="text-xl font-bold text-white">{loadingStats ? "..." : stats.tauxSatisfaction}%</span>
                        </div>
                        <p className="text-xs text-emerald-100">de satisfaction</p>
                      </div>
                    </div>
                  </motion.div>
                </div>
              </div>
            </div>
          </motion.div>

          <div className="absolute bottom-8 left-1/2 -translate-x-1/2">
            <div className="w-6 h-10 rounded-full border-2 border-white/30 flex justify-center">
              <div className="w-1 h-2 bg-white/50 rounded-full mt-2 animate-bounce" />
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION STATISTIQUES RÉELLES
        ============================================================ */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {statsData.map((stat, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  className="text-center"
                >
                  <div className="w-14 h-14 mx-auto mb-4 rounded-2xl bg-gray-100 flex items-center justify-center">
                    <stat.icon className="w-7 h-7 text-emerald-600" />
                  </div>
                  <p className="text-3xl font-bold text-gray-900">{stat.value}</p>
                  <p className="text-gray-500 text-sm mt-1">{stat.label}</p>
                  <p className="text-xs text-emerald-600 font-medium mt-1">{stat.trend}</p>
                </motion.div>
              ))}
            </div>
            <p className="text-center text-xs text-gray-400 mt-8">
              *Données mises à jour en temps réel depuis notre base
            </p>
          </div>
        </section>

        {/* ============================================================
            SECTION FONCTIONNALITÉS
        ============================================================ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-blue-100 text-blue-700 text-sm font-semibold tracking-wide mb-4">
                FONCTIONNALITÉS
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Tout ce dont vous avez besoin
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Une suite complète d'outils pour optimiser votre recrutement
              </p>
            </motion.div>

            <div className="grid lg:grid-cols-2 gap-10">
              <div className="space-y-4">
                {features.map((feature, idx) => (
                  <motion.div
                    key={idx}
                    initial={{ opacity: 0, x: -20 }}
                    whileInView={{ opacity: 1, x: 0 }}
                    transition={{ delay: idx * 0.1 }}
                    viewport={{ once: true }}
                    onClick={() => setActiveFeature(idx)}
                    className={`cursor-pointer p-5 rounded-xl transition-all duration-300 ${
                      activeFeature === idx
                        ? "bg-white shadow-lg border-l-4 border-emerald-500"
                        : "bg-white hover:shadow-md"
                    }`}
                  >
                    <div className="flex items-start gap-4">
                      <div className="w-11 h-11 rounded-xl bg-emerald-100 flex items-center justify-center shrink-0">
                        <feature.icon className="w-5 h-5 text-emerald-600" />
                      </div>
                      <div className="flex-1">
                        <div className="flex justify-between items-center mb-1">
                          <h3 className="font-bold text-gray-900">{feature.title}</h3>
                          <p className="text-xl font-bold text-emerald-600">{feature.stat}</p>
                        </div>
                        <p className="text-sm text-gray-600">{feature.description}</p>
                        {activeFeature === idx && (
                          <motion.div
                            initial={{ opacity: 0, height: 0 }}
                            animate={{ opacity: 1, height: "auto" }}
                            className="mt-3 pt-3 border-t border-gray-100"
                          >
                            <p className="text-xs text-gray-500 mb-2">{feature.longDescription}</p>
                            <div className="flex flex-wrap gap-1.5">
                              {feature.benefits.map((benefit, i) => (
                                <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-full">
                                  {benefit}
                                </span>
                              ))}
                            </div>
                          </motion.div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </div>

              <motion.div
                key={activeFeature}
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.4 }}
                className="relative"
              >
                <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 shadow-xl">
                  <div className="absolute -inset-3 bg-gradient-to-r from-emerald-500/20 to-teal-500/20 rounded-2xl blur-xl" />
                  <img
                    src={features[activeFeature].image}
                    alt={features[activeFeature].title}
                    className="relative rounded-xl shadow-lg w-full"
                  />
                  <div className="mt-4 text-center">
                    <p className="text-white font-semibold">{features[activeFeature].title}</p>
                    <p className="text-gray-400 text-sm">{features[activeFeature].statLabel}</p>
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION AVANTAGES
        ============================================================ */}
        <section className="py-20 bg-white">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              className="text-center mb-12"
            >
              <span className="inline-block px-4 py-2 rounded-full bg-emerald-100 text-emerald-700 text-sm font-semibold tracking-wide mb-4">
                AVANTAGES EXCLUSIFS
              </span>
              <h2 className="text-3xl md:text-4xl font-bold text-gray-900 mb-4">
                Pourquoi choisir notre solution ?
              </h2>
              <p className="text-lg text-gray-500 max-w-2xl mx-auto">
                Des bénéfices concrets pour une efficacité maximale
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-5">
              {benefits.map((benefit, idx) => (
                <motion.div
                  key={idx}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ delay: idx * 0.1 }}
                  viewport={{ once: true }}
                  whileHover={{ y: -4 }}
                  className="bg-white border border-gray-100 rounded-xl p-5 shadow-sm hover:shadow-md transition-all"
                >
                  <div className="flex items-start gap-3">
                    <CheckCircleIcon className="w-5 h-5 text-emerald-500 shrink-0 mt-0.5" />
                    <p className="text-gray-700 leading-relaxed">{benefit}</p>
                  </div>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* ============================================================
            SECTION PUBLIC CIBLE & SÉCURITÉ
        ============================================================ */}
        <section className="py-20 bg-gray-50">
          <div className="max-w-6xl mx-auto px-6 lg:px-8">
            <div className="grid md:grid-cols-2 gap-8">
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <UsersIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Public cible</h3>
                    <p className="text-xs text-gray-500">Pour qui est cette solution ?</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {targetAudience.map((audience, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-gray-700 text-sm">{audience}</span>
                    </div>
                  ))}
                </div>
              </motion.div>

              <motion.div
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: 0.1 }}
                className="bg-white rounded-xl p-6 shadow-sm"
              >
                <div className="flex items-center gap-3 mb-5">
                  <div className="w-10 h-10 bg-emerald-100 rounded-xl flex items-center justify-center">
                    <ShieldCheckIcon className="w-5 h-5 text-emerald-600" />
                  </div>
                  <div>
                    <h3 className="font-bold text-gray-900">Sécurité & conformité</h3>
                    <p className="text-xs text-gray-500">Vos données sont protégées</p>
                  </div>
                </div>
                <div className="space-y-2">
                  {securityPoints.map((point, idx) => (
                    <div key={idx} className="flex items-center gap-2 p-2 rounded-lg hover:bg-gray-50 transition">
                      <CheckCircleIcon className="w-4 h-4 text-emerald-500" />
                      <span className="text-gray-700 text-sm">{point}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            </div>
          </div>
        </section>

        {/* ============================================================
            CTA FINALE
        ============================================================ */}
        <section className="py-20 bg-white">
          <div className="max-w-4xl mx-auto px-6 lg:px-8">
            <motion.div
              initial={{ opacity: 0, scale: 0.98 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-600 to-teal-600 p-12 text-center shadow-xl"
            >
              <div 
                className="absolute inset-0 opacity-5"
                style={{
                  backgroundImage: `url('data:image/svg+xml,%3Csvg width="60" height="60" viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg"%3E%3Cg fill="none" fill-rule="evenodd"%3E%3Cg fill="%23ffffff" fill-opacity="0.1"%3E%3Cpath d="M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z"/%3E%3C/g%3E%3C/g%3E%3C/svg%3E')`,
                  backgroundSize: "60px 60px",
                  backgroundRepeat: "repeat"
                }}
              />
              
              <div className="relative">
                <div className="w-16 h-16 bg-white/20 rounded-xl flex items-center justify-center mx-auto mb-5">
                  <RocketLaunchIcon className="w-8 h-8 text-white" />
                </div>
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-3">
                  Prêt à révolutionner votre recrutement ?
                </h2>
                <p className="text-emerald-100 mb-8 max-w-md mx-auto">
                  Rejoignez les centaines d'entreprises qui nous font déjà confiance
                </p>
                <div className="flex flex-wrap gap-4 justify-center">
                  <Link
                    to="/register"
                    className="inline-flex items-center gap-2 px-6 py-3 bg-white text-emerald-700 rounded-xl hover:bg-gray-100 transition-all font-semibold shadow-md"
                  >
                    Commencer
                    <ArrowRightIcon className="w-4 h-4" />
                  </Link>
                  <Link
                    to="/contact"
                    className="inline-flex items-center gap-2 px-6 py-3 border-2 border-white/30 text-white rounded-xl hover:bg-white/10 transition-all font-medium"
                  >
                    <EnvelopeIcon className="w-4 h-4" />
                    Contacter le support
                  </Link>
                </div>
              </div>
            </motion.div>
          </div>
        </section>

        <HomeFooter />
      </PageTransition>
    </PublicLayout>
  );
}