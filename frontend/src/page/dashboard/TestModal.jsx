// frontend/src/page/dashboard/TestModal.jsx
import { motion, AnimatePresence } from "framer-motion";
import { useTestModal } from "./hooks3/useTestModal";
import { TestHeader } from "./components3/TestHeader";
import { TestContent } from "./components3/TestContent";
import { TestResultModal } from "./components3/TestResultModal";

export default function TestModal({ app, onClose, onRefresh }) {
  const {
    questions,
    currentQuestion,
    currentQ,
    totalQuestions,
    answers,
    openAnswers,
    timeLeft,
    isSubmitting,
    result,
    isAnswered,
    showWarning,
    answeredCount,
    progress,
    isCurrentQuestionCode,
    handleAnswer,
    handleOpenAnswerChange,
    handleValidateOpenAnswer,
    handleCodeAnswer,
    goToPrevious,
    goToNext,
  } = useTestModal(app, onRefresh);

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    if (mins > 0) return `${mins}:${secs.toString().padStart(2, "0")}`;
    return `${seconds}s`;
  };

  const getTimerColor = () => {
    const total = currentQ?.estimated_time || 60;
    const ratio = timeLeft / total;
    if (ratio > 0.66) return "bg-emerald-500";
    if (ratio > 0.33) return "bg-amber-500";
    return "bg-red-500";
  };

  const timeProgress = (timeLeft / (currentQ?.estimated_time || 60)) * 100;

  if (!totalQuestions) {
    return (
      <div className="fixed inset-0 z-[999999] flex items-center justify-center bg-black/80">
        <div className="bg-white rounded-2xl p-8 text-center max-w-md mx-4">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600 mx-auto mb-4" />
          <p className="text-gray-600">Chargement du test...</p>
        </div>
      </div>
    );
  }

  if (result) {
    return <TestResultModal onClose={onClose} />;
  }

  return (
    <div className="fixed inset-0 z-[999999] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="w-full max-w-5xl bg-white rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        <TestHeader
          app={app}
          timeLeft={timeLeft}
          showWarning={showWarning}
          currentQuestion={currentQuestion}
          totalQuestions={totalQuestions}
          answeredCount={answeredCount}
          progress={progress}
          formatTime={formatTime}
          getTimerColor={getTimerColor}
          timeProgress={timeProgress}
        />

        <div className="flex-1 overflow-y-auto">
          <TestContent
            isCodeQuestion={isCurrentQuestionCode()}
            currentQ={currentQ}
            currentQuestion={currentQuestion}
            totalQuestions={totalQuestions}
            isAnswered={isAnswered}
            app={app}
            answers={answers}
            openAnswers={openAnswers}
            onAnswer={handleAnswer}
            onOpenAnswerChange={handleOpenAnswerChange}
            onValidateOpenAnswer={handleValidateOpenAnswer}
            onCodeAnswer={handleCodeAnswer}
            submitTest={goToNext} // goToNext submits if last question
            goToPrevious={goToPrevious}
            goToNext={goToNext}
            isSubmitting={isSubmitting}
            formatTime={formatTime}
          />
        </div>
      </motion.div>
    </div>
  );
}