import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import UserQuizSubmission from "@/models/UserQuizSubmission";

// POST /api/quizzes/[id]/analyze - Analyze quiz performance
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { userId } = await request.json();

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const { id } = await params;
    // Get quiz details
    const quiz = await Quiz.findById(id);
    if (!quiz || quiz.deletedAt) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    // Get user's submission
    const submission = await UserQuizSubmission.findOne({
      quizId: id,
      userId,
    }).populate("answers.questionId", "questionText correctAnswer points");

    if (!submission) {
      return NextResponse.json(
        { error: "No submission found for this quiz" },
        { status: 404 }
      );
    }

    // Calculate analysis
    const totalQuestions = quiz.totalQuestions;
    const correctAnswers = submission.answers.filter(
      (answer: { questionId: { correctAnswer: string }; userAnswer: string }) =>
        answer.questionId &&
        answer.userAnswer === answer.questionId.correctAnswer
    ).length;

    const totalPoints = quiz.totalPoints;
    const earnedPoints = submission.answers.reduce(
      (
        sum: number,
        answer: {
          questionId: { points: number; correctAnswer: string };
          userAnswer: string;
        }
      ) => {
        if (
          answer.questionId &&
          answer.userAnswer === answer.questionId.correctAnswer
        ) {
          return sum + (answer.questionId.points || 0);
        }
        return sum;
      },
      0
    );

    const percentage =
      totalQuestions > 0 ? (correctAnswers / totalQuestions) * 100 : 0;
    const score = totalPoints > 0 ? (earnedPoints / totalPoints) * 100 : 0;

    // Determine performance level
    let performanceLevel = "Poor";
    if (score >= 90) performanceLevel = "Excellent";
    else if (score >= 80) performanceLevel = "Good";
    else if (score >= 70) performanceLevel = "Average";
    else if (score >= 60) performanceLevel = "Below Average";

    // Get question-wise analysis
    const questionAnalysis = submission.answers.map(
      (answer: {
        questionId: {
          _id: string;
          questionText: string;
          correctAnswer: string;
          points: number;
        };
        userAnswer: string;
      }) => ({
        questionId: answer.questionId?._id,
        questionText: answer.questionId?.questionText,
        userAnswer: answer.userAnswer,
        correctAnswer: answer.questionId?.correctAnswer,
        isCorrect:
          answer.questionId &&
          answer.userAnswer === answer.questionId.correctAnswer,
        points: answer.questionId?.points || 0,
        earnedPoints:
          answer.questionId &&
          answer.userAnswer === answer.questionId.correctAnswer
            ? answer.questionId.points || 0
            : 0,
      })
    );

    const analysis = {
      quizId: id,
      userId,
      totalQuestions,
      correctAnswers,
      incorrectAnswers: totalQuestions - correctAnswers,
      totalPoints,
      earnedPoints,
      percentage: Math.round(percentage * 100) / 100,
      score: Math.round(score * 100) / 100,
      performanceLevel,
      timeSpent: submission.timeSpent,
      submittedAt: submission.submittedAt,
      questionAnalysis,
    };

    return NextResponse.json(analysis);
  } catch (error) {
    console.error("Error analyzing quiz:", error);
    return NextResponse.json(
      { error: "Failed to analyze quiz" },
      { status: 500 }
    );
  }
}
