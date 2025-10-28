import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Project from "@/models/Project";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";
import Skill from "@/models/Skill";

// GET /api/projects - Get all projects
export async function GET(request: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(request.url);
    const createdBy = searchParams.get("createdBy");
    const category = searchParams.get("category");
    const status = searchParams.get("status");
    const tags = searchParams.get("tags");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };
    
    if (createdBy) query.createdBy = createdBy;
    if (category) query.category = category;
    if (status) query.status = status;
    if (tags) query.tags = { $in: tags.split(",") };

    const skip = (page - 1) * limit;

    const projects = await Project.find(query)
      .populate("createdBy", "firstName lastName email avatar userType")
      .populate("skills", "name")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Project.countDocuments(query);

    return NextResponse.json({
      projects,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching projects:", error);
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    );
  }
}

// POST /api/projects - Create a new project
export async function POST(request: NextRequest) {
  try {
    await connectDB();
    
    const projectData = await request.json();
    const { createdBy, ...otherData } = projectData;

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
      return NextResponse.json(
        { error: "Creator not found" },
        { status: 404 }
      );
    }

    const project = new Project({
      ...otherData,
      createdBy,
      views: 0,
      likes: 0
    });

    await project.save();

    // Populate the creator data for the response
    await project.populate("createdBy", "firstName lastName email avatar userType");

    return NextResponse.json(project, { status: 201 });
  } catch (error) {
    console.error("Error creating project:", error);
    return NextResponse.json(
      { error: "Failed to create project" },
      { status: 500 }
    );
  }
}
