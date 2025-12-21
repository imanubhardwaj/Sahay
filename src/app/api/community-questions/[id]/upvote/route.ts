import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CommunityQuestion from "@/models/CommunityQuestion";
import { getUserIdFromRequest } from "@/lib/auth";

// POST /api/community-questions/[id]/upvote - Upvote a question
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // Require authentication
    const userId = await getUserIdFromRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();
    const { id } = await params;

    // Find the question
    const question = await CommunityQuestion.findById(id);

    if (!question) {
      return NextResponse.json(
        { success: false, error: "Question not found" },
        { status: 404 }
      );
    }

    // Check if user already upvoted
    const hasUpvoted = question.upvotedBy?.some(
      (upvoterId: any) => upvoterId.toString() === userId
    );

    if (hasUpvoted) {
      return NextResponse.json(
        { success: false, error: "You have already upvoted this question" },
        { status: 400 }
      );
    }

    // Add user to upvotedBy array and increment upvotes
    question.upvotedBy = question.upvotedBy || [];
    question.upvotedBy.push(userId);
    question.upvotes = (question.upvotes || 0) + 1;
    await question.save();

    // Populate and return
    await question.populate("askedBy", "firstName lastName email");
    await question.populate("skillId", "name");

    // Convert upvotedBy to array of string IDs
    const questionObj = question.toObject();
    const responseData = {
      ...questionObj,
      upvotedBy: (question.upvotedBy || []).map((id: { toString: () => string }) => id.toString())
    };

    return NextResponse.json({ success: true, question: responseData });
  } catch (error) {
    console.error("Error upvoting question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to upvote question" },
      { status: 500 }
    );
  }
}

