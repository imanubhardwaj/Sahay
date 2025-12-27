"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import { CodeEditor } from "@/components/ui/CodeEditor";
import LessonContentRenderer from "@/components/ui/LessonContentRenderer";
import { Button } from "../../../../../packages/ui";
import {
  extractCodingChallenge,
  getModuleLanguage,
  createProblemDescription,
} from "@/lib/lesson-utils";

interface ModuleData {
  _id: string;
  name: string;
  description: string;
  level: string;
  totalLessons: number;
}

interface LessonData {
  _id: string;
  title: string;
  type: string;
  duration?: number;
  points: number;
  hasQuiz: boolean;
  isCompleted: boolean;
  content?: string;
  contentArray?: string[];
}

interface ProgressData {
  completedLessonCount: number;
  completionPercentage: number;
  pointsEarned: number;
}

interface UserAnswer {
  questionId: string;
  optionId?: string;
  content?: string;
}

export default function SecureModulePage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  const params = useParams();
  const moduleId = params.id as string;

  const [moduleData, setModuleData] = useState<ModuleData | null>(null);
  const [currentLesson, setCurrentLesson] = useState<LessonData | null>(null);
  const [progress, setProgress] = useState<ProgressData | null>(null);
  const [hasMoreLessons, setHasMoreLessons] = useState(true);
  const [isLoading, setIsLoading] = useState(true);

  // Quiz state
  const [showQuiz, setShowQuiz] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quizData, setQuizData] = useState<any>(null);
  const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0);
  const [userAnswers, setUserAnswers] = useState<UserAnswer[]>([]);

  // Results state
  const [showResults, setShowResults] = useState(false);
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [quizResults, setQuizResults] = useState<any>(null);

  useEffect(() => {
    if (!user) {
      router.push(
        `/login?redirect=${encodeURIComponent(
          `/dashboard/modules/${moduleId}`
        )}`
      );
      return;
    }

    loadCurrentLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, moduleId]);

  const loadCurrentLesson = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const { getAuthHeader } = await import("@/lib/token-storage");
      const authHeader = getAuthHeader();
      const headers: HeadersInit = {};
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch(
        `/api/get-lesson?moduleId=${moduleId}&userId=${user._id}`,
        {
          headers,
          credentials: "include",
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        console.error("Failed to load lesson:", errorData);
        return;
      }

      const data = await response.json();
      console.log("Loaded lesson data:", data.data);

      setModuleData(data.data.module);
      setCurrentLesson(data.data.lesson);
      setProgress(data.data.progress);
      setHasMoreLessons(data.data.hasMoreLessons);

      // Reset quiz/results state when loading new lesson
      setShowQuiz(false);
      setShowResults(false);
      setUserAnswers([]);
    } catch (error) {
      console.error("Error loading lesson:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleStartQuiz = async () => {
    if (!currentLesson || !currentLesson.hasQuiz) return;

    try {
      const { getAuthHeader } = await import("@/lib/token-storage");
      const authHeader = getAuthHeader();
      const headers: HeadersInit = {};
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch(
        `/api/get-quiz?lessonId=${currentLesson._id}&userId=${user?._id}`,
        {
          headers,
          credentials: "include",
        }
      );

      const data = await response.json();

      if (data.success && data.data) {
        setQuizData(data.data);
        setShowQuiz(true);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setShowResults(false);
      } else {
        console.error("Failed to load quiz:", data.error);
        alert(`Failed to load quiz: ${data.error}`);
      }
    } catch (error) {
      console.error("Error loading quiz:", error);
      alert("Error loading quiz. Please try again.");
    }
  };

  const handleAnswerSelect = (
    questionId: string,
    optionId?: string,
    content?: string
  ) => {
    const newAnswers = [...userAnswers];
    const existingIndex = newAnswers.findIndex(
      (a) => a.questionId === questionId
    );

    const answer: UserAnswer = {
      questionId,
      ...(optionId && { optionId }),
      ...(content && { content }),
    };

    if (existingIndex >= 0) {
      newAnswers[existingIndex] = answer;
    } else {
      newAnswers.push(answer);
    }

    setUserAnswers(newAnswers);
  };

  const handleSubmitQuiz = async () => {
    if (!user || !currentLesson) return;

    try {
      const { getAuthHeader } = await import("@/lib/token-storage");
      const authHeader = getAuthHeader();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          moduleId,
          lessonId: currentLesson._id,
          answers: userAnswers,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to submit quiz");
        return;
      }

      const result = await response.json();
      console.log("Quiz results:", result.data);
      setQuizResults(result.data);
      setShowQuiz(false);
      setShowResults(true);
    } catch (error) {
      console.error("Error submitting quiz:", error);
      alert("An error occurred while submitting the quiz");
    }
  };

  const handleCompleteLesson = async () => {
    if (!user || !currentLesson) return;

    try {
      setQuizResults({
        quizResults: {
          isPassed: true,
          earnedPoints: currentLesson.points || 0,
          totalPoints: currentLesson.points || 0,
          scorePercentage: 100,
          attempts: 1,
        },
        feedback: "Lesson completed!",
        questionResults: [],
      });
      setShowResults(true);
    } catch (error) {
      console.error("Error completing lesson:", error);
      alert("An error occurred while completing the lesson");
    }
  };

  const handleNextLesson = async () => {
    if (!user || !currentLesson) return;

    try {
      console.log("[NEXT] Saving progress and moving to next lesson");

      const { getAuthHeader } = await import("@/lib/token-storage");
      const authHeader = getAuthHeader();
      const headers: HeadersInit = { "Content-Type": "application/json" };
      if (authHeader) {
        headers["Authorization"] = authHeader;
      }

      const response = await fetch("/api/save-progress", {
        method: "POST",
        headers,
        credentials: "include",
        body: JSON.stringify({
          userId: user._id,
          moduleId,
          lessonId: currentLesson._id,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        alert(errorData.error || "Failed to save progress");
        return;
      }

      const result = await response.json();
      console.log("[NEXT] Progress saved:", result.data);

      // Hide results
      setShowResults(false);
      setQuizResults(null);

      // Wait for database replication
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Refresh user to update points
      await refreshUser();

      // Load next lesson
      await loadCurrentLesson();
    } catch (error) {
      console.error("Error advancing to next lesson:", error);
      alert("An error occurred while advancing to the next lesson");
    }
  };

  if (isLoading) {
    return (
      <DashboardLayout>
        <div className="flex items-center justify-center min-h-[60vh]">
          <div className="text-center">
            <div className="animate-spin rounded-full h-8 w-8 border border-gray-700 border-t-white mx-auto mb-3"></div>
            <p className="text-sm text-gray-500">Loading lesson data...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!moduleData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-16">
            <div className="w-14 h-14 bg-gray-900 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-800">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M12 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-white mb-2">
              Module not found
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              The module you&apos;re looking for doesn&apos;t exist.
            </p>
            <Button
              variant="text"
              onClick={() => router.push("/dashboard/explore")}
              className="!px-5 !py-2 !bg-white !text-black !hover:text-black !hover:bg-white !cursor-pointer !rounded-lg !text-sm !font-medium !hover:bg-gray-100 !transition-colors"
            >
              Back to Explore
            </Button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-4xl mx-auto px-4 py-6 pb-32 relative">
        {/* Navigation */}
        <Button
          onClick={() => router.push("/dashboard/explore")}
          className="!inline-flex !items-center !gap-1.5 !text-gray-500 !hover:text-white !mb-6 !transition-colors !text-sm !cursor-pointer"
        >
          <svg
            className="w-4 h-4"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={1.5}
              d="M15 19l-7-7 7-7"
            />
          </svg>
          Back
        </Button>

        {/* Main Content */}
        {!hasMoreLessons ? (
          /* Module Completed */
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 text-center">
            <div className="w-14 h-14 bg-emerald-500/10 rounded-full flex items-center justify-center mx-auto mb-5 border border-emerald-500/20">
              <svg
                className="w-7 h-7 text-emerald-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
            </div>
            <h2 className="text-xl font-semibold text-white mb-2">
              Module Complete!
            </h2>
            <p className="text-sm text-gray-500 mb-3">
              You&apos;ve finished all lessons.
            </p>
            <p className="text-base font-medium text-amber-400 mb-6">
              {progress?.pointsEarned || 0} points earned
            </p>
            <Button
              variant="text"
              onClick={() => router.push("/dashboard/explore")}
              className="!px-6 !py-2.5 !bg-white !text-black !rounded-lg !text-sm !font-medium !hover:bg-gray-100 !transition-colors"
            >
              Explore More
            </Button>
          </div>
        ) : showResults && quizResults ? (
          /* Quiz/Lesson Results */
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            <div
              className={`p-8 text-center ${
                quizResults.quizResults.isPassed
                  ? "bg-emerald-500/5"
                  : "bg-rose-500/5"
              }`}
            >
              <div
                className={`w-14 h-14 mx-auto mb-4 rounded-full flex items-center justify-center ${
                  quizResults.quizResults.isPassed
                    ? "bg-emerald-500/10 border border-emerald-500/20"
                    : "bg-rose-500/10 border border-rose-500/20"
                }`}
              >
                {quizResults.quizResults.isPassed ? (
                  <svg
                    className="w-7 h-7 text-emerald-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M5 13l4 4L19 7"
                    />
                  </svg>
                ) : (
                  <svg
                    className="w-7 h-7 text-rose-400"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M6 18L18 6M6 6l12 12"
                    />
                  </svg>
                )}
              </div>
              <h2 className="text-lg font-semibold text-white mb-1">
                {quizResults.feedback}
              </h2>
              <p className="text-sm text-gray-400">
                Score:{" "}
                <span className="text-white font-medium">
                  {quizResults.quizResults.earnedPoints}
                </span>{" "}
                / {quizResults.quizResults.totalPoints} points
              </p>
            </div>

            {/* Question Results */}
            {quizResults.questionResults &&
              quizResults.questionResults.length > 0 && (
                <div className="p-5 space-y-3 border-t border-gray-800">
                  <h3 className="text-sm font-medium text-gray-400 mb-3">
                    Results
                  </h3>
                  {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                  {quizResults.questionResults.map(
                    (result: any, index: number) => (
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
                              {result.question}
                            </h4>

                            {result.type === "mcq" && result.options && (
                              <div className="space-y-1.5 mb-2">
                                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                                {result.options.map(
                                  (option: any, optIndex: number) => (
                                    <div
                                      key={optIndex}
                                      className={`px-3 py-1.5 rounded-lg text-xs ${
                                        option.isCorrect
                                          ? "bg-emerald-500/10 border border-emerald-500/20 text-emerald-400"
                                          : option.isSelected &&
                                            !option.isCorrect
                                          ? "bg-rose-500/10 border border-rose-500/20 text-rose-400"
                                          : "bg-gray-800 border border-gray-700 text-gray-400"
                                      }`}
                                    >
                                      {option.text}
                                    </div>
                                  )
                                )}
                              </div>
                            )}

                            {result.type === "subjective" && (
                              <div className="mb-2">
                                <p className="text-[10px] text-gray-500 mb-1">
                                  Your answer:
                                </p>
                                <div className="bg-gray-950 text-gray-300 p-3 rounded-lg font-mono text-xs overflow-x-auto border border-gray-800">
                                  <pre className="whitespace-pre-wrap">
                                    {result.userAnswer || "No answer"}
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
                              {result.earnedPoints}/{result.points} pts
                            </div>
                          </div>
                        </div>
                      </div>
                    )
                  )}
                </div>
              )}

            {/* Action Buttons */}
            <div className="p-5 pt-0 flex flex-col sm:flex-row gap-2">
              {/* Only show Continue button if quiz is passed (score >= 80%) */}
              {quizResults.quizResults.isPassed && (
                <Button
                  variant="text"
                  onClick={handleNextLesson}
                  className="!flex-1 !px-5 !py-2.5 !bg-white !text-black !rounded-lg !text-sm !font-medium !hover:bg-gray-100 !transition-colors"
                >
                  Continue →
                </Button>
              )}
              {currentLesson?.hasQuiz && (
                <Button
                  variant="text"
                  onClick={handleStartQuiz}
                  className={`px-5 py-2.5 border border-gray-700 text-gray-300 rounded-lg text-sm font-medium hover:bg-gray-800 transition-colors ${
                    quizResults.quizResults.isPassed ? '' : '!flex-1'
                  }`}
                >
                  {quizResults.quizResults.isPassed ? 'Retake' : 'Retake Quiz'}
                </Button>
              )}
            </div>
          </div>
        ) : showQuiz && quizData && quizData.questions ? (
          /* Quiz View */
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Quiz Header */}
            <div className="p-5 border-b border-gray-800">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-base font-semibold text-white">Quiz</h2>
                  <p className="text-xs text-gray-500 mt-0.5">
                    Test your knowledge
                  </p>
                </div>
                <div className="text-right">
                  <div className="text-lg font-bold text-white">
                    {currentQuestionIndex + 1}/{quizData.questions.length}
                  </div>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-4">
                <div className="w-full bg-gray-800 rounded-full h-1">
                  <div
                    className="bg-white h-1 rounded-full transition-all duration-300"
                    style={{
                      width: `${
                        ((currentQuestionIndex + 1) /
                          quizData.questions.length) *
                        100
                      }%`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Quiz Content */}
            <div className="p-5">
              {(() => {
                const question = quizData.questions[currentQuestionIndex];
                const currentAnswer = userAnswers.find(
                  (a) => a.questionId === question._id
                );

                return (
                  <div>
                    {/* Question */}
                    <div className="mb-6">
                      <div className="flex items-start gap-3 mb-5">
                        <div className="flex-shrink-0 w-8 h-8 bg-gray-800 text-gray-400 rounded-lg flex items-center justify-center text-sm font-medium border border-gray-700">
                          {currentQuestionIndex + 1}
                        </div>
                        <div className="flex-1">
                          <div className="mb-3">
                            <h3 className="text-sm font-medium text-white leading-relaxed mb-2">
                              {question.questionText || question.question}
                            </h3>
                            {question.points && (
                              <p className="text-[10px] text-gray-500">
                                {question.points} points
                              </p>
                            )}
                          </div>
                          {/* Show full question content in a formatted box for better readability */}
                          {(question.questionText || question.question) && 
                           (question.type === 'code' || question.type === 'subjective') && (
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

                      {/* MCQ Options */}
                      {question.type === "mcq" && question.options ? (
                        <div className="space-y-2">
                          {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {question.options.map(
                            (option: any, index: number) => {
                              const isSelected =
                                currentAnswer?.optionId === option._id;
                              return (
                                <button
                                  key={option._id || option.id}
                                  onClick={() =>
                                    handleAnswerSelect(
                                      question._id,
                                      option._id || option.id
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
                            }
                          )}
                        </div>
                      ) : (
                        /* Subjective/Coding Question */
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
                                handleAnswerSelect(
                                  question._id,
                                  undefined,
                                  value
                                )
                              }
                              language="javascript"
                              placeholder="Write your code here..."
                              height="250px"
                            />
                          </div>
                        </div>
                      )}
                    </div>

                    {/* Navigation Buttons */}
                    <div className="flex gap-2 pt-5 border-t border-gray-800">
                      {currentQuestionIndex > 0 && (
                        <Button
                          variant="text"
                          onClick={() =>
                            setCurrentQuestionIndex(currentQuestionIndex - 1)
                          }
                          className="!px-4 !py-2 !border !border-gray-700 !text-gray-400 !rounded-lg !text-sm !font-medium !hover:bg-gray-800 !transition-colors"
                        >
                          ← Previous
                        </Button>
                      )}

                      {currentQuestionIndex < quizData.questions.length - 1 ? (
                        <Button
                          onClick={() =>
                            setCurrentQuestionIndex(currentQuestionIndex + 1)
                          }
                          className="!ml-auto !px-4 !py-2 !bg-white !text-black !rounded-lg !text-sm !font-medium !hover:bg-gray-100 !transition-colors"
                        >
                          Next →
                        </Button>
                      ) : (
                        <Button
                          variant="text"
                          onClick={handleSubmitQuiz}
                          className="!ml-auto !px-5 !py-2 !bg-emerald-500 !text-white !rounded-lg !text-sm !font-medium !hover:bg-emerald-600 !transition-colors !disabled:opacity-50 !disabled:cursor-not-allowed"
                          disabled={
                            userAnswers.length !== quizData.questions.length
                          }
                        >
                          Submit
                        </Button>
                      )}
                    </div>
                  </div>
                );
              })()}
            </div>
          </div>
        ) : currentLesson ? (
          /* Lesson Content View */
          <div className="bg-gray-900 rounded-xl border border-gray-800 overflow-hidden">
            {/* Lesson Header */}
            <div className="p-5 border-b border-gray-800">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <div className="flex-1">
                  <h1 className="text-lg font-semibold text-white mb-2">
                    {currentLesson.title}
                  </h1>
                  <div className="flex flex-wrap items-center gap-2">
                    {currentLesson.isCompleted && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/10 text-emerald-400 rounded-full text-[10px] font-medium border border-emerald-500/20">
                        <svg
                          className="w-3 h-3"
                          fill="currentColor"
                          viewBox="0 0 20 20"
                        >
                          <path
                            fillRule="evenodd"
                            d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                            clipRule="evenodd"
                          />
                        </svg>
                        Done
                      </span>
                    )}
                    <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-amber-500/10 text-amber-400 rounded-full text-[10px] font-medium border border-amber-500/20">
                      <svg
                        className="w-3 h-3"
                        fill="currentColor"
                        viewBox="0 0 20 20"
                      >
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                      </svg>
                      {currentLesson.points} pts
                    </span>
                    {currentLesson.duration && (
                      <span className="text-[10px] text-gray-500 flex items-center gap-1">
                        <svg
                          className="w-3 h-3"
                          fill="none"
                          viewBox="0 0 24 24"
                          stroke="currentColor"
                        >
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth={1.5}
                            d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                          />
                        </svg>
                        {currentLesson.duration} min
                      </span>
                    )}
                  </div>
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            <div className="p-5">
              {(currentLesson.type === "Text" ||
                currentLesson.type === "Code") &&
                currentLesson.content && (
                  <LessonContentRenderer
                    content={currentLesson.content}
                    topics={currentLesson.contentArray || []}
                  />
                )}
            </div>

            {/* Action Buttons */}
            <div className="p-5 pt-0 flex items-center justify-between">
              {/* Practice button - shows when lesson content has code blocks or exercises */}
              {(currentLesson.type === "Code" ||
                currentLesson.content?.includes("```") ||
                currentLesson.content?.toLowerCase().includes("exercise") ||
                currentLesson.content?.includes("Coding Challenge")) && (
                <Button
                  onClick={() => {
                    // Extract coding challenge from lesson content
                    const challenge = currentLesson.content
                      ? extractCodingChallenge(currentLesson.content)
                      : null;

                    // Get module language
                    const language = moduleData
                      ? getModuleLanguage(moduleData.name)
                      : "javascript";

                    // Navigate to practice page with challenge data
                    const params = new URLSearchParams();
                    if (challenge) {
                      params.set("fromLesson", "true");
                      params.set("lessonId", currentLesson._id);
                      params.set("lessonTitle", currentLesson.title);
                      if (challenge.task1) params.set("task1", challenge.task1);
                      if (challenge.task2) params.set("task2", challenge.task2);
                      params.set("language", language);
                      if (moduleData) {
                        params.set("moduleName", moduleData.name);
                      }
                    }

                    router.push(
                      `/dashboard/practice${
                        params.toString() ? `?${params.toString()}` : ""
                      }`
                    );
                  }}
                  className="!px-4 !py-2 !bg-gray-800 !text-white !rounded-lg !text-sm !font-medium !hover:bg-gray-700 !transition-colors !inline-flex !items-center !gap-2 !border !border-gray-700"
                >
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4"
                    />
                  </svg>
                  Practice Code
                </Button>
              )}
              <div className="flex gap-3 ml-auto">
                {currentLesson.hasQuiz ? (
                  <Button
                    onClick={handleStartQuiz}
                    className="!px-5 !py-2.5 !bg-white !text-black !rounded-lg !text-sm !font-medium !hover:bg-gray-100 !transition-colors !inline-flex !items-center !gap-2"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z"
                      />
                    </svg>
                    Take Quiz
                  </Button>
                ) : (
                  <Button
                    onClick={handleCompleteLesson}
                    className="!px-5 !py-2.5 !bg-emerald-500 !text-white !rounded-lg !text-sm !font-medium !hover:bg-emerald-600 !transition-colors !inline-flex !items-center !gap-2 !hover:text-white !hover:bg-emerald-600 !cursor-pointer"
                  >
                    <svg
                      className="w-4 h-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth={1.5}
                        d="M5 13l4 4L19 7"
                      />
                    </svg>
                    Complete
                  </Button>
                )}
              </div>
            </div>
          </div>
        ) : (
          /* No lesson available */
          <div className="bg-gray-900 rounded-xl border border-gray-800 p-10 text-center">
            <div className="w-14 h-14 bg-gray-800 rounded-full flex items-center justify-center mx-auto mb-4 border border-gray-700">
              <svg
                className="w-6 h-6 text-gray-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"
                />
              </svg>
            </div>
            <h2 className="text-lg font-medium text-white mb-2">
              No Lesson Available
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              Check back soon for new content.
            </p>
            <Button
              onClick={() => router.push("/dashboard/explore")}
              className="!px-5 !py-2 !bg-white !text-black !rounded-lg !text-sm !font-medium !hover:bg-gray-100 !transition-colors"
            >
              Back to Explore
            </Button>
          </div>
        )}
        {/* Module Header - Fixed at Bottom */}
        {moduleData && (
          <div className="fixed bottom-0 left-0 right-0 bg-gray-900 border-t border-gray-800 shadow-lg w-full">
            <div className="w-full mx-auto px-10 py-4 max-w-6xl">
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 ml-36">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1.5">
                    <h1 className="text-sm font-semibold text-white truncate">
                      {moduleData.name}
                    </h1>
                    <span
                      className={`px-2 py-0.5 rounded-full text-[10px] font-medium uppercase tracking-wider flex-shrink-0 ${
                        moduleData.level === "Beginner"
                          ? "bg-emerald-500/10 text-emerald-400 border border-emerald-500/20"
                          : moduleData.level === "Intermediate"
                          ? "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                          : "bg-rose-500/10 text-rose-400 border border-rose-500/20"
                      }`}
                    >
                      {moduleData.level}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 truncate">
                    {moduleData.description}
                  </p>
                </div>
              </div>

              {/* Progress Bar */}
              <div className="mt-3 pt-3 border-t border-gray-800 ml-36">
                <div className="flex items-center justify-between text-xs mb-2">
                  <span className="text-gray-500">Module Progress</span>
                  <span className="text-white font-medium">
                    {progress?.completionPercentage || 0}%
                  </span>
                </div>
                <div className="w-full bg-gray-800 rounded-full h-1.5">
                  <div
                    className="bg-white h-1.5 rounded-full transition-all duration-500"
                    style={{
                      width: `${progress?.completionPercentage || 0}%`,
                    }}
                  />
                </div>
                <div className="flex items-center justify-between mt-2 text-[10px] text-gray-500">
                  <span>
                    {progress?.completedLessonCount || 0}/
                    {moduleData.totalLessons} lessons
                  </span>
                  <span className="text-amber-400">
                    {progress?.pointsEarned || 0} pts earned
                  </span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
