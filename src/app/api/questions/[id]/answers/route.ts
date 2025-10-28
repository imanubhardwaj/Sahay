import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Question from "@/models/Question";
import User from "@/models/User";

// POST /api/questions/[id]/answers - Add an answer to a question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();

    const { text, userId } = await request.json();
    const { id: questionId } = await params;

    if (!text || !userId) {
      return NextResponse.json(
        { error: "Text and userId are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    // Find the question
    const question = await Question.findById(questionId);
    if (!question) {
      return NextResponse.json(
        { error: "Question not found" },
        { status: 404 }
      );
    }

    // Add the answer
    const answer = {
      userId,
      text,
      upvotes: 0,
      createdAt: new Date(),
    };

    // Ensure answers array exists
    if (!question.answers) {
      question.answers = [];
    }

    question.answers.push(answer);
    await question.save();

    // Populate the user data for the response
    await question.populate("askedBy", "name email avatar");
    await question.populate("answers.userId", "name email avatar");

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error adding answer:", error);
    return NextResponse.json(
      { error: "Failed to add answer" },
      { status: 500 }
    );
  }
}
