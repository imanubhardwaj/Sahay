import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CommunityQuestion from "@/models/CommunityQuestion";
import User from "@/models/User";
import mongoose from "mongoose";

// POST /api/community-questions/[id]/comment - Add a comment to a question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;
    const { content, userId } = await request.json();

    if (!content || !userId) {
      return NextResponse.json(
        { success: false, error: "Content and userId are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(userId);
    if (!user) {
      return NextResponse.json(
        { success: false, error: "User not found" },
        { status: 404 }
      );
    }

    const answer = {
      content,
      userId: new mongoose.Types.ObjectId(userId),
      createdAt: new Date(),
      upvotes: 0,
      downvotes: 0
    };

    const question = await CommunityQuestion.findByIdAndUpdate(
      id,
      { $push: { answers: answer } },
      { new: true }
    )
      .populate("askedBy", "firstName lastName email")
      .populate("answers.userId", "firstName lastName email")
      .populate("skillId", "name");

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Error adding comment:", error);
    return NextResponse.json(
      { success: false, error: "Failed to add comment" },
      { status: 500 }
    );
  }
}

