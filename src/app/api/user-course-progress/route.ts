import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { UserCourseProgress, Lesson } from "@/models";
import mongoose from "mongoose";
import { getUserIdFromRequest } from "@/lib/auth";

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
      await userProgress.populate("completedCourses.moduleId", "name");
      await userProgress.populate(
        "completedCourses.currentLessonId",
        "name order"
      );
    } catch (populateError) {
      console.error("Error populating user progress:", populateError);
      // Continue without population if it fails
    }

    return NextResponse.json({ userProgress, courseProgress }, { status: 200 });
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
    const { moduleId, lessonId, pointsEarned = 0, userId: bodyUserId } = body;
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

    // Add to completed lessons if not already there
    if (
      !courseProgress.completedLessonIds.some(
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        (l: any) => l.toString() === lessonId
      )
    ) {
      courseProgress.completedLessonIds.push(lessonObjectId);
    }

    // Update points earned
    courseProgress.pointsEarned += pointsEarned;
    userProgress.totalPointsEarned += pointsEarned;

    // Calculate progress percentage
    courseProgress.progress = Math.round(
      (courseProgress.completedLessonIds.length / lessons.length) * 100
    );

    // Find next lesson
    const currentLessonIndex = lessons.findIndex(
      (l) => l._id.toString() === lessonId
    );
    const nextLesson = lessons[currentLessonIndex + 1];

    if (nextLesson) {
      courseProgress.currentLessonId = nextLesson._id;
    }

    // Check if module is completed
    if (courseProgress.completedLessonIds.length >= lessons.length) {
      courseProgress.status = "completed";
      courseProgress.completedAt = new Date();
    } else {
      courseProgress.status = "in_progress";
    }

    courseProgress.lastAccessedAt = new Date();
    await userProgress.save();

    // Populate before returning
    await userProgress.populate(
      "completedCourses.courseId",
      "name description level duration"
    );
    await userProgress.populate("completedCourses.moduleId", "name");
    await userProgress.populate(
      "completedCourses.currentLessonId",
      "name order"
    );

    return NextResponse.json(
      {
        userProgress,
        courseProgress,
        nextLesson: nextLesson
          ? { _id: nextLesson._id, name: nextLesson.name }
          : null,
        message:
          courseProgress.status === "completed"
            ? "Congratulations! You have completed the module!"
            : "Lesson completed! Moving to next lesson.",
      },
      { status: 200 }
    );
  } catch (error) {
    console.error("Error updating user course progress:", error);
    const message = error instanceof Error ? error.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
