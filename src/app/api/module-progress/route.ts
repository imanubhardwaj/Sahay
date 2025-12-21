import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ModuleProgress from "@/models/ModuleProgress";
import Lesson from "@/models/Lesson";
import { getUserIdFromRequest, authenticateRequest } from "@/lib/auth";

// GET /api/module-progress - Get module progress for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    const moduleId = searchParams.get("moduleId");

    // Use authenticated user's ID if not provided, or validate that requested userId matches authenticated user
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only access their own progress
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Forbidden: You can only access your own progress" },
        { status: 403 }
      );
    }

    const query: Record<string, unknown> = { userId };
    if (moduleId) {
      query.moduleId = moduleId;
    }

    const progress = await ModuleProgress.find(query)
      .populate(
        "moduleId",
        "name description level duration points lessonsCount"
      )
      .populate("currentLessonId", "name order")
      .sort({ lastAccessedAt: -1 });

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    console.error("Error fetching module progress:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// POST /api/module-progress - Create or update module progress
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication
    const authenticatedUserId = await authenticateRequest(request);

    const body = await request.json();
    const { userId: requestedUserId, moduleId } = body;

    if (!moduleId) {
      return NextResponse.json(
        { error: "Module ID is required" },
        { status: 400 }
      );
    }

    // Use authenticated user's ID
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only create/update their own progress
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own progress" },
        { status: 403 }
      );
    }

    // Get total lessons in module
    const totalLessons = await Lesson.countDocuments({ moduleId });

    // Check if progress already exists
    let progress = await ModuleProgress.findOne({ userId, moduleId });

    if (progress) {
      // Update existing progress
      progress.lastAccessedAt = new Date();
      await progress.save();
    } else {
      // Create new progress
      progress = await ModuleProgress.create({
        userId,
        moduleId,
        totalLessons,
        status: "in_progress",
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      });
    }

    // Populate before returning
    await progress.populate(
      "moduleId",
      "name description level duration points"
    );
    await progress.populate("currentLessonId", "name order");

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    console.error("Error creating/updating module progress:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}

// PUT /api/module-progress - Update module progress
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication
    const authenticatedUserId = await authenticateRequest(request);

    const body = await request.json();
    const {
      userId: requestedUserId,
      moduleId,
      lessonId,
      completed = false,
    } = body;

    if (!moduleId) {
      return NextResponse.json(
        { error: "Module ID is required" },
        { status: 400 }
      );
    }

    // Use authenticated user's ID
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only update their own progress
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        { error: "Forbidden: You can only update your own progress" },
        { status: 403 }
      );
    }

    // Find or create progress
    let progress = await ModuleProgress.findOne({ userId, moduleId });

    if (!progress) {
      const totalLessons = await Lesson.countDocuments({ moduleId });
      progress = new ModuleProgress({
        userId,
        moduleId,
        totalLessons,
        status: "in_progress",
        startedAt: new Date(),
      });
    }

    // Update current lesson
    if (lessonId) {
      progress.currentLessonId = lessonId;
    }

    // Add to completed lessons if not already there
    if (completed && lessonId) {
      // Ensure completedLessons array exists
      if (!progress.completedLessons) {
        progress.completedLessons = [];
      }

      if (!progress.completedLessons.includes(lessonId)) {
        progress.completedLessons.push(lessonId);
      }

      // Calculate completion percentage
      const totalLessons = await Lesson.countDocuments({ moduleId });
      progress.totalLessons = totalLessons;
      progress.completionPercentage = Math.round(
        (progress.completedLessons.length / totalLessons) * 100
      );

      // Check if module is completed
      if (progress.completedLessons.length >= totalLessons) {
        progress.status = "completed";
        progress.completedAt = new Date();
      } else {
        progress.status = "in_progress";
      }
    }

    progress.lastAccessedAt = new Date();
    await progress.save();

    // Populate before returning
    await progress.populate(
      "moduleId",
      "name description level duration points"
    );
    await progress.populate("currentLessonId", "name order");

    return NextResponse.json({ progress }, { status: 200 });
  } catch (error) {
    console.error("Error updating module progress:", error);
    return NextResponse.json(
      { error: error instanceof Error ? error.message : "Unknown error" },
      { status: 500 }
    );
  }
}
