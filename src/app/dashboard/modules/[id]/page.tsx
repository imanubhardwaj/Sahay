"use client";

import { useState, useEffect } from "react";
import { useParams, useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";
import { DashboardLayout } from "@/components/layout/DashboardLayout";
import CodeEditor from "@/components/ui/CodeEditor";

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
      router.push("/login");
      return;
    }

    loadCurrentLesson();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, router, moduleId]);

  // Load current lesson based on user's progress (backend determines which lesson)
  const loadCurrentLesson = async () => {
    if (!user) return;

    try {
      setIsLoading(true);

      const response = await fetch(
        `/api/get-lesson?moduleId=${moduleId}&userId=${user._id}`
      );
      
      if (!response.ok) {
        console.error("Failed to load lesson");
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
      const response = await fetch(
        `/api/get-quiz?lessonId=${currentLesson._id}&userId=${user?._id}`
      );
      
      const data = await response.json();
      
      if (data.success && data.data) {
        setQuizData(data.data);
        setShowQuiz(true);
        setCurrentQuestionIndex(0);
        setUserAnswers([]);
        setShowResults(false);
      } else {
        console.error('Failed to load quiz:', data.error);
        alert(`Failed to load quiz: ${data.error}`);
      }
    } catch (error) {
      console.error('Error loading quiz:', error);
      alert('Error loading quiz. Please try again.');
    }
  };

  const handleAnswerSelect = (questionId: string, optionId?: string, content?: string) => {
    const newAnswers = [...userAnswers];
    const existingIndex = newAnswers.findIndex(a => a.questionId === questionId);

    const answer: UserAnswer = {
      questionId,
      ...(optionId && { optionId }),
      ...(content && { content })
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
      const response = await fetch("/api/submit-quiz", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          moduleId,
          lessonId: currentLesson._id,
          answers: userAnswers
        })
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
      // For content-only lessons, show a simple completion message
      setQuizResults({
        quizResults: {
          isPassed: true,
          earnedPoints: currentLesson.points || 0,
          totalPoints: currentLesson.points || 0,
          scorePercentage: 100,
          attempts: 1
        },
        feedback: "Lesson Completed Successfully! 🎉",
        questionResults: []
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
      
      // Call save-progress API to mark lesson as complete and advance
      const response = await fetch("/api/save-progress", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user._id,
          moduleId,
          lessonId: currentLesson._id
        })
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
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Refresh user to update points
      await refreshUser();
      
      // Load next lesson (backend will determine which one)
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
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-purple-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Loading module...</p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (!moduleData) {
    return (
      <DashboardLayout>
        <div className="max-w-4xl mx-auto p-6">
          <div className="text-center py-12">
            <h2 className="text-2xl font-bold text-gray-900 mb-4">Module not found</h2>
            <button 
              onClick={() => router.push("/dashboard/modules")}
              className="bg-purple-600 text-white px-6 py-2 rounded-lg hover:bg-purple-700"
            >
              Back to Modules
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="max-w-7xl mx-auto p-6">
        {/* Header */}
        <div className="mb-8">
            <button
            className="border border-gray-200 text-gray-900 hover:bg-gray-50 px-4 py-2 rounded-lg mb-4"
              onClick={() => router.push("/dashboard/modules")}
            >
              ← Back to Modules
            </button>
          
          <div className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white rounded-2xl p-8 shadow-lg">
            <h1 className="text-3xl font-bold mb-2">{moduleData.name}</h1>
            <p className="text-indigo-100 mb-6">{moduleData.description}</p>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{progress?.completionPercentage || 0}%</div>
                <div className="text-sm text-indigo-100">Completion</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{progress?.completedLessonCount || 0}/{moduleData.totalLessons}</div>
                <div className="text-sm text-indigo-100">Lessons</div>
              </div>
              <div className="bg-white/10 backdrop-blur-sm rounded-lg p-4">
                <div className="text-2xl font-bold">{progress?.pointsEarned || 0}</div>
                <div className="text-sm text-indigo-100">Points Earned</div>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-6">
              <div className="w-full bg-white/20 rounded-full h-3">
                <div
                  className="bg-white h-3 rounded-full transition-all duration-500"
                  style={{ width: `${progress?.completionPercentage || 0}%` }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Main Content */}
        {!hasMoreLessons ? (
          /* Module Completed */
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-6">🎉</div>
            <h2 className="text-3xl font-bold text-gray-900 mb-4">
              Module Completed!
            </h2>
            <p className="text-gray-600 mb-6">
              Congratulations! You&apos;ve completed all lessons in this module.
            </p>
            <p className="text-2xl font-bold text-purple-600 mb-8">
              Total Points: {progress?.pointsEarned || 0}
            </p>
            <button
              onClick={() => router.push("/dashboard/modules")}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-shadow"
            >
              Explore More Modules
            </button>
          </div>
        ) : showResults && quizResults ? (
          /* Quiz/Lesson Results */
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className={`text-center mb-8 p-6 rounded-xl ${quizResults.quizResults.isPassed ? 'bg-green-50' : 'bg-red-50'}`}>
              <div className="text-6xl mb-4">{quizResults.quizResults.isPassed ? '🎉' : '😔'}</div>
              <h2 className="text-3xl font-bold mb-2">
                {quizResults.feedback}
              </h2>
              <div className="text-xl font-semibold">
                Score: {quizResults.quizResults.earnedPoints} / {quizResults.quizResults.totalPoints} points
                ({quizResults.quizResults.scorePercentage}%)
              </div>
              {quizResults.quizResults.attempts > 1 && (
              <div className="text-gray-600 mt-2">
                Attempts: {quizResults.quizResults.attempts}
              </div>
              )}
            </div>

            {/* Question Results */}
            {quizResults.questionResults && quizResults.questionResults.length > 0 && (
            <div className="space-y-6 mb-8">
              <h3 className="text-2xl font-bold text-gray-900">Detailed Results</h3>
                {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
              {quizResults.questionResults.map((result: any, index: number) => (
                <div
                  key={result.questionId}
                  className={`border-2 rounded-xl p-6 ${
                    result.isCorrect === true
                      ? 'border-green-200 bg-green-50'
                      : result.isCorrect === false
                      ? 'border-red-200 bg-red-50'
                      : 'border-yellow-200 bg-yellow-50'
                  }`}
                >
                  <div className="flex items-start gap-3 mb-4">
                    <span className="text-2xl">
                      {result.isCorrect === true ? '✅' : result.isCorrect === false ? '❌' : '⏳'}
                    </span>
                    <div className="flex-1">
                      <h4 className="font-semibold text-gray-900 mb-2">
                        Question {index + 1}: {result.question}
                      </h4>
                      
                      {result.type === 'mcq' && result.options && (
                        <div className="space-y-2 mb-4">
                            {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                          {result.options.map((option: any, optIndex: number) => (
                            <div
                              key={optIndex}
                              className={`p-3 rounded-lg ${
                                option.isCorrect
                                  ? 'bg-green-100 border-2 border-green-500'
                                  : option.isSelected && !option.isCorrect
                                  ? 'bg-red-100 border-2 border-red-500'
                                  : 'bg-white'
                              }`}
                            >
                              {option.text}
                              {option.isCorrect && ' ✓ (Correct Answer)'}
                              {option.isSelected && !option.isCorrect && ' ✗ (Your Answer)'}
                            </div>
                          ))}
                        </div>
                      )}

                      {result.type === 'subjective' && (
                        <div className="mb-4">
                          <p className="text-sm text-gray-600 mb-2">Your Answer:</p>
                          <div className="bg-gray-900 text-green-400 p-4 rounded-lg font-mono text-sm overflow-x-auto">
                            <pre className="whitespace-pre-wrap">{result.userAnswer || 'No answer provided'}</pre>
                          </div>
                          {result.requiresManualGrading && (
                            <p className="text-sm text-yellow-600 mt-2">
                              ⏳ This answer requires manual grading
                            </p>
                          )}
                        </div>
                      )}

                      {result.explanation && (
                        <div className="bg-blue-50 p-4 rounded-lg">
                          <p className="text-sm font-semibold text-blue-900 mb-1">Explanation:</p>
                          <p className="text-sm text-blue-800">{result.explanation}</p>
                        </div>
                      )}

                      <div className="mt-2">
                        <span className="text-sm font-medium">
                          Points: {result.earnedPoints} / {result.points}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4">
                <button
                onClick={handleNextLesson}
                  className="flex-1 bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
                >
                  Continue to Next Lesson →
                </button>
              {currentLesson?.hasQuiz && (
                  <button
                  onClick={handleStartQuiz}
                  className="border-2 border-purple-600 text-purple-600 px-6 py-3 rounded-lg font-medium hover:bg-purple-50 transition-colors"
                >
                  Retake Quiz 🔄
                  </button>
              )}
            </div>
          </div>
        ) : showQuiz && quizData && quizData.questions ? (
          /* Quiz View */
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-8">
              <div className="flex justify-between items-center mb-4">
                <h2 className="text-2xl font-bold text-gray-900">Quiz Time!</h2>
                <span className="text-lg font-semibold text-purple-600">
                  Question {currentQuestionIndex + 1} / {quizData.questions.length}
                </span>
              </div>
              
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 h-2 rounded-full transition-all"
                  style={{
                    width: `${((currentQuestionIndex + 1) / quizData.questions.length) * 100}%`
                  }}
                />
              </div>
            </div>

            {(() => {
              const question = quizData.questions[currentQuestionIndex];
              const currentAnswer = userAnswers.find(a => a.questionId === question._id);

              return (
                <div>
                  <h3 className="text-xl font-semibold text-gray-900 mb-6">
                    {question.question}
                  </h3>

                  {question.type === 'mcq' && question.options ? (
                    <div className="space-y-3 mb-8">
                      {/* eslint-disable-next-line @typescript-eslint/no-explicit-any */}
                      {question.options.map((option: any, index: number) => (
                        <button
                          key={option._id}
                          onClick={() => handleAnswerSelect(question._id, option._id)}
                          className={`w-full text-left p-4 rounded-lg border-2 transition-all ${
                            currentAnswer?.optionId === option._id
                              ? 'border-purple-500 bg-purple-50'
                              : 'border-gray-200 hover:border-purple-300'
                          }`}
                        >
                          <span className="font-medium">{String.fromCharCode(65 + index)}.</span> {option.text}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <div className="mb-8">
                      <div className="mb-4">
                        <h4 className="text-lg font-semibold text-gray-900 mb-2">
                          {question.question}
                        </h4>
                        {question.evaluationCriteria && (
                          <div className="bg-blue-50 p-4 rounded-lg mb-4">
                            <p className="text-sm font-semibold text-blue-900 mb-1">Evaluation Criteria:</p>
                            <p className="text-sm text-blue-800">{question.evaluationCriteria}</p>
                          </div>
                        )}
                      </div>
                      <CodeEditor
                        value={currentAnswer?.content || ''}
                        onChange={(value) => handleAnswerSelect(question._id, undefined, value)}
                        language="typescript"
                        placeholder="Write your TypeScript code here..."
                        height="300px"
                      />
                    </div>
                  )}

                  <div className="flex gap-4">
                    {currentQuestionIndex > 0 && (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex - 1)}
                        className="border-2 border-gray-300 text-gray-700 px-6 py-3 rounded-lg hover:bg-gray-50"
                      >
                        ← Previous
                      </button>
                    )}
                    
                    {currentQuestionIndex < quizData.questions.length - 1 ? (
                      <button
                        onClick={() => setCurrentQuestionIndex(currentQuestionIndex + 1)}
                        className="ml-auto bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg hover:shadow-lg"
                      >
                        Next →
                      </button>
                    ) : (
                      <button
                        onClick={handleSubmitQuiz}
                        className="ml-auto bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg hover:shadow-lg"
                        disabled={userAnswers.length !== quizData.questions.length}
                      >
                        Submit Quiz 🎯
                      </button>
                    )}
                  </div>
                </div>
              );
            })()}
          </div>
        ) : currentLesson ? (
          /* Lesson Content View */
          <div className="bg-white rounded-2xl p-8 shadow-lg">
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <div>
                  <h2 className="text-3xl font-bold text-gray-900">
                    {currentLesson.title}
                  </h2>
                </div>
                <div className="flex items-center gap-4">
                  {currentLesson.isCompleted && (
                    <span className="bg-green-100 text-green-700 px-4 py-2 rounded-full font-semibold">
                      ✓ Completed
                    </span>
                  )}
                  <span className="bg-purple-100 text-purple-700 px-4 py-2 rounded-full font-semibold">
                    {currentLesson.points} pts
                  </span>
                </div>
              </div>
            </div>

            {/* Lesson Content */}
            {(currentLesson.type === 'Text' || currentLesson.type === 'Code') && currentLesson.content && (
              <div className="prose prose-lg max-w-none mb-8">
                <div className="bg-gray-50 rounded-xl p-6 whitespace-pre-line">
                  {currentLesson.content}
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-4 justify-end pt-6 border-t">
              {currentLesson.hasQuiz ? (
                      <button
                        onClick={handleStartQuiz}
                  className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                      Take Quiz 🎯
                    </button>
                  ) : (
                    <button
                      onClick={handleCompleteLesson}
                  className="bg-gradient-to-r from-green-500 to-emerald-600 text-white px-6 py-3 rounded-lg font-medium hover:shadow-lg transition-shadow"
                    >
                  Complete Lesson and Continue ✓
                    </button>
                )}
            </div>
          </div>
        ) : (
          /* No lesson available */
          <div className="bg-white rounded-2xl p-12 text-center shadow-lg">
            <div className="text-6xl mb-6">📚</div>
            <h2 className="text-2xl font-bold text-gray-900 mb-4">
              No Lesson Available
            </h2>
            <p className="text-gray-600 mb-6">
              There are no lessons available for this module at the moment.
            </p>
            <button
              onClick={() => router.push("/dashboard/modules")}
              className="bg-gradient-to-r from-indigo-500 to-purple-600 text-white px-8 py-3 rounded-lg hover:shadow-lg transition-shadow"
            >
              Back to Modules
            </button>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}
