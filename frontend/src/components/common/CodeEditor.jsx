// frontend/src/components/common/CodeEditor.jsx
import { useState, useEffect, useRef, useCallback } from "react";
import Editor from "@monaco-editor/react";
import {
  PlayIcon,
  CheckCircleIcon,
  ClockIcon,
  ArrowPathIcon,
  CodeBracketIcon,
} from "@heroicons/react/24/outline";
import api from "../../services/api";

export default function CodeEditor({
  question,
  onSubmit,
  onNext,
  isAnswered,
  currentQuestionIndex,
  totalQuestions,
  applicationId,
}) {
  const [code, setCode] = useState(question?.initial_code || "");
  const [executing, setExecuting] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [timeLeft, setTimeLeft] = useState(question?.estimated_time || 300);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [executionResult, setExecutionResult] = useState(null);
  const timerRef = useRef(null);

  // ✅ handleSubmit défini AVANT le useEffect du timer (useCallback pour stabiliser la référence)
  const handleSubmit = useCallback(async () => {
    if (isAnswered || isSubmitting) return;

    setIsSubmitting(true);
    // Nettoyer le timer immédiatement pour éviter un double-appel
    if (timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
    }

    try {
      await onSubmit({
        code,
        test_results: executionResult,
        score: executionResult?.passed ?? 0,
      });
    } catch (err) {
      console.error("❌ Erreur lors de la soumission :", err);
    } finally {
      setIsSubmitting(false);
    }

    // Passer à la question suivante
    setTimeout(() => {
      if (typeof onNext === "function") onNext();
    }, 500);
  }, [isAnswered, isSubmitting, code, executionResult, onSubmit, onNext]);

  // ✅ Timer — dépend de handleSubmit (stable grâce à useCallback)
  useEffect(() => {
    if (isAnswered) return;

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          timerRef.current = null;
          handleSubmit();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    };
  }, [isAnswered, handleSubmit]);

  // ✅ Réinitialiser le code quand la question change
  useEffect(() => {
    setCode(question?.initial_code || "");
    setExecutionResult(null);
    setShowHint(false);
    setTimeLeft(question?.estimated_time || 300);
  }, [question]);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  // ✅ Exécuter le code
  const handleRunCode = async () => {
    if (!question?.test_cases || question.test_cases.length === 0) {
      setExecutionResult({ error: "Aucun test case défini pour cette question" });
      return;
    }

    setExecuting(true);
    setExecutionResult(null);

    try {
      const response = await api.post(
        `/applications/${applicationId}/execute-code/`,
        {
          language: question.language || "python",
          code,
          test_cases: question.test_cases,
        }
      );
      setExecutionResult(response.data);
    } catch (error) {
      console.error("❌ Erreur exécution :", error);
      setExecutionResult({
        error: "Erreur lors de l'exécution du code",
        score: 0,
      });
    } finally {
      setExecuting(false);
    }
  };

  // ✅ Guard : si question est undefined, ne pas planter
  if (!question) {
    return (
      <div className="flex items-center justify-center h-full bg-gray-900 text-gray-400">
        Chargement de la question...
      </div>
    );
  }

  const languageLabel =
    question.language === "python"
      ? "🐍 Python"
      : question.language === "javascript"
      ? "📜 JavaScript"
      : "💻 Code";

  return (
    <div
      className="flex flex-col"
      style={{ height: "100%", display: "flex", flexDirection: "column" }}
    >
      {/* HEADER */}
      <div className="bg-gray-900 text-white p-4 shrink-0">
        <div className="flex justify-between items-center mb-2">
          <div className="flex items-center gap-2">
            <CodeBracketIcon className="w-5 h-5 text-emerald-400" />
            <span className="font-semibold">
              Question {currentQuestionIndex + 1}/{totalQuestions}
            </span>
            <span className="text-gray-400 text-sm ml-2 bg-gray-800 px-2 py-0.5 rounded">
              {languageLabel}
            </span>
          </div>
          <div
            className={`flex items-center gap-2 px-3 py-1 rounded-lg ${
              timeLeft <= 30 ? "bg-red-900/60" : "bg-gray-800"
            }`}
          >
            <ClockIcon
              className={`w-4 h-4 ${
                timeLeft <= 30 ? "text-red-400" : "text-emerald-400"
              }`}
            />
            <span
              className={`font-mono ${
                timeLeft <= 30 ? "text-red-300" : "text-white"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        {/* ✅ Affichage correct du texte de la question (champ "question" côté backend) */}
        <p className="text-white text-base leading-relaxed">
          {question.question || question.text || "Question sans texte"}
        </p>

        {question.hint && (
          <button
            onClick={() => setShowHint((v) => !v)}
            className="mt-2 text-amber-400 text-sm hover:text-amber-300 transition"
          >
            {showHint ? "▼ Masquer l'indice" : "▶ Voir un indice"}
          </button>
        )}

        {showHint && question.hint && (
          <div className="mt-2 p-2 bg-amber-500/20 rounded-lg border border-amber-500/30">
            <p className="text-amber-300 text-sm">💡 {question.hint}</p>
          </div>
        )}
      </div>

      {/* ÉDITEUR MONACO */}
      <div
        className="w-full bg-gray-900"
        style={{ height: "350px", minHeight: "350px", flexShrink: 0 }}
      >
        <Editor
          height="100%"
          width="100%"
          language={question.language || "python"}
          theme="vs-dark"
          value={code}
          onChange={(value) => !isAnswered && setCode(value || "")}
          options={{
            fontSize: 14,
            minimap: { enabled: false },
            scrollBeyondLastLine: false,
            lineNumbers: "on",
            readOnly: isAnswered,
            automaticLayout: true,
          }}
          loading={
            <div className="text-white p-4">Chargement de l'éditeur...</div>
          }
        />
      </div>

      {/* RÉSULTAT D'EXÉCUTION */}
      {executionResult && (
        <div className="bg-gray-900 border-t border-gray-700 p-3 shrink-0">
          {executionResult.error ? (
            <div className="text-red-400 text-sm flex items-center gap-2">
              <span>❌</span> {executionResult.error}
            </div>
          ) : (
            <div className="text-emerald-400 text-sm flex items-center gap-2">
              <span>✅</span> Code exécuté avec succès ! (
              {executionResult.passed}/{executionResult.total} tests passés)
            </div>
          )}
        </div>
      )}

      {/* BOUTONS */}
      <div className="bg-gray-800 border-t border-gray-700 p-4 shrink-0 mt-auto">
        {!isAnswered ? (
          <div className="flex gap-3">
            {/* ✅ Bouton "Exécuter" désactivé seulement pendant l'exécution */}
            <button
              onClick={handleRunCode}
              disabled={executing || isSubmitting}
              className="flex items-center justify-center gap-2 px-5 py-2.5 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition disabled:opacity-50 font-medium"
            >
              {executing ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Exécution...
                </>
              ) : (
                <>
                  <PlayIcon className="w-4 h-4" />
                  Exécuter le code
                </>
              )}
            </button>

            {/* ✅ Bouton "Valider" désactivé seulement pendant la soumission */}
            <button
              onClick={handleSubmit}
              disabled={isSubmitting || executing}
              className="flex-1 flex items-center justify-center gap-2 px-5 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-lg hover:from-emerald-700 hover:to-teal-700 transition disabled:opacity-50 font-semibold"
            >
              {isSubmitting ? (
                <>
                  <ArrowPathIcon className="w-4 h-4 animate-spin" />
                  Envoi...
                </>
              ) : (
                <>
                  <CheckCircleIcon className="w-4 h-4" />
                  Valider la réponse
                </>
              )}
            </button>
          </div>
        ) : (
          <div className="w-full text-center py-2.5 bg-emerald-500/20 rounded-lg">
            <p className="text-emerald-400 font-semibold flex items-center justify-center gap-2">
              <CheckCircleIcon className="w-5 h-5" />✓ Réponse enregistrée
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
