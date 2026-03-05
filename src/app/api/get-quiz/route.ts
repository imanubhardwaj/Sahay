import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import ModuleProgress from "@/models/ModuleProgress";
import Quiz from "@/models/Quiz";
import Question from "@/models/Question";
import { getUserIdFromRequest } from "@/lib/auth";

// GET - Get quiz questions for a lesson (secure - doesn't expose correct answers)
export async function GET(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 },
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get("lessonId");
    const quizId = searchParams.get("quizId");
    const requestedUserId = searchParams.get("userId");

    // Use authenticated user's ID
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only access their own quizzes
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only access your own quizzes",
        },
        { status: 403 },
      );
    }

    if (!lessonId && !quizId) {
      return NextResponse.json(
        { success: false, error: "lessonId or quizId is required" },
        { status: 400 },
      );
    }

    let lesson;
    let associatedQuiz;

    if (quizId) {
      // Fetch by quizId - find Quiz first, then get lesson
      associatedQuiz = await Quiz.findById(quizId);
      if (!associatedQuiz) {
        return NextResponse.json(
          { success: false, error: "Quiz not found" },
          { status: 404 },
        );
      }
      lesson = await Lesson.findById(associatedQuiz.lessonId);
    } else {
      // Fetch by lessonId
      lesson = await Lesson.findById(lessonId);
    }

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 },
      );
    }

    // Get module progress - ensure we get the latest from DB (bypass cache)
    const moduleProgress = await ModuleProgress.findOne({
      userId,
      moduleId: lesson.moduleId,
    })
      .read("primary") // Force read from primary database
      .lean()
      .exec();

    if (!moduleProgress) {
      return NextResponse.json(
        {
          success: false,
          error: "You must start the module before accessing this quiz",
        },
        { status: 403 }
      );
    }

    // Check if this lesson has an associated quiz (only when not already fetched by quizId)
    if (!associatedQuiz) {
      associatedQuiz = await Quiz.findOne({ lessonId: lesson._id });
    }

    if (!associatedQuiz) {
      return NextResponse.json(
        {
          success: false,
          error: "This lesson does not have an associated quiz",
        },
        { status: 404 },
      );
    }

    // Get quiz questions
    const quizQuestions = await Question.find({ lessonId: lesson._id }).sort({
      order: 1,
    });

    if (quizQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: "No questions found for this quiz" },
        { status: 404 },
      );
    }

    // Transform questions to hide correct answers
    const questions = quizQuestions.map((q) => ({
      _id: q._id,
      question: q.questionText, // Use the question text field
      type: q.type,
      points: q.points || 10,
      // For MCQ questions, include options but WITHOUT marking correct ones
      options: q.options?.map((opt: { id?: string; content?: string }) => ({
        _id: opt.id,
        text: opt.content,
        // DO NOT include 'isCorrect' field
      })),
      // For subjective questions, include evaluation criteria
      evaluationCriteria:
        q.type === "subjective" ? q.evaluationCriteria : undefined,
      explanation: undefined, // Don't send explanation until after submission
    }));

    const response = {
      quiz: {
        _id: associatedQuiz._id,
        lessonId:
          associatedQuiz.lessonId?.toString?.() || lesson._id.toString(),
        moduleId:
          associatedQuiz.moduleId?.toString?.() ||
          lesson.moduleId?.toString?.(),
        name: associatedQuiz.name,
        description: associatedQuiz.description,
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
        duration: associatedQuiz.duration,
        points: associatedQuiz.points,
      },
      questions: questions,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch quiz",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 },
    );
  }
}
