import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Module from "@/models/Module";
import Skill from "@/models/Skill";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET /api/modules - Get all modules (requires authentication)
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

    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get("createdBy");
    const courseId = searchParams.get("courseId");
    const difficulty = searchParams.get("difficulty");
    const status = searchParams.get("status");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };

    if (createdBy) query.createdBy = createdBy;
    if (courseId) query.courseId = courseId;
    if (difficulty) query.difficulty = difficulty;
    if (status) query.status = status;

    const skip = (page - 1) * limit;

    const modules = await Module.find(query)
      .populate("skillId", "name description")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Module.countDocuments(query);

    // Calculate total points for each module (module points + lesson points)
    const modulesWithTotalPoints = await Promise.all(
      modules.map(async (module) => {
        const moduleObj = module.toObject();
        
        // Get all lessons for this module to calculate total lesson points
        const Lesson = (await import("@/models/Lesson")).default;
        const lessons = await Lesson.find({ moduleId: module._id }).select("points");
        
        const totalLessonPoints = lessons.reduce((sum, lesson) => sum + (lesson.points || 0), 0);
        const totalPoints = (module.points || 0) + totalLessonPoints;
        
        return {
          ...moduleObj,
          totalPoints,
          totalLessonPoints,
          lessonsCount: lessons.length || module.lessonsCount || 0,
          icon: module.icon,
          image: module.image,
        };
      })
    );

    return NextResponse.json({
      modules: modulesWithTotalPoints,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error("Error fetching modules:", error);
    return NextResponse.json(
      { error: "Failed to fetch modules" },
      { status: 500 }
    );
  }
}

// POST /api/modules - Create a new module (requires authentication)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);

    await connectDB();

    const moduleData = await request.json();
    const { name, description, skillId, duration, points } = moduleData;

    if (!name || !description || !skillId) {
      return NextResponse.json(
        { error: "Name, description, and skill ID are required" },
        { status: 400 }
      );
    }

    // Verify skill exists
    const skill = await Skill.findById(skillId);
    if (!skill) {
      return NextResponse.json({ error: "Skill not found" }, { status: 404 });
    }

    const newModule = new Module({
      name,
      description,
      skillId,
      duration: duration || 0,
      points: points || 0,
    });

    await newModule.save();

    // Populate the skill data for the response
    await newModule.populate("skillId", "name description");

    return NextResponse.json(newModule, { status: 201 });
  } catch (error) {
    console.error("Error creating module:", error);
    return NextResponse.json(
      { error: "Failed to create module" },
      { status: 500 }
    );
  }
}
