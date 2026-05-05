// frontend/src/page/recruiter/RecruiterTestEditorQuestions.jsx
import { motion } from "framer-motion";
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
  CodeBracketIcon,
  XCircleIcon,
} from "@heroicons/react/24/outline";

// ==================== FONCTION FORMATAGE DESCRIPTION ====================
export function formatDescriptionToHtml(text) {
  if (!text) return "";

  let html = text
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;");

  html = html.replace(/^###\s*##\s*/gm, "## ");
  html = html.replace(/^##\s*##\s*/gm, "## ");

  const sections = [
    { name: "Présentation du poste", icon: "🎯", bgColor: "bg-emerald-50", borderColor: "border-emerald-200", textColor: "text-emerald-800", hoverBorder: "hover:border-emerald-300" },
    { name: "Missions principales", icon: "📋", bgColor: "bg-blue-50", borderColor: "border-blue-200", textColor: "text-blue-800", hoverBorder: "hover:border-blue-300" },
    { name: "Profil recherché", icon: "👤", bgColor: "bg-purple-50", borderColor: "border-purple-200", textColor: "text-purple-800", hoverBorder: "hover:border-purple-300" },
    { name: "Avantages", icon: "⭐", bgColor: "bg-amber-50", borderColor: "border-amber-200", textColor: "text-amber-800", hoverBorder: "hover:border-amber-300" },
  ];

  let result = "";
  let remaining = html;

  for (let i = 0; i < sections.length; i++) {
    const section = sections[i];
    const regex = new RegExp(`## ${section.name}\\s*([\\s\\S]*?)(?=## |$)`, "i");
    const match = remaining.match(regex);
    if (match) {
      let content = match[1].trim();
      content = content.replace(/^[-*] (.*)$/gm, (match, item) => {
        return `<li class="flex items-start gap-2 mb-2">
                  <svg class="w-5 h-5 ${section.textColor} shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                  </svg>
                  <span class="text-gray-700">${item}</span>
                </li>`;
      });
      content = content.replace(/(<li.*<\/li>\n?)+/g, '<ul class="space-y-1">$&</ul>');
      content = content.replace(/\n{2,}/g, '</p><p class="mb-3">');
      content = '<p class="mb-3">' + content + '</p>';
      content = content.replace(/<p>\s*<\/p>/g, '');

      result += `
        <div class="bg-white rounded-xl shadow-sm overflow-hidden border ${section.borderColor} ${section.hoverBorder} transition-all duration-200 mb-6">
          <div class="${section.bgColor} px-5 py-3 flex items-center gap-2 border-b ${section.borderColor}">
            <span class="text-xl">${section.icon}</span>
            <h3 class="text-lg font-semibold ${section.textColor}">${section.name}</h3>
          </div>
          <div class="p-5 text-gray-700">
            ${content}
          </div>
        </div>
      `;
      remaining = remaining.replace(regex, "");
    }
  }

  if (remaining.trim()) {
    result += `<div class="bg-gray-50 rounded-xl p-5 border border-gray-200">${remaining}</div>`;
  }

  return result;
}

// ==================== RENDER QUESTION PREVIEW ====================
export function renderQuestionPreview(q, idx) {
  return (
    <div key={q.id} className="bg-white rounded-xl p-5 border border-gray-200 shadow-sm mb-4">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 w-8 h-8 rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center font-semibold text-sm">
          {idx + 1}
        </div>
        <div className="flex-1">
          <p className="font-medium text-gray-800 mb-3">{q.text}</p>
          {q.is_code_question ? (
            <div className="bg-gray-900 rounded-lg p-4">
              <pre className="text-gray-300 text-sm font-mono overflow-x-auto">
                {q.initial_code || "// Code à compléter"}
              </pre>
            </div>
          ) : !q.isOpenEnded ? (
            <div className="space-y-2">
              {q.options.map((opt, optIdx) => (
                <label key={optIdx} className="flex items-center gap-3 p-2 rounded-lg hover:bg-gray-50 cursor-pointer">
                  <input type="radio" name={`q${q.id}`} value={optIdx} className="w-4 h-4 text-emerald-600" readOnly />
                  <span className="text-sm text-gray-700">{opt}</span>
                </label>
              ))}
            </div>
          ) : (
            <textarea
              placeholder="Votre réponse..."
              rows={3}
              className="w-full border border-gray-300 rounded-lg p-3 text-sm focus:ring-2 focus:ring-emerald-500"
              readOnly
            />
          )}
          <div className="mt-2 text-xs text-gray-400 flex items-center gap-2 flex-wrap">
            <span>⏱️ Temps estimé : {q.estimatedTime} secondes</span>
            <span className={`px-2 py-0.5 rounded-full ${
              q.difficulty === "easy" ? "bg-green-100 text-green-700" :
              q.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {q.difficulty === "easy" ? "Facile" : q.difficulty === "hard" ? "Difficile" : "Moyen"}
            </span>
            {q.is_code_question && (
              <span className="px-2 py-0.5 rounded-full bg-purple-100 text-purple-700">
                💻 {q.language}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}

// ==================== RENDER QUESTION EDIT ====================
export function renderQuestionEdit(q, idx, updateQuestion, removeQuestion, updateOption, removeOption, addOption, setCorrectAnswer, updateEstimatedTime, updateDifficulty, toggleQuestionType, updateInitialCode, updateExpectedCompletion, updateTestCases) {
  return (
    <div key={q.id} className="bg-white rounded-xl p-4 border border-gray-200 shadow-sm">
      <div className="flex justify-between items-start gap-3">
        <div className="flex-1">
          <div className="flex items-center gap-2 mb-1 flex-wrap">
            <span className="text-xs font-semibold text-gray-500 bg-gray-100 px-2 py-0.5 rounded-full">Q{idx + 1}</span>
            <span className={`text-xs px-2 py-0.5 rounded-full ${
              q.difficulty === "easy" ? "bg-green-100 text-green-700" :
              q.difficulty === "hard" ? "bg-red-100 text-red-700" : "bg-yellow-100 text-yellow-700"
            }`}>
              {q.difficulty === "easy" ? "Facile" : q.difficulty === "hard" ? "Difficile" : "Moyen"}
            </span>
            {q.is_code_question && (
              <span className="text-xs bg-purple-100 text-purple-700 px-2 py-0.5 rounded-full">Code {q.language}</span>
            )}
            {q.isOpenEnded && (
              <span className="text-xs bg-amber-100 text-amber-700 px-2 py-0.5 rounded-full">Question ouverte</span>
            )}
          </div>
          <input
            type="text"
            value={q.text}
            onChange={(e) => updateQuestion(q.id, e.target.value)}
            className="w-full border border-gray-300 rounded-lg p-2 text-sm focus:ring-2 focus:ring-emerald-300"
          />
          
          {/* Édition pour les questions de code */}
          {q.is_code_question && (
            <div className="mt-3 space-y-3">
              <div>
                <label className="text-xs font-semibold text-gray-600">Langage :</label>
                <select
                  value={q.language}
                  onChange={(e) => updateQuestion(q.id, { language: e.target.value })}
                  className="ml-2 border border-gray-300 rounded-md p-1 text-sm"
                >
                  <option value="python">Python</option>
                  <option value="javascript">JavaScript</option>
                  <option value="sql">SQL</option>
                </select>
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Code initial :</label>
                <textarea
                  value={q.initial_code || ""}
                  onChange={(e) => updateInitialCode(q.id, e.target.value)}
                  rows={6}
                  className="w-full font-mono text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Solution attendue :</label>
                <textarea
                  value={q.expected_completion || ""}
                  onChange={(e) => updateExpectedCompletion(q.id, e.target.value)}
                  rows={4}
                  className="w-full font-mono text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Tests cases (JSON) :</label>
                <textarea
                  value={JSON.stringify(q.test_cases || [], null, 2)}
                  onChange={(e) => {
                    try {
                      const parsed = JSON.parse(e.target.value);
                      updateTestCases(q.id, parsed);
                    } catch (err) {
                      // Ignorer JSON invalide
                    }
                  }}
                  rows={4}
                  className="w-full font-mono text-sm border border-gray-300 rounded-lg p-2 focus:ring-2 focus:ring-emerald-300"
                />
              </div>
              <div>
                <label className="text-xs font-semibold text-gray-600">Indice :</label>
                <input
                  type="text"
                  value={q.hint || ""}
                  onChange={(e) => updateQuestion(q.id, { hint: e.target.value })}
                  className="w-full border border-gray-300 rounded-lg p-2 text-sm"
                  placeholder="Optionnel"
                />
              </div>
            </div>
          )}
          
          {!q.is_code_question && !q.isOpenEnded && (
            <div className="mt-3 space-y-2">
              <div className="text-xs font-semibold text-gray-600">Options (4 recommandées)</div>
              {q.options.map((opt, optIdx) => (
                <div key={optIdx} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={opt}
                    onChange={(e) => updateOption(q.id, optIdx, e.target.value)}
                    className="flex-1 border border-gray-300 rounded-md p-1.5 text-sm"
                  />
                  <button type="button" onClick={() => removeOption(q.id, optIdx)} className="text-gray-400 hover:text-red-500">
                    <TrashIcon className="w-4 h-4" />
                  </button>
                </div>
              ))}
              <button type="button" onClick={() => addOption(q.id)} className="text-xs text-emerald-600 bg-emerald-50 px-2 py-1 rounded-lg flex items-center gap-1">
                <PlusCircleIcon className="w-3 h-3" /> Ajouter option
              </button>
              <div className="mt-2 flex items-center gap-3">
                <span className="text-xs font-medium text-gray-600">Bonne réponse :</span>
                <select
                  value={q.correctIndex}
                  onChange={(e) => setCorrectAnswer(q.id, e.target.value)}
                  className="border border-gray-300 rounded-lg text-sm p-1.5 bg-gray-50"
                >
                  {q.options.map((opt, i) => (
                    <option key={i} value={i}>{opt.length > 40 ? `${opt.substring(0, 40)}…` : opt}</option>
                  ))}
                </select>
              </div>
            </div>
          )}
          
          {q.isOpenEnded && !q.is_code_question && (
            <div className="mt-3 bg-amber-50 p-2 rounded-lg text-amber-800 text-sm">
              <ChatBubbleLeftEllipsisIcon className="w-4 h-4 inline mr-1" /> Question ouverte – le candidat répondra librement.
            </div>
          )}
        </div>
        <button type="button" onClick={() => removeQuestion(q.id)} className="text-red-500 hover:text-red-700 p-1">
          <TrashIcon className="w-5 h-5" />
        </button>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <label className="text-xs font-medium text-gray-600">⏱️ Temps (secondes) :</label>
        <input
          type="number"
          min="10"
          step="5"
          value={q.estimatedTime}
          onChange={(e) => updateEstimatedTime(q.id, e.target.value)}
          className="w-24 border border-gray-300 rounded-md p-1 text-sm text-center"
        />
        <label className="text-xs font-medium text-gray-600">Niveau :</label>
        <select
          value={q.difficulty}
          onChange={(e) => updateDifficulty(q.id, e.target.value)}
          className="border border-gray-300 rounded-md p-1.5 text-sm bg-gray-50"
        >
          <option value="easy">Facile</option>
          <option value="medium">Moyen</option>
          <option value="hard">Difficile</option>
        </select>
        <button
          type="button"
          onClick={() => toggleQuestionType(q.id)}
          className="text-xs bg-blue-50 text-blue-700 px-3 py-1 rounded-lg hover:bg-blue-100 transition"
        >
          {q.is_code_question ? "Passer en QCM" : q.isOpenEnded ? "Passer en Code" : "Passer en question ouverte"}
        </button>
      </div>
    </div>
  );
}

// ==================== COMPOSANT PRINCIPAL D'ÉDITION ====================
export function TestEditorMain({
  questions,
  setQuestions,
  previewMode,
  setPreviewMode,
  saving,
  totalTime,
  onClose,
  onSend,
  onRegenerate,
  onAddQuestion,
  config,
}) {
  // Handlers pour l'édition des questions
  const updateQuestionText = (qId, newText) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, text: newText } : q))
    );
  };

  const updateOption = (qId, optIndex, newValue) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        const newOptions = [...q.options];
        newOptions[optIndex] = newValue;
        return { ...q, options: newOptions };
      })
    );
  };

  const addOption = (qId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        return { ...q, options: [...q.options, "Nouvelle option"] };
      })
    );
  };

  const removeOption = (qId, optIndex) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        if (q.options.length <= 1) return q;
        const newOptions = q.options.filter((_, idx) => idx !== optIndex);
        let newCorrectIndex = q.correctIndex;
        if (newCorrectIndex >= newOptions.length) {
          newCorrectIndex = newOptions.length - 1;
        }
        return {
          ...q,
          options: newOptions,
          correctIndex: newCorrectIndex,
        };
      })
    );
  };

  const setCorrectAnswer = (qId, idx) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, correctIndex: parseInt(idx, 10) } : q
      )
    );
  };

  const deleteQuestion = (qId) => {
    setQuestions((prev) => prev.filter((q) => q.id !== qId));
  };

  const updateEstimatedTime = (qId, newTime) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId
          ? { ...q, estimatedTime: Math.max(10, parseInt(newTime, 10) || 0) }
          : q
      )
    );
  };

  const updateDifficulty = (qId, newDifficulty) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId ? { ...q, difficulty: newDifficulty } : q
      )
    );
  };

  const updateInitialCode = (qId, newCode) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId && q.is_code_question ? { ...q, initial_code: newCode } : q
      )
    );
  };

  const updateExpectedCompletion = (qId, newSolution) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId && q.is_code_question ? { ...q, expected_completion: newSolution } : q
      )
    );
  };

  const updateTestCases = (qId, newTestCases) => {
    setQuestions((prev) =>
      prev.map((q) =>
        q.id === qId && q.is_code_question ? { ...q, test_cases: newTestCases } : q
      )
    );
  };

  const toggleQuestionType = (qId) => {
    setQuestions((prev) =>
      prev.map((q) => {
        if (q.id !== qId) return q;
        if (q.is_code_question) {
          return {
            ...q,
            is_code_question: false,
            isOpenEnded: false,
            options: ["Option A", "Option B", "Option C", "Option D"],
            correctIndex: 0,
          };
        } else if (q.isOpenEnded) {
          return {
            ...q,
            is_code_question: true,
            isOpenEnded: false,
            options: [],
            language: config.codeLanguage,
            initial_code: `def solution():\n    # TODO: Implémenter\n    pass`,
            expected_completion: `def solution():\n    return result`,
            test_cases: [{"input": "valeur", "expected": "resultat"}],
            hint: "",
          };
        } else {
          return {
            ...q,
            is_code_question: false,
            isOpenEnded: true,
            options: ["Réponse libre"],
            correctIndex: 0,
          };
        }
      })
    );
  };

  const updateQuestion = (qId, updates) => {
    setQuestions((prev) =>
      prev.map((q) => (q.id === qId ? { ...q, ...updates } : q))
    );
  };

  return (
    <>
      <div className="flex flex-wrap justify-between items-center gap-3 mb-6">
        <div className="flex gap-2 flex-wrap">
          <button
            type="button"
            onClick={onRegenerate}
            className="flex items-center gap-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-xl hover:bg-gray-200 transition text-sm font-medium"
          >
            <ArrowPathIcon className="w-4 h-4" />
            Modifier la configuration
          </button>
          <button
            type="button"
            onClick={onAddQuestion}
            className="flex items-center gap-2 px-4 py-2 bg-emerald-100 text-emerald-700 rounded-xl hover:bg-emerald-200 transition text-sm font-medium"
          >
            <PlusCircleIcon className="w-4 h-4" /> Ajouter une question
          </button>
        </div>

        <div className="flex items-center gap-4 flex-wrap">
          <div className="flex bg-gray-100 rounded-xl p-1">
            <button
              type="button"
              onClick={() => setPreviewMode(false)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                !previewMode ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <PencilIcon className="w-4 h-4" /> Édition RH
            </button>
            <button
              type="button"
              onClick={() => setPreviewMode(true)}
              className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition ${
                previewMode ? "bg-white text-emerald-700 shadow-sm" : "text-gray-500 hover:text-gray-700"
              }`}
            >
              <EyeIcon className="w-4 h-4" /> Aperçu candidat
            </button>
          </div>
        </div>
      </div>

      {questions.length === 0 ? (
        <div className="text-center py-12 bg-white rounded-xl border border-gray-100">
          <DocumentTextIcon className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500">Aucune question. Cliquez sur "Modifier la configuration" pour générer.</p>
        </div>
      ) : (
        <div className="space-y-5">
          {questions.map((q, idx) => (
            !previewMode 
              ? renderQuestionEdit(
                  q, idx, updateQuestionText, deleteQuestion,
                  updateOption, removeOption, addOption, setCorrectAnswer,
                  updateEstimatedTime, updateDifficulty, toggleQuestionType,
                  updateInitialCode, updateExpectedCompletion, updateTestCases
                )
              : renderQuestionPreview(q, idx)
          ))}
        </div>
      )}

      <div className="sticky bottom-0 mt-8 bg-white border-t border-gray-200 p-4 rounded-xl shadow-lg flex justify-between items-center gap-4 flex-wrap">
        <div className="text-sm text-gray-600 flex items-center gap-4">
          <span>📋 {questions.length} question(s)</span>
          <span className="flex items-center gap-1">
            <ClockIcon className="w-4 h-4" />
            Temps total : <span className="font-semibold text-emerald-600">{totalTime}</span> secondes
          </span>
        </div>
        <div className="flex gap-3">
          <button type="button" onClick={onClose} className="px-5 py-2 border border-gray-300 rounded-xl text-gray-700 hover:bg-gray-50 transition">
            Annuler
          </button>
          <button
            type="button"
            onClick={onSend}
            disabled={saving || questions.length === 0}
            className="px-5 py-2 bg-emerald-600 text-white rounded-xl hover:bg-emerald-700 transition disabled:opacity-50 flex items-center gap-2"
          >
            {saving ? (
              <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <SparklesIcon className="w-4 h-4" />
            )}
            Envoyer le test au candidat
          </button>
        </div>
      </div>
    </>
  );
}