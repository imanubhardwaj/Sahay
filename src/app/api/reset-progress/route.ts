import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ModuleProgress from "@/models/ModuleProgress";
import { getUserIdFromRequest } from "@/lib/auth";

// POST - Reset user progress for a module (requires auth)
export async function POST(request: NextRequest) {
  try {
    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    await connectDB();

    const body = await request.json();
    const { userId: requestedUserId, moduleId } = body;

    // Use authenticated user's ID
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only reset their own progress
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only reset your own progress",
        },
        { status: 403 }
      );
    }

    if (!moduleId) {
      return NextResponse.json(
        { success: false, error: "moduleId is required" },
        { status: 400 }
      );
    }

    const moduleProgress = await ModuleProgress.findOne({ userId, moduleId });

    if (!moduleProgress) {
      return NextResponse.json(
        { success: false, error: "Module progress not found" },
        { status: 404 }
      );
    }

    // Reset everything
    moduleProgress.nextLessonOrder = 1;
    moduleProgress.completedLessonCount = 0;
    moduleProgress.completedLessons = [];
    moduleProgress.pointsEarned = 0;
    moduleProgress.completionPercentage = 0;
    moduleProgress.status = "not_started";

    await moduleProgress.save();

    return NextResponse.json({
      success: true,
      message: "Progress reset successfully",
      data: {
        nextLessonOrder: 1,
        completedLessonCount: 0,
        completedLessons: 0,
      },
    });
  } catch (error) {
    console.error("Error resetting progress:", error);
    return NextResponse.json(
      { success: false, error: "Failed to reset progress" },
      { status: 500 }
    );
  }
}
