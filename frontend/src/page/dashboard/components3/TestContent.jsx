// frontend/src/page/dashboard/components/TestContent.jsx
import CodeEditor from "../../../components/common/CodeEditor";
import { RegularQuestion } from "./RegularQuestion";

export function TestContent({
  isCodeQuestion,
  currentQ,
  currentQuestion,
  totalQuestions,
  isAnswered,
  app,
  answers,
  openAnswers,
  onAnswer,
  onOpenAnswerChange,
  onValidateOpenAnswer,
  onCodeAnswer,
  submitTest,
  goToPrevious,
  goToNext,
  isSubmitting,
  formatTime,
}) {
  if (!currentQ) return null;

  if (isCodeQuestion) {
    return (
      <CodeEditor
        question={currentQ}
        onSubmit={(codeData) => onCodeAnswer(currentQuestion, codeData)}
        onNext={goToNext}
        isAnswered={isAnswered}
        currentQuestionIndex={currentQuestion}
        totalQuestions={totalQuestions}
        applicationId={app.id}
      />
    );
  }

  const isOpenEnded = currentQ.is_open_ended === true;
  const currentAnswer = answers[currentQuestion];
  const currentOpenAnswer = openAnswers[currentQuestion];

  return (
    <>
      <RegularQuestion
        question={currentQ}
        isOpenEnded={isOpenEnded}
        currentIndex={currentQuestion}
        answer={currentAnswer}
        openAnswer={currentOpenAnswer}
        isAnswered={isAnswered}
        onAnswer={(idx) => onAnswer(currentQuestion, idx)}
        onOpenAnswerChange={(val) => onOpenAnswerChange(currentQuestion, val)}
        onValidateOpenAnswer={() => onValidateOpenAnswer(currentQuestion)}
        formatTime={formatTime}
      />
      <div className="mt-6 flex gap-3 px-6 pb-6">
        <button
          onClick={goToPrevious}
          disabled={currentQuestion === 0 || isAnswered}
          className="flex-1 px-4 py-2.5 border border-gray-200 rounded-xl text-sm font-medium hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition"
        >
          ← Précédent
        </button>
        {!isOpenEnded && (
          <button
            onClick={goToNext}
            disabled={isSubmitting || (answers[currentQuestion] === undefined && !isAnswered)}
            className="flex-1 px-4 py-2.5 bg-gradient-to-r from-indigo-600 to-violet-600 text-white rounded-xl text-sm font-semibold hover:opacity-90 transition shadow-sm disabled:opacity-50"
          >
            {isSubmitting ? (
              <span className="flex items-center justify-center gap-2">
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi...
              </span>
            ) : currentQuestion < totalQuestions - 1 ? (
              "Suivant →"
            ) : (
              "Terminer le test ✓"
            )}
          </button>
        )}
      </div>
    </>
  );
}