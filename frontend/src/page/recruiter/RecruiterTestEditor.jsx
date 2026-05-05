// frontend/src/page/recruiter/RecruiterTestEditor.jsx
import { useState } from "react";
import {
  SparklesIcon,
  PlusCircleIcon,
  TrashIcon,
  ArrowPathIcon,
  ChatBubbleLeftEllipsisIcon,
  EyeIcon,
  PencilIcon,
  DocumentTextIcon,
  ClockIcon,
  BeakerIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/api";

import { TestConfigScreen } from "./RecruiterTestEditorConfig";
import { TestEditorMain } from "./RecruiterTestEditorQuestions";

// ─────────────────────────────────────────────────────────────────────────────
// Clé API Groq
// ─────────────────────────────────────────────────────────────────────────────
const GROQ_API_KEY = import.meta.env.VITE_GROQ_API_KEY || "";

// ─────────────────────────────────────────────────────────────────────────────
// Configuration par défaut du test
// ─────────────────────────────────────────────────────────────────────────────
export const DEFAULT_CONFIG = {
  questionCount: 10,
  questionType: "mixed", // "qcm", "open", "mixed", "code"
  difficulty: "mixed",   // "easy", "medium", "hard", "mixed"
  timePerQuestion: 60,   // valeur par défaut (fallback)
  customTimePerQuestion: true,
  customThemes: "",
  qcmPercentage: 50,     // % de QCM dans le mixte (le reste en ouvert)
  codeLanguage: "python", // "python", "javascript", "sql"
  codeQuestionCount: 3,   // Nombre de questions de code
};

// ─────────────────────────────────────────────────────────────────────────────
// 🧠 Cache anti-répétition — mémorise les questions déjà générées (session)
// ─────────────────────────────────────────────────────────────────────────────
const _questionHistory = new Set();

const _normalizeText = (text) =>
  text.toLowerCase().replace(/[^a-z0-9àâéèêëîïôùûüç]/g, " ").replace(/\s+/g, " ").trim().slice(0, 80);

const _isDuplicate = (text) => {
  const key = _normalizeText(text);
  if (_questionHistory.has(key)) return true;
  _questionHistory.add(key);
  return false;
};

// ─────────────────────────────────────────────────────────────────────────────
// 🧠 GÉNÉRATION IA AVEC GROQ — PROMPT INTELLIGENT V3 (temps individuels)
// ─────────────────────────────────────────────────────────────────────────────
export const generateAIQuestionsWithConfig = async (
  offerTitle,
  offerDescription,
  requiredSkills,
  userInstruction,
  config,
  existingQuestions = []
) => {
  const {
    questionCount,
    questionType,
    difficulty,
    timePerQuestion, // fallback
    customThemes,
    qcmPercentage,
    codeLanguage,
    codeQuestionCount,
  } = config;

  if (!GROQ_API_KEY) {
    console.warn("GROQ_API_KEY manquante, utilisation des questions par défaut");
    return generateDefaultQuestionsWithConfig(offerTitle, config);
  }

  // ── Comptages ──────────────────────────────────────────────────────────────
  let qcmCount = 0, openCount = 0, codeCount = 0;
  if (questionType === "qcm") {
    qcmCount = questionCount;
  } else if (questionType === "open") {
    openCount = questionCount;
  } else if (questionType === "code") {
    codeCount = codeQuestionCount;
  } else {
    // MODE MIXTE : le total des questions générées doit être égal à questionCount
    // On déduit d'abord les questions de code (sans dépasser le total)
    codeCount = Math.min(codeQuestionCount, questionCount);
    let remaining = questionCount - codeCount;
    qcmCount = Math.round((remaining * qcmPercentage) / 100);
    openCount = remaining - qcmCount;
  }

  const totalNeeded = qcmCount + openCount + codeCount;

  // ── Bloc difficulté ────────────────────────────────────────────────────────
  const difficultyProfiles = {
    easy: {
      label: "FACILE (débutant, 0-2 ans)",
      rules: [
        "Vocabulaire accessible, pas de jargon avancé.",
        "Teste la compréhension de concepts fondamentaux : variables, boucles, fonctions simples, notions de base du domaine.",
        "Les distracteurs du QCM sont des erreurs classiques de débutant, pas des pièges subtils.",
        "Question de code : algorithme de 5-10 lignes maximum, logique triviale.",
      ],
      codeDifficulty: "simple (somme, max, palindrome, FizzBuzz…)",
    },
    medium: {
      label: "INTERMÉDIAIRE (confirmé, 2-5 ans)",
      rules: [
        "Mise en situation concrète tirée d'un contexte professionnel réaliste.",
        "Teste la résolution de problèmes, les bonnes pratiques et la compréhension des compromis techniques.",
        "Les distracteurs du QCM sont plausibles et exigent une vraie réflexion.",
        "Question de code : logique non triviale, gestion d'edge-cases, complexité algorithmique attendue.",
      ],
      codeDifficulty: "algorithmique (tri, recherche, manipulation de structures…)",
    },
    hard: {
      label: "EXPERT (senior, 5+ ans)",
      rules: [
        "Questions sur l'architecture, l'optimisation, la concurrence, la sécurité ou les cas limites rares.",
        "Chaque question doit nécessiter une expertise avancée pour être répondue correctement.",
        "Les distracteurs du QCM doivent être techniquement crédibles même pour un développeur confirmé.",
        "Question de code : problème complexe, optimisation de complexité, design patterns, edge-cases non évidents.",
        "INTERDIT : questions basiques comme 'Qu'est-ce qu'une variable ?' ou 'Comment déclarer une fonction ?'.",
      ],
      codeDifficulty: "avancée (optimisation O(n log n), concurrence, design pattern, cache…)",
    },
    mixed: {
      label: "MIXTE",
      rules: [
        `Génère exactement : ${Math.round(totalNeeded * 0.3)} questions FACILES, ${Math.round(totalNeeded * 0.4)} questions MOYENNES, ${Math.ceil(totalNeeded * 0.3)} questions DIFFICILES.`,
        "Trie-les du plus facile au plus difficile dans le JSON.",
      ],
      codeDifficulty: "varié selon le niveau assigné à chaque question",
    },
  };

  const diff = difficultyProfiles[difficulty] || difficultyProfiles.medium;

  // ── Bloc anti-répétition ────────────────────────────────────────────────────
  const alreadyUsed = existingQuestions
    .filter(q => q.text)
    .map(q => `- "${q.text.slice(0, 100)}"`)
    .join("\n");

  const antiRepeatBlock = alreadyUsed
    ? `\nQUESTIONS DÉJÀ POSÉES (à NE PAS répéter, ni reformuler) :\n${alreadyUsed}\n`
    : "";

  // ── Bloc thèmes ─────────────────────────────────────────────────────────────
  const themesBlock = customThemes.trim()
    ? `THÈMES OBLIGATOIRES À COUVRIR : ${customThemes}\nChaque thème doit apparaître dans au moins une question.`
    : "";

  // ── Bloc instruction recruteur ───────────────────────────────────────────────
  const recruiterBlock = userInstruction.trim()
    ? `INSTRUCTION DU RECRUTEUR (priorité haute) : ${userInstruction}`
    : "";

  // ── Bloc couverture des compétences ─────────────────────────────────────────
  const skillsArray = Array.isArray(requiredSkills)
    ? requiredSkills
    : (requiredSkills || "").split(",").map(s => s.trim()).filter(Boolean);

  const coverageBlock = skillsArray.length > 0
    ? `COMPÉTENCES À ÉVALUER (couvre-les toutes, sans répéter la même dans deux questions) :\n${skillsArray.map((s, i) => `${i + 1}. ${s}`).join("\n")}`
    : "";

  // ── Construction des instructions par type ──────────────────────────────────
  const typeInstructions = [];
  if (qcmCount > 0) {
    typeInstructions.push(`QCM (${qcmCount} questions) :
  • Exactement 4 options (A, B, C, D). Une seule est correcte.
  • Les 3 distracteurs doivent être plausibles (pas "Option A" générique).
  • correctIndex = index de la bonne réponse (0 à 3).
  • Varier les formats : complétion de code, identification d'erreur, choix d'architecture, définition, comparaison…
  • Temps estimé : selon la difficulté (30s facile, 60-90s moyen, 120-180s difficile).`);
  }
  if (openCount > 0) {
    typeInstructions.push(`Questions ouvertes (${openCount} questions) :
  • Formulation qui invite à développer : "Comment", "Décrivez", "Comparez", "Proposez une solution pour…"
  • Évite les questions à réponse unique de type oui/non.
  • Chaque question doit permettre d'évaluer un niveau d'expertise distinct.
  • Temps estimé : 60s (facile), 90-120s (moyen), 180-300s (difficile).`);
  }
  if (codeCount > 0) {
    typeInstructions.push(`Questions de code (${codeCount} questions en ${codeLanguage.toUpperCase()}) :
  • initial_code : code fonctionnel avec zones "# TODO:" ou "___" clairement marquées.
  • expected_completion : solution complète et optimale.
  • test_cases : 2 à 4 cas couvrant cas nominal + edge-cases (liste vide, 0, négatifs, doublons…).
  • hint : indice concis qui oriente sans donner la solution.
  • Temps estimé : 180s (facile), 300s (moyen), 450-600s (difficile).
  • Difficulté du code : ${diff.codeDifficulty}.`);
  }

  // ── Prompt final ─────────────────────────────────────────────────────────────
  const systemPrompt = `Tu es un expert senior en recrutement technique avec 15 ans d'expérience.
Tu génères des évaluations de haute qualité, variées, pertinentes et sans répétition.
Réponds UNIQUEMENT en JSON valide, sans markdown ni commentaire.`;

  const userPrompt = `POSTE : ${offerTitle}
DESCRIPTION : ${offerDescription || "Non fournie"}
${coverageBlock}
${themesBlock}
${recruiterBlock}
${antiRepeatBlock}

═══ NIVEAU DE DIFFICULTÉ : ${diff.label} ═══
Règles de difficulté à respecter ABSOLUMENT :
${diff.rules.map((r, i) => `${i + 1}. ${r}`).join("\n")}

═══ TYPES DE QUESTIONS À GÉNÉRER ═══
${typeInstructions.join("\n\n")}

═══ RÈGLES ANTI-RÉPÉTITION ═══
1. Chaque question doit évaluer une compétence ou une facette DIFFÉRENTE.
2. Aucune question ne doit commencer par la même phrase ou tester exactement la même connaissance.
3. Alterne les formats de questions (identification d'erreur, cas pratique, théorie, débogage, conception…).
4. Si plusieurs questions portent sur le même outil (ex: React), aborde des aspects différents.

═══ FORMAT DE RÉPONSE JSON EXACT ═══
{
  "qcm": [
    {
      "text": "...",
      "options": ["...", "...", "...", "..."],
      "correctIndex": 0,
      "estimatedTime": <nombre entier de secondes adapté à la difficulté (30-180)>,
      "difficulty": "${difficulty === "mixed" ? "easy|medium|hard" : difficulty}"
    }
  ],
  "open": [
    {
      "text": "...",
      "estimatedTime": <nombre entier de secondes adapté à la difficulté (60-300)>,
      "difficulty": "${difficulty === "mixed" ? "easy|medium|hard" : difficulty}"
    }
  ],
  "code": [
    {
      "text": "...",
      "initial_code": "...",
      "expected_completion": "...",
      "language": "${codeLanguage}",
      "test_cases": [{"input": "...", "expected": "..."}],
      "hint": "...",
      "estimatedTime": <nombre entier de secondes adapté à la difficulté (180-600)>,
      "difficulty": "${difficulty === "mixed" ? "easy|medium|hard" : difficulty}",
      "is_code_question": true
    }
  ]
}

Génère EXACTEMENT : ${qcmCount} QCM, ${openCount} questions ouvertes, ${codeCount} questions de code.
Les tableaux vides ([]) sont autorisés si le count est 0.`;

  try {
    console.log(`📡 Génération — niveau: ${difficulty}, type: ${questionType}, total: ${totalNeeded}`);

    const response = await fetch("https://api.groq.com/openai/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Authorization": `Bearer ${GROQ_API_KEY}`,
      },
      body: JSON.stringify({
        model: "llama-3.3-70b-versatile",
        temperature: 0.85,
        max_tokens: 6000,
        messages: [
          { role: "system", content: systemPrompt },
          { role: "user",   content: userPrompt   },
        ],
      }),
    });

    if (!response.ok) throw new Error(`Erreur API Groq: ${response.status}`);

    const data = await response.json();
    let raw = data.choices?.[0]?.message?.content || "";

    raw = raw.replace(/```json/gi, "").replace(/```/g, "").trim();
    const start = raw.indexOf("{");
    const end   = raw.lastIndexOf("}");
    if (start !== -1 && end !== -1) raw = raw.slice(start, end + 1);

    const generated = JSON.parse(raw);
    const allQuestions = [];

    (generated.qcm || []).forEach((q, idx) => {
      if (!q.text || _isDuplicate(q.text)) return;
      allQuestions.push({
        id: Date.now() + idx * 3 + Math.random() * 500,
        text: q.text,
        options: Array.isArray(q.options) && q.options.length === 4
          ? q.options
          : ["Option A", "Option B", "Option C", "Option D"],
        correctIndex: typeof q.correctIndex === "number" ? q.correctIndex : 0,
        isOpenEnded: false,
        is_code_question: false,
        estimatedTime: typeof q.estimatedTime === "number" ? q.estimatedTime : timePerQuestion,
        difficulty: q.difficulty || difficulty,
      });
    });

    (generated.open || []).forEach((q, idx) => {
      if (!q.text || _isDuplicate(q.text)) return;
      allQuestions.push({
        id: Date.now() + idx * 3 + Math.random() * 500 + 10000,
        text: q.text,
        options: ["Réponse libre"],
        correctIndex: 0,
        isOpenEnded: true,
        is_code_question: false,
        estimatedTime: typeof q.estimatedTime === "number" ? q.estimatedTime : timePerQuestion,
        difficulty: q.difficulty || difficulty,
      });
    });

    (generated.code || []).forEach((q, idx) => {
      if (!q.text || _isDuplicate(q.text)) return;
      allQuestions.push({
        id: Date.now() + idx * 3 + Math.random() * 500 + 20000,
        text: q.text,
        options: [],
        correctIndex: 0,
        isOpenEnded: false,
        is_code_question: true,
        language: q.language || codeLanguage,
        initial_code: q.initial_code || "",
        expected_completion: q.expected_completion || "",
        test_cases: Array.isArray(q.test_cases) ? q.test_cases : [],
        hint: q.hint || "",
        estimatedTime: typeof q.estimatedTime === "number" ? q.estimatedTime : (q.estimatedTime || 300),
        difficulty: q.difficulty || difficulty,
      });
    });

    const targetCount = questionType === "code" ? codeQuestionCount : questionCount;
    while (allQuestions.length < targetCount) {
      allQuestions.push(createDefaultQuestion(offerTitle, allQuestions.length + 1, config));
    }

    return allQuestions.slice(0, targetCount);
  } catch (error) {
    console.error("Erreur génération IA:", error);
    return generateDefaultQuestionsWithConfig(offerTitle, config);
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Question par défaut (fallback)
// ─────────────────────────────────────────────────────────────────────────────
const createDefaultQuestion = (offerTitle, index, config) => {
  const { questionType, qcmPercentage, codeLanguage, timePerQuestion } = config;
  
  if (questionType === "code") {
    const defaultCodeQuestions = {
      python: {
        text: `Écrivez une fonction qui prend une liste de nombres et retourne la somme des nombres pairs.`,
        initial_code: `def solution(arr):\n    # TODO: Implémenter la fonction\n    pass`,
        expected_completion: `def solution(arr):\n    return sum(x for x in arr if x % 2 == 0)`,
        test_cases: [
          {"input": [1, 2, 3, 4, 5], "expected": 6},
          {"input": [2, 4, 6], "expected": 12},
          {"input": [], "expected": 0}
        ],
        hint: "Utilisez la compréhension de liste avec une condition modulo 2"
      },
      javascript: {
        text: `Write a function that takes an array of numbers and returns the sum of even numbers.`,
        initial_code: `function solution(arr) {\n    // TODO: Implement the function\n    return null;\n}`,
        expected_completion: `function solution(arr) {\n    return arr.filter(x => x % 2 === 0).reduce((a, b) => a + b, 0);\n}`,
        test_cases: [
          {"input": [1, 2, 3, 4, 5], "expected": 6},
          {"input": [2, 4, 6], "expected": 12},
          {"input": [], "expected": 0}
        ],
        hint: "Use filter and reduce methods"
      },
      sql: {
        text: `Écrivez une requête SQL qui sélectionne tous les employés dont le salaire est supérieur à 3000.`,
        initial_code: `-- TODO: Écrire la requête SQL\nSELECT * FROM employees`,
        expected_completion: `SELECT * FROM employees WHERE salary > 3000;`,
        test_cases: [],
        hint: "Utilisez la clause WHERE"
      }
    };
    
    const defaultCode = defaultCodeQuestions[codeLanguage] || defaultCodeQuestions.python;
    
    return {
      id: Date.now() + index + Math.random() * 1000 + 20000,
      text: defaultCode.text,
      options: [],
      correctIndex: 0,
      isOpenEnded: false,
      is_code_question: true,
      language: codeLanguage,
      initial_code: defaultCode.initial_code,
      expected_completion: defaultCode.expected_completion,
      test_cases: defaultCode.test_cases,
      hint: defaultCode.hint,
      estimatedTime: timePerQuestion,
      difficulty: "medium",
    };
  }
  
  const isQCM = questionType === "qcm" || (questionType === "mixed" && index <= qcmPercentage / 10);
  
  if (isQCM) {
    return {
      id: Date.now() + index + Math.random() * 1000,
      text: `Question ${index} : Quelle est la compétence la plus importante pour un(e) ${offerTitle || "professionnel"} ?`,
      options: ["Compétences techniques", "Capacité d'adaptation", "Travail en équipe", "Résolution de problèmes"],
      correctIndex: 0,
      isOpenEnded: false,
      is_code_question: false,
      estimatedTime: timePerQuestion,
      difficulty: "medium",
    };
  } else {
    return {
      id: Date.now() + index + Math.random() * 1000,
      text: `Question ${index} : Décrivez votre expérience et votre approche pour réussir dans le poste de ${offerTitle || "ce métier"}.`,
      options: ["Réponse libre"],
      correctIndex: 0,
      isOpenEnded: true,
      is_code_question: false,
      estimatedTime: timePerQuestion,
      difficulty: "medium",
    };
  }
};

// ─────────────────────────────────────────────────────────────────────────────
// Fallback complet
// ─────────────────────────────────────────────────────────────────────────────
export const generateDefaultQuestionsWithConfig = (offerTitle, config) => {
  const { questionCount, questionType, qcmPercentage, timePerQuestion, codeLanguage, codeQuestionCount } = config;
  const questions = [];

  let qcmTarget = 0;
  let openTarget = 0;
  let codeTarget = 0;

  if (questionType === "qcm") {
    qcmTarget = questionCount;
  } else if (questionType === "open") {
    openTarget = questionCount;
  } else if (questionType === "code") {
    codeTarget = codeQuestionCount;
  } else {
    // Mode mixte : respecter le nombre total questionCount
    codeTarget = Math.min(codeQuestionCount, questionCount);
    let remaining = questionCount - codeTarget;
    qcmTarget = Math.round((remaining * qcmPercentage) / 100);
    openTarget = remaining - qcmTarget;
  }

  const defaultQCM = [
    `Parmi ces qualités, laquelle est la plus importante pour réussir dans le poste de ${offerTitle || "ce métier"} ?`,
    "Face à un projet complexe avec une deadline serrée, quelle est votre première action ?",
    "Comment gérez-vous un désaccord avec un collègue sur une décision importante ?",
    "Quelle méthode utilisez-vous pour rester à jour sur les évolutions de votre domaine ?",
    `Quelle est, selon vous, la compétence la plus critique pour un(e) ${offerTitle || "professionnel"} ?`,
  ];

  const defaultOptions = [
    ["Rigueur et organisation", "Créativité et innovation", "Autonomie et initiative", "Empathie et écoute"],
    ["Analyser les tâches et prioriser", "Demander plus de temps", "Travailler plus d'heures", "Déléguer à un collègue"],
    ["Discussion constructive basée sur des faits", "J'accepte son point de vue", "Je m'impose fermement", "Je fais appel à un supérieur"],
    ["Formations en ligne et veille technologique", "Je n'ai pas de méthode spécifique", "Uniquement la formation interne", "Je ne me forme pas"],
    ["Compétences techniques du métier", "Capacité à apprendre rapidement", "Communication et collaboration", "Gestion du stress"],
  ];

  const defaultOpen = [
    `Décrivez votre parcours et comment il vous a préparé pour le poste de ${offerTitle}.`,
    `Quelles sont, selon vous, les 3 qualités les plus importantes pour réussir dans ce poste ? Justifiez.`,
    `Parlez-nous d'une situation difficile que vous avez surmontée professionnellement et ce que vous en avez appris.`,
    `Où vous voyez-vous dans 3 ans et comment ce poste s'inscrit-il dans votre projet professionnel ?`,
    `Quelle innovation ou tendance dans votre domaine vous passionne le plus actuellement ?`,
  ];

  const defaultCodeQuestions = {
    python: {
      text: `Écrivez une fonction qui prend une liste de nombres et retourne la somme des nombres pairs.`,
      initial_code: `def solution(arr):\n    # TODO: Implémenter la fonction\n    pass`,
      expected_completion: `def solution(arr):\n    return sum(x for x in arr if x % 2 == 0)`,
      test_cases: [
        {"input": [1, 2, 3, 4, 5], "expected": 6},
        {"input": [2, 4, 6], "expected": 12}
      ],
      hint: "Utilisez la compréhension de liste avec une condition modulo 2"
    },
    javascript: {
      text: `Write a function that takes an array of numbers and returns the sum of even numbers.`,
      initial_code: `function solution(arr) {\n    // TODO: Implement the function\n    return null;\n}`,
      expected_completion: `function solution(arr) {\n    return arr.filter(x => x % 2 === 0).reduce((a, b) => a + b, 0);\n}`,
      test_cases: [
        {"input": [1, 2, 3, 4, 5], "expected": 6},
        {"input": [2, 4, 6], "expected": 12}
      ],
      hint: "Use filter and reduce methods"
    },
    sql: {
      text: `Écrivez une requête SQL qui sélectionne tous les employés dont le salaire est supérieur à 3000.`,
      initial_code: `-- TODO: Écrire la requête SQL\nSELECT * FROM employees`,
      expected_completion: `SELECT * FROM employees WHERE salary > 3000;`,
      test_cases: [],
      hint: "Utilisez la clause WHERE"
    }
  };

  for (let i = 0; i < qcmTarget; i++) {
    const idx = i % defaultQCM.length;
    questions.push({
      id: Date.now() + i + Math.random() * 1000,
      text: defaultQCM[idx],
      options: defaultOptions[idx],
      correctIndex: 0,
      isOpenEnded: false,
      is_code_question: false,
      estimatedTime: timePerQuestion,
      difficulty: "medium",
    });
  }

  for (let i = 0; i < openTarget; i++) {
    const idx = i % defaultOpen.length;
    questions.push({
      id: Date.now() + i + Math.random() * 1000 + 10000,
      text: defaultOpen[idx],
      options: ["Réponse libre"],
      correctIndex: 0,
      isOpenEnded: true,
      is_code_question: false,
      estimatedTime: timePerQuestion,
      difficulty: "medium",
    });
  }

  for (let i = 0; i < codeTarget; i++) {
    const defaultCode = defaultCodeQuestions[codeLanguage] || defaultCodeQuestions.python;
    questions.push({
      id: Date.now() + i + Math.random() * 1000 + 20000,
      text: defaultCode.text,
      options: [],
      correctIndex: 0,
      isOpenEnded: false,
      is_code_question: true,
      language: codeLanguage,
      initial_code: defaultCode.initial_code,
      expected_completion: defaultCode.expected_completion,
      test_cases: defaultCode.test_cases,
      hint: defaultCode.hint,
      estimatedTime: timePerQuestion,
      difficulty: "medium",
    });
  }

  return questions;
};

// ─────────────────────────────────────────────────────────────────────────────
// Composant principal
// ─────────────────────────────────────────────────────────────────────────────
const RecruiterTestEditor = ({
  applicationId,
  offerTitle,
  offerDescription,
  requiredSkills,
  onClose,
  onSend,
}) => {
  const [questions, setQuestions] = useState([]);
  const [saving, setSaving] = useState(false);
  const [userInstruction, setUserInstruction] = useState("");
  const [previewMode, setPreviewMode] = useState(false);
  const [generating, setGenerating] = useState(false);
  const [showConfig, setShowConfig] = useState(true);
  const [config, setConfig] = useState(DEFAULT_CONFIG);

  const generateWithConfig = async () => {
    setGenerating(true);
    try {
      const newQuestions = await generateAIQuestionsWithConfig(
        offerTitle,
        offerDescription,
        requiredSkills,
        userInstruction,
        config,
        questions
      );
      setQuestions(newQuestions);
      setShowConfig(false);
    } catch (error) {
      console.error("Erreur génération:", error);
      alert("Erreur lors de la génération. Réessayez.");
    } finally {
      setGenerating(false);
    }
  };

  const addNewQuestion = () => {
    const { questionType, qcmPercentage, codeLanguage, timePerQuestion } = config;
    const isQCM = questionType === "qcm" || (questionType === "mixed" && questions.filter(q => !q.isOpenEnded && !q.is_code_question).length < (qcmPercentage / 100) * (questions.length + 1));
    const isCode = questionType === "code";
    
    const newId = Date.now() + Math.random() * 10000;
    
    if (isCode) {
      setQuestions((prev) => [
        ...prev,
        {
          id: newId,
          text: "Nouvelle question de code",
          options: [],
          correctIndex: 0,
          isOpenEnded: false,
          is_code_question: true,
          language: codeLanguage,
          initial_code: `def solution():\n    # TODO: Implémenter\n    pass`,
          expected_completion: `def solution():\n    return result`,
          test_cases: [{"input": "valeur", "expected": "resultat"}],
          hint: "",
          estimatedTime: timePerQuestion,
          difficulty: "medium",
        },
      ]);
    } else if (isQCM) {
      setQuestions((prev) => [
        ...prev,
        {
          id: newId,
          text: "Nouvelle question QCM",
          options: ["Option A", "Option B", "Option C", "Option D"],
          correctIndex: 0,
          isOpenEnded: false,
          is_code_question: false,
          estimatedTime: timePerQuestion,
          difficulty: "medium",
        },
      ]);
    } else {
      setQuestions((prev) => [
        ...prev,
        {
          id: newId,
          text: "Nouvelle question ouverte",
          options: ["Réponse libre"],
          correctIndex: 0,
          isOpenEnded: true,
          is_code_question: false,
          estimatedTime: timePerQuestion,
          difficulty: "medium",
        },
      ]);
    }
  };

  const handleSendTest = async () => {
    if (questions.length === 0) {
      alert("Veuillez générer ou ajouter au moins une question.");
      return;
    }

    setSaving(true);
    try {
      const payload = {
        questions: questions.map((q, index) => {
          const baseQuestion = {
            order: index + 1,
            text: q.text,
            estimatedTime: q.estimatedTime,
            difficulty: q.difficulty,
          };
          
          if (q.is_code_question) {
            return {
              ...baseQuestion,
              is_code_question: true,
              language: q.language,
              initial_code: q.initial_code,
              expected_completion: q.expected_completion,
              test_cases: q.test_cases,
              hint: q.hint,
              isOpenEnded: false,
              options: [],
              correctIndex: null,
            };
          } else if (q.isOpenEnded) {
            return {
              ...baseQuestion,
              is_code_question: false,
              isOpenEnded: true,
              options: [],
              correctIndex: null,
            };
          } else {
            return {
              ...baseQuestion,
              is_code_question: false,
              isOpenEnded: false,
              options: q.options,
              correctIndex: q.correctIndex,
            };
          }
        }),
        totalTime: questions.reduce((acc, q) => acc + (q.estimatedTime || 0), 0),
      };

      await api.post(`/applications/${applicationId}/send-test-invitation/`, payload);
      alert(`✅ Test envoyé au candidat (${questions.length} questions).`);
      if (onSend) onSend();
      if (onClose) onClose();
    } catch (error) {
      console.error("Erreur envoi test:", error);
      alert("❌ Erreur lors de l'envoi du test.");
    } finally {
      setSaving(false);
    }
  };

  const totalTime = questions.reduce((acc, q) => acc + (q.estimatedTime || 0), 0);

  if (showConfig) {
    return (
      <TestConfigScreen
        config={config}
        setConfig={setConfig}
        userInstruction={userInstruction}
        setUserInstruction={setUserInstruction}
        generating={generating}
        generateWithConfig={generateWithConfig}
        onClose={onClose}
      />
    );
  }

  return (
    <TestEditorMain
      questions={questions}
      setQuestions={setQuestions}
      previewMode={previewMode}
      setPreviewMode={setPreviewMode}
      saving={saving}
      totalTime={totalTime}
      onClose={onClose}
      onSend={handleSendTest}
      onRegenerate={() => setShowConfig(true)}
      onAddQuestion={addNewQuestion}
      config={config}
    />
  );
};

export default RecruiterTestEditor;