import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import ModuleProgress from "@/models/ModuleProgress";
import Quiz from "@/models/Quiz";
import { getUserIdFromRequest } from "@/lib/auth";

// GET - Get current lesson based on user's progress (SECURE - no order exposed to client)
export async function GET(request: NextRequest) {
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

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get("moduleId");
    const requestedUserId = searchParams.get("userId");

    // Use authenticated user's ID
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only access their own lessons
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only access your own lessons",
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

    // Get module with basic info
    const moduleDoc = await Module.findById(moduleId).lean();

    if (!moduleDoc) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    // Get user's progress - force read from primary database
    let moduleProgress = await ModuleProgress.findOne({ userId, moduleId })
      .read("primary")
      .exec();

    // If no progress exists, create initial progress
    if (!moduleProgress) {
      moduleProgress = await ModuleProgress.create({
        userId,
        moduleId,
        nextLessonOrder: 1,
        completedLessonCount: 0,
        completedLessons: [],
        completionPercentage: 0,
        pointsEarned: 0,
        status: "in_progress",
        startedAt: new Date(),
        lastAccessedAt: new Date(),
      });
    }

    console.log("[GET-LESSON] Loading lesson for user:", {
      userId,
      moduleId,
      nextLessonOrder: moduleProgress.nextLessonOrder,
      completedLessonCount: moduleProgress.completedLessonCount,
    });

    // Find the lesson by moduleId and nextLessonOrder (determined by backend)
    const lesson = await Lesson.findOne({
      moduleId,
      order: moduleProgress.nextLessonOrder,
    }).lean();

    if (!lesson) {
      // No more lessons - module might be complete
      const totalLessons = await Lesson.countDocuments({ moduleId });

      return NextResponse.json({
        success: true,
        data: {
          module: {
            _id: moduleDoc._id,
            name: moduleDoc.name,
            description: moduleDoc.description,
            totalLessons,
          },
          lesson: null,
          progress: {
            completedLessonCount: moduleProgress.completedLessonCount,
            completionPercentage: moduleProgress.completionPercentage,
            pointsEarned: moduleProgress.pointsEarned,
          },
          hasMoreLessons: false,
          message: "Module completed! No more lessons available.",
        },
      });
    }

    // Check if lesson has a quiz
    const associatedQuiz = await Quiz.findOne({ lessonId: lesson._id }).lean();

    // Prepare lesson data (WITHOUT order or internal IDs)
    const lessonData = {
      _id: lesson._id, // Lesson ID is OK to send (opaque identifier)
      title: lesson.name as string,
      type: lesson.type as string,
      duration: lesson.duration as number | undefined,
      points: lesson.points as number,
      hasQuiz: !!associatedQuiz,
      isCompleted:
        moduleProgress.completedLessons?.some(
          (id) => id.toString() === lesson._id.toString()
        ) || false,
      content:
        lesson.type === "Text" || lesson.type === "Code"
          ? (lesson.content as string)
          : undefined,
      contentArray:
        lesson.type === "Text" || lesson.type === "Code"
          ? (lesson.contentArray as string[] | undefined)
          : undefined,
    };

    // Get total lessons count
    const totalLessons = await Lesson.countDocuments({ moduleId });

    // Prepare response with module state and lesson data
    const response = {
      module: {
        _id: moduleDoc._id,
        name: moduleDoc.name as string,
        description: moduleDoc.description as string,
        level: moduleDoc.level as string,
        totalLessons,
      },
      lesson: lessonData,
      progress: {
        completedLessonCount: moduleProgress.completedLessonCount,
        completionPercentage: moduleProgress.completionPercentage,
        pointsEarned: moduleProgress.pointsEarned,
      },
      hasMoreLessons: true,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching lesson:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch lesson",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
