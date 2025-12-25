import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import Quiz from "@/models/Quiz";
import Question from "@/models/Question";
import ModuleProgress from "@/models/ModuleProgress";
import LessonProgress from "@/models/LessonProgress";
import { getUserIdFromRequest } from "@/lib/auth";
import { evaluateMCQ, evaluateSubjectiveOrCode } from "@/lib/quiz-evaluation";
import { QUIZ_PASSING_PERCENTAGE } from "@/lib/points-economy";

interface UserAnswer {
  questionId: string;
  optionId?: string; // For MCQ questions
  content?: string; // For subjective questions
}

interface QuizSubmission {
  userId: string;
  moduleId: string;
  lessonId: string;
  answers: UserAnswer[];
}

// POST - Submit quiz and get results (validates on backend, does NOT advance progress)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body: QuizSubmission = await request.json();
    const { userId: requestedUserId, moduleId, lessonId, answers } = body;

    // Use authenticated user's ID
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only submit their own quizzes
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only submit your own quizzes",
        },
        { status: 403 }
      );
    }

    if (!moduleId || !lessonId || !answers) {
      return NextResponse.json(
        {
          success: false,
          error: "moduleId, lessonId, and answers are required",
        },
        { status: 400 }
      );
    }

    // Find the lesson by lessonId
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Verify the lesson belongs to the module (security check)
    if (lesson.moduleId.toString() !== moduleId) {
      return NextResponse.json(
        { success: false, error: "Lesson does not belong to this module" },
        { status: 400 }
      );
    }

    // Check if this lesson has an associated quiz
    const associatedQuiz = await Quiz.findOne({ lessonId: lesson._id });

    if (!associatedQuiz) {
      return NextResponse.json(
        {
          success: false,
          error: "This lesson does not have an associated quiz",
        },
        { status: 400 }
      );
    }

    // Get module progress - force read from primary to bypass cache
    const moduleProgress = await ModuleProgress.findOne({ userId, moduleId })
      .read("primary")
      .exec();

    if (!moduleProgress) {
      return NextResponse.json(
        { success: false, error: "Module progress not found" },
        { status: 404 }
      );
    }

    console.log("[SUBMIT-QUIZ] Validating quiz submission:", {
      userId,
      moduleId,
      lessonId: lesson._id.toString(),
      answerCount: answers.length,
    });

    // Get all quiz questions
    const quizQuestions = await Question.find({ lessonId: lesson._id }).sort({
      order: 1,
    });

    // Get lesson topics for MCQ suggestions
    const lessonTopics = lesson.contentArray || [];

    // Validate and grade answers
    const results = await Promise.all(
      quizQuestions.map(async (question) => {
        const userAnswer = answers.find(
          (a) => a.questionId === question._id.toString()
        );

        if (!userAnswer) {
          return {
            questionId: question._id,
            question: question.questionText || question.question,
            type: question.type,
            points: question.points || 10,
            earnedPoints: 0,
            isCorrect: false,
            correctAnswer:
              question.type === "mcq"
                ? question.options?.find(
                    (opt: { id?: string }) => opt.id === question.answer?.optionId
                  )?.content || question.answer?.content
                : question.answer?.content || null,
            userAnswer: null,
            explanation: question.explanation,
            suggestedTopics: question.type === "mcq" ? lessonTopics.slice(0, 2) : [],
          };
        }

        // For MCQ questions - use evaluation function
        if (question.type === "mcq") {
          const evaluation = evaluateMCQ(
            question.questionText || "",
            userAnswer.optionId,
            question.answer?.optionId || "",
            question.options || [],
            lessonTopics,
            question.points || 10
          );

          return {
            questionId: question._id,
            question: question.questionText || question.answer?.content,
            type: question.type,
            points: question.points || 10,
            earnedPoints: evaluation.earnedPoints,
            isCorrect: evaluation.isCorrect,
            correctAnswer: evaluation.correctAnswer,
            userAnswer: evaluation.userAnswer,
            explanation: question.explanation,
            suggestedTopics: evaluation.suggestedTopics,
            options: question.options?.map(
              (opt: { id?: string; content?: string }) => ({
                text: opt.content,
                isCorrect: opt.id === question.answer?.optionId,
                isSelected: opt.id === userAnswer.optionId,
              })
            ),
          };
        }

        // For subjective and code questions - use OpenAI API
        if (question.type === "subjective" || question.type === "code") {
          const evaluation = await evaluateSubjectiveOrCode(
            question.questionText || "",
            userAnswer.content || "",
            question.answer?.content || "",
            question.type,
            question.points || 10
          );

          return {
            questionId: question._id,
            question: question.questionText || question.answer?.content,
            type: question.type,
            points: question.points || 10,
            earnedPoints: evaluation.earnedPoints,
            isCorrect: evaluation.isCorrect,
            correctAnswer: evaluation.correctAnswer,
            userAnswer: evaluation.userAnswer,
            feedback: evaluation.feedback,
            improvements: evaluation.improvements,
            explanation: question.explanation,
            evaluationCriteria: question.evaluationCriteria,
          };
        }

        return null;
      })
    );

    // Filter out null results
    const validResults = results.filter(Boolean);

    // Calculate total score
    const totalPoints = validResults.reduce((sum, r) => sum + (r?.points || 0), 0);
    const earnedPoints = validResults.reduce(
      (sum, r) => sum + (r?.earnedPoints || 0),
      0
    );
    const scorePercentage =
      totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    
    // REQUIREMENT: 80% passing score to unlock next lesson
    const passingScore = QUIZ_PASSING_PERCENTAGE;
    const isPassed = scorePercentage >= passingScore;

    // Create or update lesson progress (track attempts, but don't mark as completed yet)
    let lessonProgress = await LessonProgress.findOne({
      userId,
      lessonId: lesson._id,
    });

    if (!lessonProgress) {
      lessonProgress = new LessonProgress({
        userId,
        lessonId: lesson._id,
        moduleId,
        status: "in_progress", // Don't mark as completed yet
        pointsEarned: earnedPoints,
        attempts: 1,
        lastAttemptAt: new Date(),
      });
    } else {
      lessonProgress.attempts += 1;
      lessonProgress.lastAttemptAt = new Date();
      // Update points if this attempt earned more
      if (earnedPoints > lessonProgress.pointsEarned) {
        lessonProgress.pointsEarned = earnedPoints;
      }
    }

    await lessonProgress.save();

    // Prepare response (NO progress advancement here)
    // Progress to next lesson is ONLY allowed if isPassed is true (80%+)
    const response = {
      quizResults: {
        totalQuestions: quizQuestions.length,
        totalPoints,
        earnedPoints,
        scorePercentage,
        isPassed,
        passingScore,
        attempts: lessonProgress.attempts,
        canProceed: isPassed, // Explicit flag for frontend
      },
      questionResults: validResults,
      feedback: isPassed
        ? "🎉 Congratulations! You passed the quiz with " + scorePercentage + "%!"
        : `You scored ${scorePercentage}%. You need at least ${passingScore}% to unlock the next lesson. Review the material and try again!`,
      message: isPassed 
        ? 'Quiz passed! Click "Next Lesson" to continue.'
        : `Quiz not passed. You need ${passingScore}% to proceed. Current score: ${scorePercentage}%`,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error submitting quiz:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to submit quiz",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
