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
  // IMMEDIATE LOG - This should show up first
  process.stdout.write('\n\n');
  process.stdout.write('╔════════════════════════════════════════╗\n');
  process.stdout.write('║  [SUBMIT-QUIZ] ROUTE CALLED!          ║\n');
  process.stdout.write('╚════════════════════════════════════════╝\n');
  console.log('╔════════════════════════════════════════╗');
  console.log('║  [SUBMIT-QUIZ] ROUTE CALLED!          ║');
  console.log('╚════════════════════════════════════════╝');
  
  try {
    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    console.log('[SUBMIT-QUIZ] Authenticated user ID:', authenticatedUserId);
    
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    console.log('[SUBMIT-QUIZ] Database connected');

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

    console.log('[SUBMIT-QUIZ] Found questions:', quizQuestions.length);
    quizQuestions.forEach((q, idx) => {
      console.log(`[SUBMIT-QUIZ] Question ${idx + 1}:`, {
        id: q._id.toString(),
        type: q.type,
        typeValue: q.type,
        hasQuestionText: !!q.questionText,
      });
    });

    // Get lesson topics for MCQ suggestions
    const lessonTopics = lesson.contentArray || [];

    // Validate and grade answers
    console.log('========================================');
    console.log('[SUBMIT-QUIZ] 🎯 STARTING QUIZ EVALUATION');
    console.log('[SUBMIT-QUIZ] Total questions:', quizQuestions.length);
    console.log('[SUBMIT-QUIZ] Question types:', quizQuestions.map(q => ({ id: q._id, type: q.type })));
    console.log('========================================');
    
    const results = await Promise.all(
      quizQuestions.map(async (question) => {
        console.log(`[SUBMIT-QUIZ] Processing question ${question._id}, type: ${question.type}`);
        
        const userAnswer = answers.find(
          (a) => a.questionId === question._id.toString()
        );
        
        console.log(`[SUBMIT-QUIZ] User answer found:`, !!userAnswer);
        if (userAnswer) {
          console.log(`[SUBMIT-QUIZ] User answer has content:`, !!userAnswer.content);
          console.log(`[SUBMIT-QUIZ] User answer content length:`, (userAnswer.content || "").length);
        }

        if (!userAnswer) {
          return {
            questionId: question._id,
            question: question.questionText || question.question,
            type: question.type,
            points: question.points || 10,
            earnedPoints: 0,
            isCorrect: false,
            // SECURITY: Do not send correct answer to frontend
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
            // SECURITY: Do not send correct answer to frontend - only send user's answer
            userAnswer: evaluation.userAnswer,
            explanation: question.explanation,
            suggestedTopics: evaluation.suggestedTopics,
            options: question.options?.map(
              (opt: { id?: string; content?: string }) => ({
                text: opt.content,
                // SECURITY: Only mark if selected, don't reveal correct answer
                isSelected: opt.id === userAnswer.optionId,
              })
            ),
          };
        }

        // For subjective and code questions - use Gemini API
        console.log(`[SUBMIT-QUIZ] Checking question type: ${question.type}`);
        console.log(`[SUBMIT-QUIZ] Is code or subjective?`, question.type === "subjective" || question.type === "code");
        
        if (question.type === "subjective" || question.type === "code") {
          console.log('');
          console.log('========================================');
          console.log('[SUBMIT-QUIZ] 🔵🔵🔵 TRIGGERING GEMINI API 🔵🔵🔵');
          console.log('[SUBMIT-QUIZ] Question type:', question.type);
          console.log('[SUBMIT-QUIZ] Question ID:', question._id.toString());
          console.log('[SUBMIT-QUIZ] Question text length:', (question.questionText || "").length);
          console.log('[SUBMIT-QUIZ] User answer length:', (userAnswer.content || "").length);
          console.log('[SUBMIT-QUIZ] User answer preview:', (userAnswer.content || "").substring(0, 100));
          console.log('========================================');
          console.log('');
          
          try {
            const evaluation = await evaluateSubjectiveOrCode(
              question.questionText || "",
              userAnswer.content || "",
              question.answer?.content || "", // Only used for backend evaluation, NOT sent to frontend
              question.type,
              question.points || 10
            );

            console.log('[SUBMIT-QUIZ] ✅ GEMINI EVALUATION COMPLETE:', {
              questionId: question._id,
              isCorrect: evaluation.isCorrect,
              earnedPoints: evaluation.earnedPoints,
              hasFeedback: !!evaluation.feedback,
              feedback: evaluation.feedback,
            });
            console.log('========================================');

            return {
              questionId: question._id,
              question: question.questionText || question.answer?.content,
              type: question.type,
              points: question.points || 10,
              earnedPoints: evaluation.earnedPoints,
              isCorrect: evaluation.isCorrect,
              // SECURITY: Do not send correct answer to frontend - only send user's answer
              userAnswer: evaluation.userAnswer,
              feedback: evaluation.feedback,
              improvements: evaluation.improvements,
              explanation: question.explanation,
              evaluationCriteria: question.evaluationCriteria,
            };
          } catch (geminiError) {
            console.error('[SUBMIT-QUIZ] ❌❌❌ GEMINI ERROR:', geminiError);
            console.error('[SUBMIT-QUIZ] Error details:', {
              error: String(geminiError),
              message: geminiError instanceof Error ? geminiError.message : 'Unknown error',
              stack: geminiError instanceof Error ? geminiError.stack : undefined,
            });
            console.log('========================================');
            
            // Return error result
            return {
              questionId: question._id,
              question: question.questionText || question.answer?.content,
              type: question.type,
              points: question.points || 10,
              earnedPoints: 0,
              isCorrect: null,
              userAnswer: userAnswer.content || "",
              feedback: `Evaluation error: ${geminiError instanceof Error ? geminiError.message : 'Unknown error'}. Please check server logs.`,
              improvements: ['Check server console for detailed error logs'],
              explanation: question.explanation,
              evaluationCriteria: question.evaluationCriteria,
            };
          }
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
        : `You scored ${scorePercentage}%. You need at least 80% to unlock the next lesson. Review the material and try again!`,
      message: isPassed 
        ? 'Quiz passed! Click "Next Lesson" to continue.'
        : `Quiz not passed. You need 80% to proceed. Current score: ${scorePercentage}%`,
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
