import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET /api/quizzes/[id] - Get a specific quiz (requires auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { id } = await params;
    const quiz = await Quiz.findById(id)
      .populate("createdBy", "firstName lastName email avatar userType")
      .populate("moduleId", "title description")
      .populate(
        "questions",
        "questionText options correctAnswer points questionType"
      );

    if (!quiz || quiz.deletedAt) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error fetching quiz:", error);
    return NextResponse.json(
      { error: "Failed to fetch quiz" },
      { status: 500 }
    );
  }
}

// PUT /api/quizzes/[id] - Update a specific quiz (requires auth)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const updates = await request.json();

    // Recalculate totals if questions are updated
    if (updates.questions) {
      updates.totalQuestions = updates.questions.length;
      updates.totalPoints = updates.questions.reduce(
        (sum: number, q: { points: number }) => sum + (q.points || 0),
        0
      );
    }

    const { id } = await params;
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { ...updates, updatedAt: new Date() },
      { new: true }
    )
      .populate("createdBy", "firstName lastName email avatar userType")
      .populate("moduleId", "title description");

    if (!quiz || quiz.deletedAt) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json(quiz);
  } catch (error) {
    console.error("Error updating quiz:", error);
    return NextResponse.json(
      { error: "Failed to update quiz" },
      { status: 500 }
    );
  }
}

// DELETE /api/quizzes/[id] - Soft delete a specific quiz (requires auth)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const { id } = await params;
    const quiz = await Quiz.findByIdAndUpdate(
      id,
      { deletedAt: new Date() },
      { new: true }
    );

    if (!quiz) {
      return NextResponse.json({ error: "Quiz not found" }, { status: 404 });
    }

    return NextResponse.json({ message: "Quiz deleted successfully" });
  } catch (error) {
    console.error("Error deleting quiz:", error);
    return NextResponse.json(
      { error: "Failed to delete quiz" },
      { status: 500 }
    );
  }
}
