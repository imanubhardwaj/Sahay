import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import ModuleProgress from "@/models/ModuleProgress";
import Module from "@/models/Module";
import Lesson from "@/models/Lesson";
import { getUserIdFromRequest } from "@/lib/auth";

// GET - Get module state for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    // Require authentication
    const authenticatedUserId = await getUserIdFromRequest(request);
    if (!authenticatedUserId) {
      return NextResponse.json(
        { success: false, error: "Authentication required" },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const requestedUserId = searchParams.get("userId");
    const moduleId = searchParams.get("moduleId");

    if (!moduleId) {
      return NextResponse.json(
        { success: false, error: "moduleId is required" },
        { status: 400 }
      );
    }

    // Use authenticated user's ID if not provided
    const userId = requestedUserId || authenticatedUserId;

    // Security: Ensure user can only access their own module state
    if (userId !== authenticatedUserId) {
      return NextResponse.json(
        {
          success: false,
          error: "Forbidden: You can only access your own module state",
        },
        { status: 403 }
      );
    }

    // Find or create module progress (force read from primary to bypass cache)
    let moduleProgress = await ModuleProgress.findOne({ userId, moduleId })
      .read("primary")
      .exec();

    console.log("[MODULE-STATE] Fetched progress:", {
      userId,
      moduleId,
      nextLessonOrder: moduleProgress?.nextLessonOrder,
      completedLessonCount: moduleProgress?.completedLessonCount,
      status: moduleProgress?.status,
    });

    if (!moduleProgress) {
      // Create new progress if doesn't exist
      const moduleDoc = await Module.findById(moduleId);
      if (!moduleDoc) {
        return NextResponse.json(
          { success: false, error: "Module not found" },
          { status: 404 }
        );
      }

      moduleProgress = await ModuleProgress.create({
        userId,
        moduleId,
        status: "not_started",
        nextLessonOrder: 1,
        completedLessonCount: 0,
        pointsEarned: 0,
        completionPercentage: 0,
        startedAt: new Date(),
      });
    }

    // Ensure nextLessonOrder is valid (should be at least 1)
    if (
      moduleProgress.nextLessonOrder < 1 ||
      isNaN(moduleProgress.nextLessonOrder)
    ) {
      moduleProgress.nextLessonOrder = 1;
      await moduleProgress.save();
    }

    // Get the module details
    const moduleDoc = await Module.findById(moduleId).populate(
      "skillId",
      "name"
    );

    if (!moduleDoc) {
      return NextResponse.json(
        { success: false, error: "Module not found" },
        { status: 404 }
      );
    }

    // Get total lesson count for the module
    const totalLessons = await Lesson.countDocuments({ moduleId });

    // Ensure totalLessons is a valid number
    const validTotalLessons = isNaN(totalLessons) ? 0 : totalLessons;

    // Update completion percentage
    const completionPercentage =
      validTotalLessons > 0
        ? Math.round(
            (moduleProgress.completedLessonCount / validTotalLessons) * 100
          )
        : 0;

    // Ensure completionPercentage is a valid number
    const validCompletionPercentage = isNaN(completionPercentage)
      ? 0
      : completionPercentage;

    // Fallback: if completedLessonCount is 0 but we have completed lessons, use array length
    const actualCompletedCount = moduleProgress.completedLessons?.length || 0;
    const finalCompletionPercentage =
      validCompletionPercentage === 0 && actualCompletedCount > 0
        ? Math.round((actualCompletedCount / validTotalLessons) * 100)
        : validCompletionPercentage;

    // Check if module is actually completed
    const isModuleCompleted =
      moduleProgress.completedLessonCount >= validTotalLessons &&
      validTotalLessons > 0;

    // Update module status if needed
    if (isModuleCompleted && moduleProgress.status !== "completed") {
      moduleProgress.status = "completed";
      moduleProgress.completedAt = new Date();
    } else if (!isModuleCompleted && moduleProgress.status === "completed") {
      moduleProgress.status = "in_progress";
    }

    if (moduleProgress.completionPercentage !== validCompletionPercentage) {
      moduleProgress.completionPercentage = validCompletionPercentage;
      moduleProgress.totalLessons = validTotalLessons;
      await moduleProgress.save();
    }

    // Debug logging
    console.log("Module State Debug:", {
      moduleId,
      nextLessonOrder: moduleProgress.nextLessonOrder,
      completedLessonCount: moduleProgress.completedLessonCount,
      completedLessons: moduleProgress.completedLessons?.length || 0,
      totalLessons: validTotalLessons,
      completionPercentage: validCompletionPercentage,
      isModuleCompleted,
      status: moduleProgress.status,
    });

    // Get the current lesson - find the next uncompleted lesson
    let currentLesson = null;
    if (!isModuleCompleted) {
      // Find the next uncompleted lesson starting from nextLessonOrder
      let lessonOrderToFetch = moduleProgress.nextLessonOrder;

      // If nextLessonOrder is beyond available lessons, start from lesson 1
      if (lessonOrderToFetch > validTotalLessons) {
        lessonOrderToFetch = 1;
      }

      console.log(
        "Looking for next uncompleted lesson starting from order:",
        lessonOrderToFetch
      );

      // Find the next uncompleted lesson
      for (
        let order = lessonOrderToFetch;
        order <= validTotalLessons;
        order++
      ) {
        const lesson = await Lesson.findOne({
          moduleId,
          order: order,
        }).select("_id name order type");

        if (
          lesson &&
          !(moduleProgress.completedLessons?.includes(lesson._id) || false)
        ) {
          currentLesson = lesson;
          console.log("Found next uncompleted lesson at order:", order);
          break;
        }
      }

      // If no uncompleted lesson found from nextLessonOrder, check from lesson 1
      if (!currentLesson) {
        console.log(
          "No uncompleted lesson found from nextLessonOrder, checking from lesson 1"
        );
        for (let order = 1; order < lessonOrderToFetch; order++) {
          const lesson = await Lesson.findOne({
            moduleId,
            order: order,
          }).select("_id name order type");

          if (
            lesson &&
            !(moduleProgress.completedLessons?.includes(lesson._id) || false)
          ) {
            currentLesson = lesson;
            console.log("Found uncompleted lesson at order:", order);
            break;
          }
        }
      }

      console.log("Final current lesson:", currentLesson);
    }

    // Prepare response with progress data
    const response = {
      module: {
        _id: moduleDoc._id,
        title: moduleDoc.name,
        description: moduleDoc.description,
        skillId: moduleDoc.skillId,
        level: moduleDoc.level,
        duration: moduleDoc.duration,
        points: moduleDoc.points,
        totalLessons: validTotalLessons,
      },
      progress: {
        pointsEarned: moduleProgress.pointsEarned,
        completedLessonCount: moduleProgress.completedLessonCount,
        nextLessonOrder: moduleProgress.nextLessonOrder,
        completionPercentage: finalCompletionPercentage,
        status: moduleProgress.status,
        lastAccessedAt: moduleProgress.lastAccessedAt,
      },
      currentLesson: currentLesson
        ? {
            _id: currentLesson._id,
            title: currentLesson.name,
            order: currentLesson.order,
            type: currentLesson.type,
          }
        : null,
      hasMoreLessons: !isModuleCompleted && validTotalLessons > 0,
    };

    // Update last accessed time
    moduleProgress.lastAccessedAt = new Date();
    if (moduleProgress.status === "not_started") {
      moduleProgress.status = "in_progress";
    }
    await moduleProgress.save();

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error fetching module state:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to fetch module state",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
