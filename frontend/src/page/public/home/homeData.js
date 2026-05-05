import {
  SparklesIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  CalendarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
} from "@heroicons/react/24/outline";

export const ICONS = {
  SparklesIcon,
  UserGroupIcon,
  DocumentCheckIcon,
  CalendarIcon,
  ChartBarIcon,
  ShieldCheckIcon,
  RocketLaunchIcon,
  CpuChipIcon,
  BuildingOfficeIcon,
  CheckBadgeIcon,
  ArrowTrendingUpIcon,
};

export const COLOR = {
  emerald: {
    glow: "group-hover:shadow-emerald-500/20",
    borderHover: "hover:border-emerald-500/30",
    overlay: "from-emerald-400 to-teal-400",
  },
  teal: {
    glow: "group-hover:shadow-teal-500/20",
    borderHover: "hover:border-teal-500/30",
    overlay: "from-teal-400 to-cyan-400",
  },
  blue: {
    glow: "group-hover:shadow-blue-500/20",
    borderHover: "hover:border-blue-500/30",
    overlay: "from-blue-400 to-indigo-400",
  },
  purple: {
    glow: "group-hover:shadow-purple-500/20",
    borderHover: "hover:border-purple-500/30",
    overlay: "from-purple-400 to-pink-400",
  },
  orange: {
    glow: "group-hover:shadow-orange-500/20",
    borderHover: "hover:border-orange-500/30",
    overlay: "from-orange-400 to-red-400",
  },
};

export const TRUST_TAGS = ["RH & Recrutement", "PME / ETI", "Startups", "Grands Groupes"];

export const METRICS = [
  { value: "---", label: "Utilisateurs actifs" },
  { value: "---", label: "Candidatures traitées" },
  { value: "---", label: "Taux de satisfaction" },
  { value: "---", label: "Support prioritaire" },
];

// KPI_TEMPLATE : structure de base, les valeurs seront injectées dynamiquement dans HomeHero
export const KPI_TEMPLATE = [
  { label: "Offres actives",       key: "activeJobs",       trend: "", icon: DocumentCheckIcon },
  { label: "Candidats",            key: "totalCandidates",  trend: "", icon: UserGroupIcon },
  { label: "Entretiens",           key: "interviews",       trend: "", icon: CalendarIcon },
  { label: "Taux de conversion",   key: "conversionRate",   trend: "", icon: ChartBarIcon, percent: true },
];

export const FEATURES = [
  {
    title: "Organisation Intelligente",
    desc: "Centralisez toutes vos offres, candidatures et profils dans un espace unique et structuré.",
    icon: DocumentCheckIcon,
    color: "emerald",
    to: "/organisation-intelligente",
  },
  {
    title: "Décisions Éclairées",
    desc: "Analysez les performances avec des statistiques détaillées et des rapports personnalisés.",
    icon: ChartBarIcon,
    color: "purple",
    to: "/decisions-eclairees",
  },
  {
    title: "Workflow Personnalisé",
    desc: "Adaptez le processus à vos besoins avec des étapes et des statuts configurables.",
    icon: RocketLaunchIcon,
    color: "blue",
    to: "/workflow-personnalise",
  },
  {
    title: "Collaboration Équipe",
    desc: "Travaillez en équipe avec des commentaires, des mentions et un historique complet.",
    icon: UserGroupIcon,
    color: "orange",
    to: "/collaboration-equipe",
  },
  {
    title: "Sécurité Maximale",
    desc: "Vos données sont protégées avec un chiffrement de bout en bout et des accès sécurisés.",
    icon: ShieldCheckIcon,
    color: "emerald",
    to: "/securite-maximale",
  },
  {
    title: "Interface Premium",
    desc: "Une expérience utilisateur fluide et élégante, pensée pour un confort d'utilisation optimal.",
    icon: SparklesIcon,
    color: "purple",
    to: "/interface-premium",
  },
];

export const STEPS = [
  {
    number: "1",
    title: "Créez votre offre",
    desc: "Publiez vos offres d'emploi en quelques minutes avec notre éditeur intuitif.",
    icon: DocumentCheckIcon,
  },
  {
    number: "2",
    title: "Gérez les candidatures",
    desc: "Recevez et organisez automatiquement toutes les candidatures.",
    icon: UserGroupIcon,
  },
  {
    number: "3",
    title: "Prenez la bonne décision",
    desc: "Suivez l'avancement et collaborez avec votre équipe pour choisir les meilleurs talents.",
    icon: ShieldCheckIcon,
  },
];
