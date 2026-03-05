"use client";

import { useState, useEffect, useCallback } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useRequireAuth } from "@/hooks/useRequireAuth";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CodeEditor } from "@/components/ui/CodeEditor";
import { Button, notify, AlertVariant } from "../../../../../../../packages/ui";

interface UserAnswer {
  questionId: string;
  optionId?: string;
  content?: string;
}

interface QuizOption {
  _id?: string;
  id?: string;
  text?: string;
  content?: string;
}

interface QuizQuestion {
  _id: string;
  questionText?: string;
  question?: string;
  type: string;
  points?: number;
  options?: QuizOption[];
  evaluationCriteria?: string;
}

interface QuizData {
  quiz: { _id: string; lessonId: string; moduleId: string };
  questions: QuizQuestion[];
}

interface QuestionResult {
  questionId: string;
  isCorrect: boolean;
  question?: string;
  type?: string;
  options?: { text?: string; isSelected?: boolean; isCorrect?: boolean }[];
  userAnswer?: string;
  explanation?: string;
  earnedPoints?: number;
  points?: number;
}

interface QuizResult {
  quizResults: {
    isPassed: boolean;
    earnedPoints: number;
    totalPoints: number;
    scorePercentage: number;
  };
  feedback: string;
  questionResults: QuestionResult[];
}

export default function QuizPage() {
  const { user, isLoading: authLoading } = useRequireAuth();
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;
  const quizId = params.quizId as string;

  const [quizData, setQuizData] = useState<QuizData | null>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isSubmittingQuiz, setIsSubmittingQuiz] = useState(false);
  const [quizResults, setQuizResults] = useState<QuizResult | null>(null);

  const loadQuiz = useCallback(async () => {
    if (!user || !quizId) return;

    try {
      setIsLoading(true);
      const { getAuthHeader } = await import("@/lib/token-storage");
      const authHeader = getAuthHeader();
      const headers: HeadersInit = {};
      if (authHeader) headers["Authorization"] = authHeader;

      const response = await fetch(
        `/api/get-quiz?quizId=${quizId}&userId=${user._id}`,
        { headers, credentials: "include" },
      );

      const data = await response.json();

      if (data.success && data.data) {
        setQuizData(data.data);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setQuizResults(null);
      } else {
        notify({
          message: data.error || "Failed to load quiz",
          variant: AlertVariant.ERROR,
        });
        router.push(`/dashboard/modules/${moduleId}`);
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      notify({
        message: "Error loading quiz. Please try again.",
        variant: AlertVariant.ERROR,
      });
      router.push(`/dashboard/modules/${moduleId}`);
    } finally {
      setIsLoading(false);
    }
  }, [user, quizId, moduleId, router]);

  useEffect(() => {
    if (authLoading || !user) return;
    loadQuiz();
  }, [user, authLoading, moduleId, quizId, loadQuiz]);

  const handleAnswerSelect = useCallback(
    (questionId: string, optionId?: string, content?: string) => {
      setUserAnswers((prev) => {
        const existing = prev.findIndex((a) => a.questionId === questionId);
        const answer: UserAnswer = {
          questionId,
          ...(optionId && { optionId }),
          ...(content && { content }),
        };
        if (existing >= 0) {
          const next = [...prev];
          next[existing] = answer;
          return next;
        }
        return [...prev, answer];
      });
    },
    [],
  );

  const handleSubmitQuiz = useCallback(async () => {
    if (!user || !quizData) return;

    const allAnswered = userAnswers.length === quizData.questions.length;
    const everyQuestionAnswered = quizData.questions.every((q) =>
      userAnswers.some((a) => a.questionId === q._id),
    );

    if (!allAnswered || !everyQuestionAnswered) {
      notify({
        message: "Please answer all questions before submitting.",
        variant: AlertVariant.WARNING,
      });
      return;
    }

    try {
      setIsSubmittingQuiz(true);
      const { getAuthHeader } = await import("@/lib/token-storage");
      const authHeader = getAuthHeader();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (authHeader) headers["Authorization"] = authHeader;

      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          moduleId: quizData.quiz.moduleId || moduleId,
          lessonId: quizData.quiz.lessonId,
          answers: userAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        notify({
          message: errorData.error || "Failed to submit quiz",
          variant: AlertVariant.ERROR,
        });
        return;
      }

      const result = await response.json();
      setQuizResults(result.data);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      notify({
        message: "An error occurred while submitting the quiz",
        variant: AlertVariant.ERROR,
      });
    } finally {
      setIsSubmittingQuiz(false);
    }
  }, [user, quizData, moduleId, userAnswers]);

  const handleBackToModule = useCallback(() => {
    router.push(`/dashboard/modules/${moduleId}`);
  }, [router, moduleId]);

  const saveProgressAndNavigate = useCallback(async () => {
    if (!user || !quizData) return;

    if (quizResults?.quizResults?.isPassed) {
      try {
        const { getAuthHeader } = await import("@/lib/token-storage");
        const authHeader = getAuthHeader();
        const headers: HeadersInit = { "Content-Type": "application/json" };
        if (authHeader) headers["Authorization"] = authHeader;

        const response = await fetch("/api/save-progress", {
          method: "POST",
          headers,
          credentials: "include",
          body: JSON.stringify({
            userId: user._id,
            moduleId: quizData.quiz.moduleId || moduleId,
            lessonId: quizData.quiz.lessonId,
          }),
        });

        if (!response.ok) {
          const errorData = await response.json();
          notify({
            message: errorData.error || "Failed to save progress",
            variant: AlertVariant.ERROR,
          });
          return;
        }
      } catch (error) {
        console.error("Error saving progress:", error);
        notify({
          message: "Failed to save progress",
          variant: AlertVariant.ERROR,
        });
        return;
      }
    }

    // Allow DB replication before loading next lesson
    await new Promise((resolve) => setTimeout(resolve, 500));
    router.push(`/dashboard/modules/${moduleId}`);
  }, [router, moduleId, user, quizData, quizResults]);

  const handleContinue = saveProgressAndNavigate;

  // Auto-move to next lesson when quiz is passed (after brief delay to show results)
  useEffect(() => {
    if (
      !quizResults?.quizResults?.isPassed ||
      !user ||
      !quizData
    )
      return;

    let cancelled = false;
    const timer = setTimeout(async () => {
      await saveProgressAndNavigate();
      if (cancelled) return;
    }, 2500);

    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [quizResults?.quizResults?.isPassed, user, quizData, saveProgressAndNavigate]);

  if (authLoading || isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="animate-spin rounded-full h-10 w-10 border-2 border-white border-t-transparent" />
        </div>
      </DashboardLayout>
    );
  }

  if (!quizData || !quizData.questions?.length) {
    return (
      <DashboardLayout>
        <div className="p-6">
          <p className="text-gray-400">No quiz data available.</p>
          <Button
            onClick={handleBackToModule}
            className="mt-4 !px-4 !py-2 !bg-white !text-black !rounded-lg"
          >
            Back to Module
          </Button>
        </div>
      </DashboardLayout>
    );
  }

  if (quizResults) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div
            className={`rounded-xl border overflow-hidden ${
              quizResults.quizResults.isPassed
                ? "bg-emerald-500/5 border-emerald-500/20"
                : "bg-rose-500/5 border-rose-500/20"
            }`}
          >
            <div className="p-8 text-center">
              <h2 className="text-lg font-semibold text-white mb-2">
                {quizResults.feedback}
              </h2>
              <p className="text-sm text-gray-400 mb-6">
                Score: {quizResults.quizResults.earnedPoints} /{" "}
                {quizResults.quizResults.totalPoints} points
              </p>
              {quizResults.quizResults.isPassed && (
                <p className="text-xs text-emerald-400/80 mb-4">
                  Redirecting to next lesson...
                </p>
              )}
            </div>

            {/* Question Results Report */}
            {quizResults.questionResults &&
              quizResults.questionResults.length > 0 && (
                <div className="p-5 space-y-3 border-t border-gray-800">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Results
                  </h3>
                  {quizResults.questionResults.map(
                    (result: QuestionResult, index: number) => (
                      <div
                        key={result.questionId}
                        className={`border rounded-lg p-4 ${
                          result.isCorrect === true
                            ? "border-emerald-500/20 bg-emerald-500/5"
                            : result.isCorrect === false
                              ? "border-rose-500/20 bg-rose-500/5"
                              : "border-amber-500/20 bg-amber-500/5"
                        }`}
                      >
                        <div className="flex items-start gap-3">
                          <span
                            className={`flex-shrink-0 w-5 h-5 rounded-full flex items-center justify-center text-[10px] font-medium ${
                              result.isCorrect === true
                                ? "bg-emerald-500/20 text-emerald-400"
                                : result.isCorrect === false
                                  ? "bg-rose-500/20 text-rose-400"
                                  : "bg-amber-500/20 text-amber-400"
                            }`}
                          >
                            {index + 1}
                          </span>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-sm font-medium text-white mb-2">
                              {result.question || `Question ${index + 1}`}
                            </h4>

                            {result.type === "mcq" && result.options && (
                              <div className="space-y-1.5 mb-2">
                                {result.options.map(
                                  (
                                    option: {
                                      text?: string;
                                      isSelected?: boolean;
                                    },
                                    optIndex: number,
                                  ) => (
                                    <div
                                      key={optIndex}
                                      className={`px-3 py-1.5 rounded-lg text-xs ${
                                        option.isSelected
                                          ? result.isCorrect
                                            ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                            : "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                                          : "bg-gray-800 border border-gray-700 text-gray-400"
                                      }`}
                                    >
                                      {option.text}
                                      {option.isSelected && (
                                        <span className="ml-2 text-gray-500">
                                          (your answer)
                                        </span>
                                      )}
                                    </div>
                                  ),
                                )}
                              </div>
                            )}

                            {(result.type === "subjective" ||
                              result.type === "code") &&
                              result.userAnswer && (
                                <div className="mb-2">
                                  <p className="text-[10px] text-gray-500 mb-1">
                                    Your answer:
                                  </p>
                                  <div className="bg-gray-950 text-gray-300 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-gray-800">
                                    <pre className="whitespace-pre-wrap">
                                      {result.userAnswer}
                                    </pre>
                                  </div>
                                </div>
                              )}

                            {result.explanation && (
                              <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-2.5 mt-2">
                                <p className="text-xs text-gray-400">
                                  {result.explanation}
                                </p>
                              </div>
                            )}

                            <div className="mt-2 text-[10px] text-gray-500">
                              {result.earnedPoints ?? 0}/{result.points ?? 0}{" "}
                              pts
                            </div>
                          </div>
                        </div>
                      </div>
                    ),
                  )}
                </div>
              )}

            <div className="p-5 pt-0 flex flex-col sm:flex-row gap-3 justify-center">
              <Button
                onClick={handleContinue}
                className="!px-6 !py-2.5 !bg-white !text-black !rounded-lg !font-medium"
              >
                {quizResults.quizResults.isPassed
                  ? "Continue to Module"
                  : "Back to Module"}
              </Button>
              {!quizResults.quizResults.isPassed && (
                <Button
                  variant="text"
                  onClick={() => {
                    setQuizResults(null);
                    setUserAnswers([]);
                    setCurrentQuestionIndex(0);
                  }}
                  className="!px-6 !py-2.5 !border !border-gray-600 !text-gray-300 !rounded-lg !font-medium !hover:bg-gray-800"
                >
                  Retake Quiz
                </Button>
              )}
            </div>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  const question = quizData.questions[currentQuestionIndex];
  const currentAnswer = userAnswers.find((a) => a.questionId === question._id);

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto p-6">
        <Link
          href={`/dashboard/modules/${moduleId}`}
          className="inline-flex items-center gap-2 text-sm text-gray-400 hover:text-white mb-6"
        >
          ← Back to Module
        </Link>

        <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
          <div className="sm:p-5 p-3 border-b border-gray-800">
            <div className="flex items-center justify-between">
              <h2 className="text-base font-semibold text-white">Quiz</h2>
              <div className="text-lg font-bold text-white">
                {currentQuestionIndex + 1}/{quizData.questions.length}
              </div>
            </div>
            <div className="mt-4 w-full bg-gray-800 rounded-full h-1">
              <div
                className="bg-white h-1 rounded-full transition-all duration-300"
                style={{
                  width: `${
                    ((currentQuestionIndex + 1) / quizData.questions.length) *
                    100
                  }%`,
                }}
              />
            </div>
            <div className="mt-3 flex flex-wrap gap-1.5">
              {quizData.questions.map((q, index) => {
                const isAnswered = userAnswers.some(
                  (a) => a.questionId === q._id,
                );
                const isCurrent = index === currentQuestionIndex;
                return (
                  <button
                    key={q._id}
                    type="button"
                    onClick={() => setCurrentQuestionIndex(index)}
                    className={`w-7 h-7 rounded-full flex items-center justify-center text-xs font-medium transition-all ${
                      isCurrent
                        ? "ring-2 ring-white ring-offset-2 ring-offset-gray-900"
                        : ""
                    } ${
                      isAnswered
                        ? "bg-emerald-500/80 text-white hover:bg-emerald-500"
                        : "bg-rose-500/80 text-white hover:bg-rose-500"
                    }`}
                    title={`Question ${index + 1}${isAnswered ? " (answered)" : " (not answered)"}`}
                  >
                    {index + 1}
                  </button>
                );
              })}
            </div>
          </div>

          <div className="sm:p-5 p-3">
            <div className="mb-6">
              <div className="flex items-start gap-3 mb-5">
                <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-gray-400 rounded-lg flex items-center justify-center text-sm font-medium border border-gray-700">
                  {currentQuestionIndex + 1}
                </div>
                <div className="flex-1">
                  {(question.questionText || question.question) && (
                    <div className="mt-3 bg-gray-800/50 border border-gray-700 rounded-lg p-4">
                      <p className="text-xs text-gray-400 mb-2 font-medium uppercase tracking-wide">
                        Question Details:
                      </p>
                      <div className="text-sm text-gray-300 whitespace-pre-wrap leading-relaxed">
                        {question.questionText || question.question}
                      </div>
                    </div>
                  )}
                </div>
              </div>

              {question.type === "mcq" && question.options ? (
                <div className="space-y-2">
                  {question.options.map((option: QuizOption, index: number) => {
                    const isSelected =
                      currentAnswer?.optionId === (option._id || option.id);
                    return (
                      <button
                        key={option._id || option.id}
                        onClick={() =>
                          handleAnswerSelect(
                            question._id,
                            option._id || option.id,
                          )
                        }
                        className={`!w-full !text-left !p-3 !flex !items-start !gap-3 !rounded-lg !border !transition-all ${
                          isSelected
                            ? "!border-white !bg-white/5"
                            : "!border-gray-800 !hover:border-gray-700 !hover:bg-gray-800/50"
                        }`}
                      >
                        <div className="!flex !items-center !gap-3">
                          <div
                            className={`!flex-shrink-0 !w-6 !h-6 !rounded-md !flex !items-center !justify-center !text-xs !font-medium ${
                              isSelected
                                ? "!bg-white !text-black"
                                : "!bg-gray-800 !text-gray-500"
                            }`}
                          >
                            {String.fromCharCode(65 + index)}
                          </div>
                          <span className="!text-sm !text-gray-300">
                            {option.text || option.content}
                          </span>
                        </div>
                      </button>
                    );
                  })}
                </div>
              ) : (
                <div>
                  {question.evaluationCriteria && (
                    <div className="bg-gray-800/50 border border-gray-700 rounded-lg p-3 mb-3">
                      <p className="text-xs text-gray-400">
                        <span className="font-medium text-gray-300">
                          Criteria:
                        </span>{" "}
                        {question.evaluationCriteria}
                      </p>
                    </div>
                  )}
                  <div className="border border-gray-800 rounded-lg overflow-hidden">
                    <CodeEditor
                      value={currentAnswer?.content || ""}
                      onChange={(value: string) =>
                        handleAnswerSelect(question._id, undefined, value)
                      }
                      language="javascript"
                      placeholder="Write your code here..."
                      height="250px"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="flex gap-2 pt-5 border-t border-gray-800">
              {currentQuestionIndex > 0 && (
                <Button
                  variant="text"
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex - 1)
                  }
                  className="!px-4 !py-2 !border !border-gray-700 !text-gray-400 !rounded-lg !text-sm !font-medium !hover:bg-gray-800"
                >
                  ← Previous
                </Button>
              )}

              {currentQuestionIndex < quizData.questions.length - 1 ? (
                <Button
                  onClick={() =>
                    setCurrentQuestionIndex(currentQuestionIndex + 1)
                  }
                  className="!ml-auto !px-4 !py-2 !bg-white !text-black !rounded-lg !text-sm !font-medium !hover:bg-gray-100"
                >
                  Next →
                </Button>
              ) : (
                <Button
                  variant="text"
                  onClick={handleSubmitQuiz}
                  disabled={isSubmittingQuiz}
                  className="!ml-auto !px-5 !py-2 !bg-emerald-500 !text-white !rounded-lg !text-sm !font-medium !hover:bg-emerald-600 !disabled:opacity-50 !disabled:cursor-not-allowed"
                >
                  {isSubmittingQuiz ? (
                    <span className="flex items-center gap-2">
                      <svg
                        className="animate-spin h-4 w-4 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Submitting...
                    </span>
                  ) : (
                    "Submit"
                  )}
                </Button>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}
