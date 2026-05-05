// frontend/src/page/recruiter/RecruiterDashboardUtils.js

// ==================== CONSTANTES ====================
export const STATUS_CONFIG = {
  pending:  { label: "En attente",      bg: "bg-yellow-100", text: "text-yellow-700", border: "border-yellow-200", icon: "⏳" },
  reviewed: { label: "Examinée",        bg: "bg-blue-100",   text: "text-blue-700",   border: "border-blue-200",   icon: "📋" },
  interview:{ label: "Test en attente", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: "🤝" },
  accepted: { label: "Acceptée",        bg: "bg-green-100",  text: "text-green-700",  border: "border-green-200",  icon: "✅" },
  rejected: { label: "Refusée",         bg: "bg-red-100",    text: "text-red-700",    border: "border-red-200",    icon: "❌" },
  interview_scheduled: { label: "Entretien programmé", bg: "bg-purple-100", text: "text-purple-700", border: "border-purple-200", icon: "📅" },
};

export const EDUCATION_LABELS = {
  "bac":   "Baccalauréat",
  "bac+2": "Bac+2 (BTS/DUT)",
  "bac+3": "Bac+3 (Licence)",
  "bac+5": "Bac+5 (Master/Ingénieur)",
  "bac+8": "Bac+8 (Doctorat)",
};

export const EXPERIENCE_LABELS = {
  "0-1":  "< 1 an",
  "1-3":  "1 – 3 ans",
  "3-5":  "3 – 5 ans",
  "5-10": "5 – 10 ans",
  "10+":  "+ 10 ans",
};

export const BASE_URL = "http://127.0.0.1:8000";
export const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY;

// ==================== HELPERS ====================
export function getScoreColor(score) {
  if (score >= 80) return { bar: "bg-emerald-500", text: "text-emerald-700", bg: "bg-emerald-50", border: "border-emerald-200", label: "Excellent" };
  if (score >= 60) return { bar: "bg-blue-500",    text: "text-blue-700",    bg: "bg-blue-50",    border: "border-blue-200",    label: "Bon" };
  if (score >= 40) return { bar: "bg-amber-500",   text: "text-amber-700",   bg: "bg-amber-50",   border: "border-amber-200",   label: "Moyen" };
  return { bar: "bg-red-400", text: "text-red-700", bg: "bg-red-50", border: "border-red-200", label: "Faible" };
}

// ==================== FONCTION CORRIGÉE ====================
// ✅ Corrigée pour afficher le score IA global même sans QCM
export function getTestPercentage(result) {
  if (!result) return null;
  
  // 1. D'abord, essayer de prendre le score IA global (total_score_ia)
  if (result.total_score_ia !== undefined && result.total_score_ia !== null) {
    return result.total_score_ia;
  }
  
  // 2. Sinon, essayer de prendre le score IA depuis ai_analysis
  if (result.ai_analysis && result.ai_analysis.total_score !== undefined) {
    return result.ai_analysis.total_score;
  }
  
  // 3. Sinon, calculer à partir des QCM (ancienne méthode)
  const qcmCount = result.qcm_count ?? result.total ?? 0;
  const score = result.score ?? 0;
  
  if (qcmCount === 0) {
    // 🔥 NOUVEAU : Si pas de QCM mais qu'il y a des réponses, donner un score par défaut
    // On vérifie si le candidat a répondu à des questions ouvertes ou code
    const hasAnswers = result.answers && result.answers.length > 0;
    if (hasAnswers) {
      return 0; // Score 0% en attendant analyse IA (ou affichage "En cours")
    }
    return null;
  }
  
  return Math.round((score / qcmCount) * 100);
}

// ==================== FONCTIONS POUR NOTIFICATIONS ====================
export function isSameDay(dateA, dateB) {
  return (
    dateA.getFullYear() === dateB.getFullYear() &&
    dateA.getMonth() === dateB.getMonth() &&
    dateA.getDate() === dateB.getDate()
  );
}

export function getNotificationGroupLabel(dateValue) {
  const date = new Date(dateValue);
  const now = new Date();
  const yesterday = new Date(now);
  yesterday.setDate(now.getDate() - 1);
  const weekAgo = new Date(now);
  weekAgo.setDate(now.getDate() - 7);

  if (isSameDay(date, now)) return "Aujourd'hui";
  if (isSameDay(date, yesterday)) return "Hier";
  if (date >= weekAgo) return "Cette semaine";
  return "Plus ancien";
}

export function getRelativeNotificationTime(dateValue) {
  const date = new Date(dateValue);
  const now = new Date();
  const diffMs = Math.max(0, now - date);
  const diffMin = Math.floor(diffMs / (1000 * 60));
  const diffH = Math.floor(diffMs / (1000 * 60 * 60));
  const diffD = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffMin < 1) return "À l'instant";
  if (diffMin < 60) return `Il y a ${diffMin} min`;
  if (diffH < 24) return `Il y a ${diffH} h`;
  if (diffD < 7) return `Il y a ${diffD} j`;
  return date.toLocaleDateString("fr-FR", { day: "2-digit", month: "short" });
}

export function getNotificationTypeStyle(type) {
  switch (type) {
    case "success":
      return {
        iconWrap: "bg-emerald-500/15 text-emerald-300 border border-emerald-400/20",
        badge: "bg-emerald-500/15 text-emerald-100 border border-emerald-400/20",
        dot: "bg-emerald-400",
        accent: "from-emerald-400/30 to-teal-400/10",
      };
    case "warning":
      return {
        iconWrap: "bg-amber-500/15 text-amber-200 border border-amber-400/20",
        badge: "bg-amber-500/15 text-amber-100 border border-amber-400/20",
        dot: "bg-amber-400",
        accent: "from-amber-400/30 to-orange-400/10",
      };
    case "danger":
      return {
        iconWrap: "bg-red-500/15 text-red-200 border border-red-400/20",
        badge: "bg-red-500/15 text-red-100 border border-red-400/20",
        dot: "bg-red-400",
        accent: "from-red-400/30 to-pink-400/10",
      };
    case "info":
    default:
      return {
        iconWrap: "bg-sky-500/15 text-sky-200 border border-sky-400/20",
        badge: "bg-sky-500/15 text-sky-100 border border-sky-400/20",
        dot: "bg-sky-400",
        accent: "from-sky-400/30 to-cyan-400/10",
      };
  }
}

export function groupNotificationsByDate(notifications) {
  return notifications.reduce((acc, notif) => {
    const label = getNotificationGroupLabel(notif.createdAt || notif.date || new Date().toISOString());
    if (!acc[label]) acc[label] = [];
    acc[label].push(notif);
    return acc;
  }, {});
}

// ==================== SERVICE GROQ ====================
export async function computeScore(app) {
  const name     = app.candidate_details?.full_name || "Candidat";
  const skills   = app.candidate_details?.skills    || [];
  const edu      = EDUCATION_LABELS[app.candidate_details?.education]   || app.candidate_details?.education   || "—";
  const exp      = EXPERIENCE_LABELS[app.candidate_details?.experience] || app.candidate_details?.experience  || "—";
  const cvText   = app.candidate_details?.cv_text_short;
  const cvParsed = app.candidate_details?.cv_parsed;

  let candidateInfo = "";
  if (cvText && cvText.length > 100) {
    candidateInfo = `TEXTE DU CV :\n${cvText}`;
  } else if (cvParsed && typeof cvParsed === "object" && !cvParsed.error) {
    candidateInfo = `PROFIL STRUCTURÉ :
Nom : ${name}
Titre : ${cvParsed.title || app.candidate_details?.title || "—"}
Expérience : ${cvParsed.experience || exp}
Formation : ${cvParsed.education || edu}
Compétences : ${(cvParsed.skills || skills).join(", ") || "—"}
Résumé : ${cvParsed.summary || app.candidate_details?.bio || "—"}`;
  } else {
    candidateInfo = `PROFIL :
Nom : ${name}
Titre : ${app.candidate_details?.title || "—"}
Expérience : ${exp} | Études : ${edu}
Compétences : ${skills.join(", ") || "—"}
Bio : ${app.candidate_details?.bio || "—"}`;
  }

  const prompt = `Tu es un expert RH senior. Analyse avec précision la compatibilité entre ce candidat et cette offre d'emploi.

${candidateInfo}

OFFRE :
Poste : ${app.job_details?.title || "—"}
Description : ${app.job_details?.description || "—"}
Compétences requises : ${(app.job_details?.skills_required || []).join(", ") || "—"}
Expérience requise : ${app.job_details?.experience_level || "—"}

Évalue objectivement sur 100 en tenant compte :
- Adéquation des compétences techniques (40%)
- Niveau d'expérience (30%)
- Formation et diplômes (15%)
- Cohérence du profil avec le poste (15%)

Réponds UNIQUEMENT en JSON valide sans markdown :
{"score": <0-100>, "comment": "<1-2 phrases concises et précises sur la compatibilité>"}`;

  const res = await fetch("https://api.groq.com/openai/v1/chat/completions", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "Authorization": `Bearer ${GROQ_API_KEY}`,
    },
    body: JSON.stringify({
      model: "llama-3.3-70b-versatile",
      max_tokens: 200,
      messages: [
        { role: "system", content: "Tu es un expert RH. Réponds UNIQUEMENT en JSON valide, sans markdown, sans texte avant ou après." },
        { role: "user",   content: prompt },
      ],
    }),
  });

  const data    = await res.json();
  const raw     = data.choices?.[0]?.message?.content || "";
  const cleaned = raw.replace(/```json|```/g, "").trim();
  const parsed  = JSON.parse(cleaned);

  return {
    score:   Math.min(100, Math.max(0, Number(parsed.score))),
    comment: parsed.comment || "",
  };
}