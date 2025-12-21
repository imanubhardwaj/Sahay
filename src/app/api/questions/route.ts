import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CommunityQuestion from "@/models/CommunityQuestion";
import User from "@/models/User";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET /api/questions - Get all questions (requires auth)
export async function GET(request: NextRequest) {
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

    const questions = await CommunityQuestion.find({ deletedAt: null })
      .populate("askedBy", "firstName lastName email")
      .populate("answers.userId", "firstName lastName email")
      .populate("skillId", "name")
      .sort({ createdAt: -1 });

    return NextResponse.json(questions);
  } catch (error) {
    console.error("Error fetching questions:", error);
    return NextResponse.json(
      { error: "Failed to fetch questions" },
      { status: 500 }
    );
  }
}

// POST /api/questions - Create a new community question (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const questionData = await request.json();
    const { title, body, tags, askedBy, skillId } = questionData;

    if (!title || !body || !askedBy) {
      return NextResponse.json(
        { error: "Title, body, and askedBy are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(askedBy);
    if (!user) {
      return NextResponse.json({ error: "User not found" }, { status: 404 });
    }

    const question = new CommunityQuestion({
      title,
      body,
      tags: tags || [],
      askedBy,
      skillId: skillId || null,
      answers: [],
      upvotes: 0,
      downvotes: 0,
      views: 0,
      isResolved: false,
    });

    await question.save();

    // Populate the related data for the response
    await question.populate("askedBy", "firstName lastName email");
    await question.populate("skillId", "name");

    return NextResponse.json(question, { status: 201 });
  } catch (error) {
    console.error("Error creating question:", error);
    return NextResponse.json(
      { error: "Failed to create question" },
      { status: 500 }
    );
  }
}
