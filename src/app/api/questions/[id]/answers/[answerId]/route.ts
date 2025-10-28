import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Question from "@/models/Question";

// PUT /api/questions/[id]/answers/[answerId] - Update an answer
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> }
) {
  try {
    await connectDB();

    const { text, userId } = await request.json();
    const { id: questionId, answerId } = await params;

    if (!text) {
      return NextResponse.json({ error: "Text is required" }, { status: 400 });
    }

    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    // Check if user is the author of the answer
    if (answer.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to edit this answer" },
        { status: 403 }
      );
    }

    answer.text = text;
    await question.save();

    // Populate the user data for the response
    await question.populate("askedBy", "name email avatar");
    await question.populate("answers.userId", "name email avatar");

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error updating answer:", error);
    return NextResponse.json(
      { error: "Failed to update answer" },
      { status: 500 }
    );
  }
}

// DELETE /api/questions/[id]/answers/[answerId] - Delete an answer
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string; answerId: string }> }
) {
  try {
    await connectDB();

    const { userId } = await request.json();
    const { id: questionId, answerId } = await params;

    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    const answer = question.answers.id(answerId);
    if (!answer) {
      return NextResponse.json({ error: "Answer not found" }, { status: 404 });
    }

    // Check if user is the author of the answer
    if (answer.userId.toString() !== userId) {
      return NextResponse.json(
        { error: "Unauthorized to delete this answer" },
        { status: 403 }
      );
    }

    question.answers.pull(answerId);
    await question.save();

    // Populate the user data for the response
    await question.populate("askedBy", "name email avatar");
    await question.populate("answers.userId", "name email avatar");

    return NextResponse.json(question);
  } catch (error) {
    console.error("Error deleting answer:", error);
    return NextResponse.json(
      { error: "Failed to delete answer" },
      { status: 500 }
    );
  }
}
