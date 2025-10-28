import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Module from "@/models/Module";
import Skill from "@/models/Skill";

// GET /api/modules - Get all modules
export async function GET(request: NextRequest) {
  try {
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

    return NextResponse.json({
      modules,
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

// POST /api/modules - Create a new module
export async function POST(request: NextRequest) {
  try {
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
      points: points || 0
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
