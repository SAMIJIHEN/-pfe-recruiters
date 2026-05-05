// frontend/src/page/dashboard/hooks/useTestModal.js
import { useState, useEffect, useRef } from "react";
import api from "../../../services/api";

export function useTestModal(app, onRefresh) {
  const [questions, setQuestions] = useState([]);
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [answers, setAnswers] = useState({});
  const [openAnswers, setOpenAnswers] = useState({});
  const [codeAnswers, setCodeAnswers] = useState({});
  const [timeLeft, setTimeLeft] = useState(0);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [result, setResult] = useState(null);
  const [isAnswered, setIsAnswered] = useState(false);
  const [showWarning, setShowWarning] = useState(false);
  const timerRef = useRef(null);

  const totalQuestions = questions.length;

  const getCurrentQuestionTime = () => {
    const currentQ = questions[currentQuestion];
    return currentQ?.estimated_time || 60;
  };

  const isCurrentQuestionOpenEnded = () => questions[currentQuestion]?.is_open_ended === true;
  const isCurrentQuestionCode = () => questions[currentQuestion]?.is_code_question === true;

  useEffect(() => {
    const loadTestQuestions = async () => {
      try {
        const response = await api.get(`/applications/${app.id}/get-test/`);
        let loadedQuestions = [];
        if (response.data?.test_questions) {
          loadedQuestions = response.data.test_questions;
        } else if (app.test_questions_safe?.length) {
          loadedQuestions = app.test_questions_safe;
        }
        setQuestions(loadedQuestions);
        setCurrentQuestion(0);
        setAnswers({});
        setOpenAnswers({});
        setCodeAnswers({});
        setIsAnswered(false);
      } catch (error) {
        console.error("Erreur chargement test:", error);
      }
    };
    loadTestQuestions();
  }, [app.id]);

  useEffect(() => {
    if (!totalQuestions || result) return;

    const questionTime = getCurrentQuestionTime();
    setTimeLeft(questionTime);
    setIsAnswered(false);
    setShowWarning(false);

    if (timerRef.current) clearInterval(timerRef.current);

    timerRef.current = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          clearInterval(timerRef.current);
          if (!isAnswered && !isCurrentQuestionOpenEnded() && !isCurrentQuestionCode()) {
            handleTimeOut();
          }
          return 0;
        }
        if (prev === 6) setShowWarning(true);
        return prev - 1;
      });
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [currentQuestion, totalQuestions, result, isAnswered]);

  const handleTimeOut = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      submitTest();
    }
  };

  const handleAnswer = (questionIndex, answerIndex) => {
    if (isAnswered) return;
    setAnswers((prev) => ({ ...prev, [questionIndex]: answerIndex }));
    setIsAnswered(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        submitTest();
      }
    }, 800);
  };

  const handleOpenAnswerChange = (questionIndex, value) => {
    setOpenAnswers((prev) => ({ ...prev, [questionIndex]: value }));
  };

  const handleValidateOpenAnswer = (questionIndex) => {
    const answer = openAnswers[questionIndex];
    if (!answer?.trim()) {
      alert("Veuillez saisir une réponse avant de continuer.");
      return;
    }
    if (isAnswered) return;
    setIsAnswered(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        submitTest();
      }
    }, 800);
  };

  const handleCodeAnswer = (questionIndex, codeData) => {
    if (isAnswered) return;
    setCodeAnswers((prev) => ({ ...prev, [questionIndex]: codeData }));
    setIsAnswered(true);
    if (timerRef.current) clearInterval(timerRef.current);
    setTimeout(() => {
      if (currentQuestion < totalQuestions - 1) {
        setCurrentQuestion((prev) => prev + 1);
      } else {
        submitTest();
      }
    }, 800);
  };

  const submitTest = async () => {
    if (timerRef.current) clearInterval(timerRef.current);
    setIsSubmitting(true);

    const answersArray = questions.map((q, idx) => {
      if (q.is_open_ended) return openAnswers[idx] || "";
      if (q.is_code_question) return codeAnswers[idx]?.code || "";
      return answers[idx] !== undefined ? answers[idx] : -1;
    });

    try {
      const response = await api.post(`/applications/${app.id}/submit-test/`, { answers: answersArray });
      setResult(response.data);
      if (onRefresh) onRefresh();
    } catch (error) {
      console.error("Erreur soumission test:", error);
      alert("Erreur lors de la soumission du test. Veuillez réessayer.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const goToPrevious = () => setCurrentQuestion((prev) => Math.max(0, prev - 1));
  const goToNext = () => {
    if (currentQuestion < totalQuestions - 1) {
      setCurrentQuestion((prev) => prev + 1);
    } else {
      submitTest();
    }
  };

  const answeredCount = Object.keys(answers).length + Object.keys(openAnswers).length + Object.keys(codeAnswers).length;
  const progress = totalQuestions > 0 ? ((currentQuestion + 1) / totalQuestions) * 100 : 0;

  return {
    questions,
    currentQuestion,
    currentQ: questions[currentQuestion],
    totalQuestions,
    answers,
    openAnswers,
    codeAnswers,
    timeLeft,
    isSubmitting,
    result,
    isAnswered,
    showWarning,
    answeredCount,
    progress,
    getCurrentQuestionTime,
    isCurrentQuestionOpenEnded,
    isCurrentQuestionCode,
    handleAnswer,
    handleOpenAnswerChange,
    handleValidateOpenAnswer,
    handleCodeAnswer,
    submitTest,
    goToPrevious,
    goToNext,
    setCurrentQuestion,
  };
}