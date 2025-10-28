import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CommunityQuestion from "@/models/CommunityQuestion";
import User from "@/models/User";

// GET /api/community-questions - Get all community questions
export async function GET() {
  try {
    await connectDB();

    const questions = await CommunityQuestion.find({ 
      deletedAt: null,
      askedBy: { $ne: null } // Filter out questions with null askedBy
    })
      .populate("askedBy", "firstName lastName email")
      .populate("answers.userId", "firstName lastName email")
      .populate("skillId", "name")
      .sort({ createdAt: -1 });

    // Filter out any questions where askedBy is still null after population
    const validQuestions = questions.filter(q => q.askedBy !== null);

    return NextResponse.json({ success: true, questions: validQuestions });
  } catch (error) {
    console.error("Error fetching community questions:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch community questions" },
      { status: 500 }
    );
  }
}

// POST /api/community-questions - Create a new community question
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const questionData = await request.json();
    const { title, body, tags, askedBy, skillId } = questionData;

    if (!title || !body || !askedBy) {
      return NextResponse.json(
        { success: false, error: "Title, body, and askedBy are required" },
        { status: 400 }
      );
    }

    // Verify user exists
    const user = await User.findById(askedBy);
    if (!user) {
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 });
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
      isResolved: false
    });

    await question.save();

    // Populate the related data for the response
    await question.populate("askedBy", "firstName lastName email");
    await question.populate("skillId", "name");

    return NextResponse.json({ success: true, question }, { status: 201 });
  } catch (error) {
    console.error("Error creating community question:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create community question" },
      { status: 500 }
    );
  }
}
