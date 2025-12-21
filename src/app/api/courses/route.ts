import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Course from "@/models/Course";
import User from "@/models/User";
import WorkingProfessional from "@/models/WorkingProfessional";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET /api/courses - Get all courses (requires auth)
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
    const level = searchParams.get("level");
    const category = searchParams.get("category");
    const tags = searchParams.get("tags");
    const limit = parseInt(searchParams.get("limit") || "20");
    const page = parseInt(searchParams.get("page") || "1");

    const query: Record<string, unknown> = { deletedAt: null };
    
    if (createdBy) query.createdBy = createdBy;
    if (level) query.level = level;
    if (category) query.category = category;
    if (tags) query.tags = { $in: tags.split(",") };

    const skip = (page - 1) * limit;

    const courses = await Course.find(query)
      .populate("createdBy", "firstName lastName email avatar userType")
      .populate("skills", "name")
      .populate("modules", "title description duration")
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });

    const total = await Course.countDocuments(query);

    return NextResponse.json({
      courses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit)
      }
    });
  } catch (error) {
    console.error("Error fetching courses:", error);
    return NextResponse.json(
      { error: "Failed to fetch courses" },
      { status: 500 }
    );
  }
}

// POST /api/courses - Create a new course (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    await authenticateRequest(request);
    
    await connectDB();
    
    const courseData = await request.json();
    const { createdBy, ...otherData } = courseData;

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

    const course = new Course({
      ...otherData,
      createdBy,
      totalModules: otherData.modules?.length || 0,
      estimatedDuration: otherData.modules?.reduce(
        (sum: number, module: { duration: number }) => sum + (module.duration || 0),
        0
      ) || 0
    });

    await course.save();

    // Populate the creator data for the response
    await course.populate("createdBy", "firstName lastName email avatar userType");

    return NextResponse.json(course, { status: 201 });
  } catch (error) {
    console.error("Error creating course:", error);
    return NextResponse.json(
      { error: "Failed to create course" },
      { status: 500 }
    );
  }
}
