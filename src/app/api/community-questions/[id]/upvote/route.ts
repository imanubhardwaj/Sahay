import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CommunityQuestion from "@/models/CommunityQuestion";

// POST /api/community-questions/[id]/upvote - Upvote a question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    await connectDB();
    const { id } = await params;

    const question = await CommunityQuestion.findByIdAndUpdate(
      id,
      { $inc: { upvotes: 1 } },
      { new: true }
    )
      .populate("askedBy", "firstName lastName email")
      .populate("skillId", "name");

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    return NextResponse.json({ success: true, question });
  } catch (error) {
    console.error("Error upvoting question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upvote question" },
      { status: 500 }
    );
  }
}

