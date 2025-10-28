import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Quiz from "@/models/Quiz";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";

// GET /api/quizzes - Get all quizzes (without questions)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get("createdBy");
    const moduleId = searchParams.get("moduleId");
    const lessonId = searchParams.get("lessonId");
    const difficulty = searchParams.get("difficulty");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };

    if (createdBy) query.createdBy = createdBy;
    if (moduleId) query.moduleId = moduleId;
    if (lessonId) query.lessonId = lessonId;
    if (difficulty) query.difficulty = difficulty;

    const skip = (page - 1) * limit;

    const quizzes = await Quiz.find(query)
      .skip(skip)
      .limit(limit)
      .sort({ lessonOrder: 1 });

    const total = await Quiz.countDocuments(query);

    return NextResponse.json({
      quizzes,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching quizzes:", error);
    return NextResponse.json(
      { error: "Failed to fetch quizzes" },
      { status: 500 }
    );
  }
}

// POST /api/quizzes - Create a new quiz
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const quizData = await request.json();
    const { createdBy, ...otherData } = quizData;

    if (!createdBy) {
      return NextResponse.json(
        { error: "Creator ID is required" },
        { status: 400 }
      );
    }

    // Verify creator exists
    let creator = await User.findById(createdBy);
    if (!creator) {
      creator = await WorkingProfessional.findById(createdBy);
    }

    if (!creator) {
      return NextResponse.json({ error: "Creator not found" }, { status: 404 });
    }

    const quiz = new Quiz({
      ...otherData,
      createdBy,
      totalQuestions: otherData.questions?.length || 0,
      totalPoints:
        otherData.questions?.reduce(
          (sum: number, q: { points: number }) => sum + (q.points || 0),
          0
        ) || 0,
    });

    await quiz.save();

    // Populate the creator data for the response
    await quiz.populate(
      "createdBy",
      "firstName lastName email avatar userType"
    );

    return NextResponse.json(quiz, { status: 201 });
  } catch (error) {
    console.error("Error creating quiz:", error);
    return NextResponse.json(
      { error: "Failed to create quiz" },
      { status: 500 }
    );
  }
}
