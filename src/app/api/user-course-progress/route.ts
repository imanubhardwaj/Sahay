import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { UserCourseProgress, Lesson, Module, User } from "@/models";
import mongoose from "mongoose";
import { getUserIdFromRequest } from "@/lib/auth";
import {
  deductCourseStartPoints,
  awardCourseProgressPoints,
  awardCourseCompletionBonus,
  validateWalletBalance,
} from "@/lib/wallet";
import { COURSE_START_COST, type CourseLevel } from "@/lib/points-economy";

// GET /api/user-course-progress - Get course progress for a user
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const queryUserId = searchParams.get("userId");
    const userId = queryUserId || (await getUserIdFromRequest(request));
    const courseId = searchParams.get("courseId");
    const moduleId = searchParams.get("moduleId");

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);

    // Find or create user progress document
    let userProgress = await UserCourseProgress.findOne({
      userId: userObjectId,
    });

    if (!userProgress) {
      console.log("Creating new user progress for userId:", userId);
      userProgress = await UserCourseProgress.create({
        userId: userObjectId,
        completedCourses: [],
        totalPointsEarned: 0,
      });
    } else {
      console.log(
        "Found existing user progress with",
        userProgress.completedCourses?.length || 0,
        "courses"
      );
    }

    // Ensure completedCourses array exists
    if (!userProgress.completedCourses) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (userProgress as any).completedCourses = [];
    }

    // Populate the user progress
    try {
      // Only populate courseId if it exists
      if (
        userProgress.completedCourses.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c.courseId
        )
      ) {
        await userProgress.populate(
          "completedCourses.courseId",
          "name description level duration"
        );
      }
      await userProgress.populate("completedCourses.moduleId", "name");
      await userProgress.populate(
        "completedCourses.currentLessonId",
        "name order"
      );
    } catch (populateError) {
      console.error("Error populating user progress in GET:", populateError);
      // Continue without population if it fails
    }

    // If courseId is provided, filter to that course
    if (courseId) {
      const courseProgress =
        userProgress.completedCourses &&
        userProgress.completedCourses.length > 0
          ? userProgress.completedCourses.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (c: any) => c.courseId && c.courseId._id.toString() === courseId
            )
          : null;
      return NextResponse.json(
        { courseProgress: courseProgress || null },
        { status: 200 }
      );
    }

    // If moduleId is provided, filter to that module
    if (moduleId) {
      const moduleProgress =
        userProgress.completedCourses &&
        userProgress.completedCourses.length > 0
          ? userProgress.completedCourses.find(
              // eslint-disable-next-line @typescript-eslint/no-explicit-any
              (c: any) => c.moduleId && c.moduleId._id.toString() === moduleId
            )
          : null;
      return NextResponse.json(
        { moduleProgress: moduleProgress || null },
        { status: 200 }
      );
    }

    // Return user progress with all courses
    return NextResponse.json(
      {
        userProgress,
        totalCourses: userProgress.completedCourses.length,
        totalPoints: userProgress.totalPointsEarned,
        runningCourses: userProgress.completedCourses.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c.status === "in_progress"
        ),
        completedCourses: userProgress.completedCourses.filter(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c.status === "completed"
        ),
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error fetching user course progress:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// POST /api/user-course-progress - Start or update course/module progress
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { courseId, moduleId, lessonId, userId: bodyUserId } = body;
    const userId = bodyUserId || (await getUserIdFromRequest(request));

    if (!userId || !moduleId) {
      return NextResponse.json(
        { error: "User ID and Module ID are required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);
    const courseObjectId = courseId
      ? new mongoose.Types.ObjectId(courseId)
      : null;

    // Get all lessons for the module
    const lessons = await Lesson.find({ moduleId: moduleObjectId }).sort({
      order: 1,
    });

    if (lessons.length === 0) {
      return NextResponse.json(
        { error: "No lessons found for this module" },
        { status: 404 }
      );
    }

    // Get module details for course name and level
    const moduleData = await Module.findById(moduleObjectId);
    const courseName = moduleData?.name || "Course";

    // Find or create user progress document
    let userProgress = await UserCourseProgress.findOne({
      userId: userObjectId,
    });

    if (!userProgress) {
      console.log(
        "Creating new user progress for POST request, userId:",
        userId
      );
      userProgress = new UserCourseProgress({
        userId: userObjectId,
        completedCourses: [],
        totalPointsEarned: 0,
      });
    } else {
      console.log(
        "Found existing user progress for POST, courses:",
        userProgress.completedCourses?.length || 0
      );
    }

    // Ensure completedCourses array exists
    if (!userProgress.completedCourses) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (userProgress as any).completedCourses = [];
    }

    // Find or create course/module progress
    let courseProgress =
      userProgress.completedCourses && userProgress.completedCourses.length > 0
        ? userProgress.completedCourses.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (c: any) => c.moduleId.toString() === moduleId
          )
        : null;

    let pointsInfo = null;
    let isNewCourse = false;

    if (courseProgress) {
      // Update existing progress
      if (lessonId) {
        courseProgress.currentLessonId = new mongoose.Types.ObjectId(lessonId);
      }
      courseProgress.lastAccessedAt = new Date();

      if (courseProgress.status === "not_started") {
        courseProgress.status = "in_progress";
        courseProgress.startedAt = new Date();
      }
    } else {
      // NEW COURSE - Need to check points and deduct
      isNewCourse = true;

      // Check if this is user's first course (FREE) or needs points
      const user = await User.findById(userId);
      const isFirstCourse = !user?.hasStartedFirstCourse;

      // CRITICAL VALIDATION: If not first course, validate wallet balance FIRST
      if (!isFirstCourse) {
        const validation = await validateWalletBalance(
          userId,
          COURSE_START_COST
        );

        if (!validation.isValid) {
          return NextResponse.json(
            {
              error: validation.error,
              requiredPoints: COURSE_START_COST,
              currentBalance: validation.currentBalance,
              shortfall: validation.shortfall,
            },
            { status: 400 }
          );
        }
      }

      // Deduct points for starting course
      const deductResult = await deductCourseStartPoints(
        userId,
        moduleId,
        courseName,
        isFirstCourse
      );

      if (!deductResult.success) {
        return NextResponse.json(
          {
            error: deductResult.error || "Failed to process course enrollment",
          },
          { status: 400 }
        );
      }

      // Mark that user has started their first course
      if (isFirstCourse) {
        await User.findByIdAndUpdate(userId, { hasStartedFirstCourse: true });
      }

      pointsInfo = {
        pointsDeducted: deductResult.points,
        isFree: deductResult.isFree,
        newBalance: deductResult.newBalance,
        message: deductResult.isFree
          ? "🎉 First course is FREE! Enjoy learning!"
          : `${COURSE_START_COST} points deducted for course enrollment.`,
      };

      // Create new course progress
      const firstLesson = lessons[0];
      courseProgress = {
        moduleId: moduleObjectId,
        currentLessonId: lessonId
          ? new mongoose.Types.ObjectId(lessonId)
          : firstLesson._id,
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        completedLessonIds: [] as any[],
        pointsEarned: 0,
        progress: 0,
        status: "in_progress",
        startedAt: new Date(),
        lastAccessedAt: new Date(),
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
      } as any;

      // Only add courseId if it's provided
      if (courseObjectId) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (courseProgress as any).courseId = courseObjectId;
      }

      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      userProgress.completedCourses.push(courseProgress as any);
    }

    try {
      await userProgress.save();
      console.log("User progress saved successfully");
    } catch (saveError) {
      console.error("Error saving user progress:", saveError);
      return NextResponse.json(
        {
          error: "Failed to save user progress",
          details:
            saveError instanceof Error ? saveError.message : "Unknown error",
        },
        { status: 500 }
      );
    }

    // Populate before returning
    try {
      // Only populate courseId if it exists
      if (
        userProgress.completedCourses.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c.courseId
        )
      ) {
        await userProgress.populate(
          "completedCourses.courseId",
          "name description level duration"
        );
      }
      await userProgress.populate("completedCourses.moduleId", "name level");
      await userProgress.populate(
        "completedCourses.currentLessonId",
        "name order"
      );
    } catch (populateError) {
      console.error("Error populating user progress:", populateError);
      // Continue without population if it fails
    }

    return NextResponse.json(
      {
        userProgress,
        courseProgress,
        isNewCourse,
        pointsInfo,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error creating/updating user course progress:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

// PUT /api/user-course-progress - Update progress when lesson is completed
export async function PUT(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { moduleId, lessonId, userId: bodyUserId } = body;
    const userId = bodyUserId || (await getUserIdFromRequest(request));

    if (!userId || !moduleId || !lessonId) {
      return NextResponse.json(
        { error: "User ID, Module ID, and Lesson ID are required" },
        { status: 400 }
      );
    }

    const userObjectId = new mongoose.Types.ObjectId(userId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

    // Find user progress
    const userProgress = await UserCourseProgress.findOne({
      userId: userObjectId,
    });

    if (!userProgress) {
      return NextResponse.json(
        { error: "User progress not found. Please start the module first." },
        { status: 404 }
      );
    }

    // Find course/module progress
    const courseProgress =
      userProgress.completedCourses && userProgress.completedCourses.length > 0
        ? userProgress.completedCourses.find(
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            (c: any) => c.moduleId.toString() === moduleId
          )
        : null;

    if (!courseProgress) {
      return NextResponse.json(
        { error: "Module progress not found. Please start the module first." },
        { status: 404 }
      );
    }

    // Get all lessons for the module
    const lessons = await Lesson.find({ moduleId: moduleObjectId }).sort({
      order: 1,
    });

    // Get module details for course name and level
    const moduleData = await Module.findById(moduleObjectId);
    const courseName = moduleData?.name || "Course";
    const courseLevel = (moduleData?.level || "Beginner") as CourseLevel;

    // Store previous progress for points calculation
    const previousProgress = courseProgress.progress;

    // Check if lesson was already completed
    const lessonAlreadyCompleted = courseProgress.completedLessonIds.some(
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      (l: any) => l.toString() === lessonId
    );

    // Add to completed lessons if not already there
    if (!lessonAlreadyCompleted) {
      courseProgress.completedLessonIds.push(lessonObjectId);
    }

    // Calculate new progress percentage
    const newProgress = Math.round(
      (courseProgress.completedLessonIds.length / lessons.length) * 100
    );
    courseProgress.progress = newProgress;

    // Award progress points (60% running pool) - only if progress increased
    let progressPointsEarned = 0;
    if (newProgress > previousProgress && !lessonAlreadyCompleted) {
      const progressResult = await awardCourseProgressPoints(
        userId,
        moduleId,
        courseName,
        courseLevel,
        newProgress,
        previousProgress
      );
      progressPointsEarned = progressResult.points;
      courseProgress.pointsEarned += progressPointsEarned;
      userProgress.totalPointsEarned += progressPointsEarned;
    }

    // Find next lesson
    const currentLessonIndex = lessons.findIndex(
      (l) => l._id.toString() === lessonId
    );
    const nextLesson = lessons[currentLessonIndex + 1];

    if (nextLesson) {
      courseProgress.currentLessonId = nextLesson._id;
    }

    // Check if module is completed and award completion bonus (40%)
    let completionBonusEarned = 0;
    const wasAlreadyCompleted = courseProgress.status === "completed";

    if (courseProgress.completedLessonIds.length >= lessons.length) {
      courseProgress.status = "completed";
      courseProgress.completedAt = new Date();

      // Award completion bonus (40% of total points) - only once
      if (!wasAlreadyCompleted) {
        const completionResult = await awardCourseCompletionBonus(
          userId,
          moduleId,
          courseName,
          courseLevel
        );

        if (completionResult.success && !completionResult.alreadyAwarded) {
          completionBonusEarned = completionResult.points;
          courseProgress.pointsEarned += completionBonusEarned;
          userProgress.totalPointsEarned += completionBonusEarned;
        }
      }
    } else {
      courseProgress.status = "in_progress";
    }

    courseProgress.lastAccessedAt = new Date();
    await userProgress.save();

    // Populate before returning
    try {
      if (
        userProgress.completedCourses.some(
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          (c: any) => c.courseId
        )
      ) {
        await userProgress.populate(
          "completedCourses.courseId",
          "name description level duration"
        );
      }
      await userProgress.populate("completedCourses.moduleId", "name level");
      await userProgress.populate(
        "completedCourses.currentLessonId",
        "name order"
      );
    } catch (populateError) {
      console.error("Error populating user progress:", populateError);
    }

    // Calculate total points earned this session
    const totalPointsEarned = progressPointsEarned + completionBonusEarned;

    // Build response message
    let message = "Lesson completed!";
    const pointsMessages: string[] = [];

    if (progressPointsEarned > 0) {
      pointsMessages.push(`+${progressPointsEarned} progress points`);
    }
    if (completionBonusEarned > 0) {
      pointsMessages.push(`+${completionBonusEarned} completion bonus`);
    }

    if (courseProgress.status === "completed") {
      message = "🎉 Congratulations! You have completed the course!";
    } else if (nextLesson) {
      message = "Lesson completed! Moving to next lesson.";
    }

    if (pointsMessages.length > 0) {
      message += ` (${pointsMessages.join(", ")})`;
    }

    return NextResponse.json(
      {
        userProgress,
        courseProgress,
        nextLesson: nextLesson
          ? { _id: nextLesson._id, name: nextLesson.name }
          : null,
        pointsEarned: {
          progressPoints: progressPointsEarned,
          completionBonus: completionBonusEarned,
          total: totalPointsEarned,
        },
        message,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user course progress:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
