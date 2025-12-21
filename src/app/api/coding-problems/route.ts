import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import CodingProblem from "@/models/CodingProblem";
import UserCodingProgress from "@/models/UserCodingProgress";
import { authenticateRequest } from "@/lib/auth";

// GET - Get coding problems with optional filters
export async function GET(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const { searchParams } = new URL(request.url);
    const difficulty = searchParams.get("difficulty");
    const category = searchParams.get("category");
    const problemId = searchParams.get("id");

    // Get single problem
    if (problemId) {
      const problem = await CodingProblem.findById(problemId);
      if (!problem) {
        return NextResponse.json(
          { success: false, error: "Problem not found" },
          { status: 404 }
        );
      }

      // Get user's progress for this problem
      const progress = await UserCodingProgress.findOne({
        userId,
        problemId,
      });

      return NextResponse.json({
        success: true,
        data: {
          ...problem.toObject(),
          userProgress: progress,
        },
      });
    }

    // Build filter query
    const filter: Record<string, string> = {};
    if (difficulty) filter.difficulty = difficulty;
    if (category) filter.category = category;

    const problems = await CodingProblem.find(filter)
      .select("-solution")
      .sort({ difficulty: 1, title: 1 });

    // Get user's progress for all problems
    const userProgress = await UserCodingProgress.find({ userId });
    const progressMap = new Map(
      userProgress.map((p) => [p.problemId.toString(), p])
    );

    const problemsWithProgress = problems.map((problem) => ({
      ...problem.toObject(),
      userStatus: progressMap.get(problem._id.toString())?.status || "unsolved",
    }));

    // Get unique categories
    const categories = await CodingProblem.distinct("category");

    // Get stats
    const stats = {
      total: problems.length,
      solved: userProgress.filter((p) => p.status === "solved").length,
      attempted: userProgress.filter((p) => p.status === "attempted").length,
      easy: problems.filter((p) => p.difficulty === "easy").length,
      medium: problems.filter((p) => p.difficulty === "medium").length,
      hard: problems.filter((p) => p.difficulty === "hard").length,
    };

    return NextResponse.json({
      success: true,
      data: problemsWithProgress,
      categories,
      stats,
    });
  } catch (error) {
    console.error("Error fetching coding problems:", error);
    return NextResponse.json(
      { success: false, error: "Failed to fetch problems" },
      { status: 500 }
    );
  }
}

// POST - Create a new coding problem (admin only for now)
export async function POST(request: NextRequest) {
  try {
    const userId = await authenticateRequest(request);
    if (!userId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const {
      title,
      description,
      difficulty,
      category,
      tags,
      starterCode,
      testCases,
      hints,
      solution,
      points,
    } = body;

    if (!title || !description || !category || !testCases?.length) {
      return NextResponse.json(
        { success: false, error: "Missing required fields" },
        { status: 400 }
      );
    }

    const problem = await CodingProblem.create({
      title,
      description,
      difficulty: difficulty || "easy",
      category,
      tags: tags || [],
      starterCode: starterCode || {},
      testCases,
      hints: hints || [],
      solution,
      points: points || 10,
    });

    return NextResponse.json({
      success: true,
      message: "Problem created successfully",
      data: problem,
    });
  } catch (error) {
    console.error("Error creating coding problem:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create problem" },
      { status: 500 }
    );
  }
}

