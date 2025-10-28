import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import Lesson from "@/models/Lesson";
import ModuleProgress from "@/models/ModuleProgress";
import LessonProgress from "@/models/LessonProgress";
import Wallet from "@/models/Wallet";

interface SaveProgressRequest {
  userId: string;
  moduleId: string;
  lessonId: string;
}

// POST - Save lesson progress and advance to next lesson (SECURE - handles all progression on backend)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: SaveProgressRequest = await request.json();
    const { userId, moduleId, lessonId } = body;

    if (!userId || !moduleId || !lessonId) {
      return NextResponse.json(
        {
          success: false,
          error: "userId, moduleId, and lessonId are required",
        },
        { status: 400 }
      );
    }

    // Find the lesson
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Verify the lesson belongs to the module (security check)
    if (lesson.moduleId.toString() !== moduleId) {
      return NextResponse.json(
        { success: false, error: "Lesson does not belong to this module" },
        { status: 400 }
      );
    }

    // Get module progress with write lock
    const moduleProgress = await ModuleProgress.findOne({ userId, moduleId })
      .read("primary")
      .exec();

    if (!moduleProgress) {
      return NextResponse.json(
        { success: false, error: "Module progress not found" },
        { status: 404 }
      );
    }

    console.log("[SAVE-PROGRESS] Processing:", {
      userId,
      moduleId,
      lessonId: lesson._id.toString(),
      lessonOrder: lesson.order,
      currentNextLessonOrder: moduleProgress.nextLessonOrder,
    });

    // Verify that this lesson is the current lesson (security check)
    const currentLesson = await Lesson.findOne({
      moduleId,
      order: moduleProgress.nextLessonOrder,
    });

    if (!currentLesson || currentLesson._id.toString() !== lessonId) {
      return NextResponse.json(
        {
          success: false,
          error: "Invalid lesson. You can only complete the current lesson.",
          debug: {
            expectedLessonOrder: moduleProgress.nextLessonOrder,
            providedLessonOrder: lesson.order,
          },
        },
        { status: 403 }
      );
    }

    // Ensure completedLessons array exists
    if (!moduleProgress.completedLessons) {
      moduleProgress.completedLessons = [];
    }

    // Check if lesson is already completed
    const isLessonAlreadyCompleted = moduleProgress.completedLessons.some(
      (id: string) => id.toString() === lesson._id.toString()
    );

    console.log("[SAVE-PROGRESS] Completion status:", {
      isLessonAlreadyCompleted,
      lessonId: lesson._id.toString(),
      completedLessonsCount: moduleProgress.completedLessons.length,
    });

    const pointsAwarded = 0;

    // If lesson not already completed, mark it as complete
    if (!isLessonAlreadyCompleted) {
      // Get lesson progress to determine points to award
      const lessonProgress = await LessonProgress.findOne({
        userId,
        lessonId: lesson._id,
      });

      // Use points from lesson progress if exists (from quiz), otherwise use lesson points
      const pointsAwarded = lessonProgress?.pointsEarned || lesson.points || 0;

      // Update lesson progress to completed
      if (lessonProgress) {
        lessonProgress.status = "completed";
        lessonProgress.completedAt = new Date();
        await lessonProgress.save();
      } else {
        // Create new lesson progress if doesn't exist (for content-only lessons)
        await LessonProgress.create({
          userId,
          lessonId: lesson._id,
          moduleId,
          status: "completed",
          pointsEarned: pointsAwarded,
          completedAt: new Date(),
          attempts: 1,
          lastAttemptAt: new Date(),
        });
      }

      // Add lesson to completed lessons
      moduleProgress.completedLessons.push(lesson._id);
      moduleProgress.completedLessonCount += 1;
      moduleProgress.pointsEarned += pointsAwarded;

      // Award points to user's wallet
      if (pointsAwarded > 0) {
        const wallet = await Wallet.findOne({ userId });
        if (wallet) {
          wallet.balance += pointsAwarded;
          wallet.lifetimeEarnings += pointsAwarded;

          // Ensure transactions array exists
          if (!wallet.transactions) {
            wallet.transactions = [];
          }

          wallet.transactions.push({
            type: "earn",
            amount: pointsAwarded,
            description: `Completed lesson: ${lesson.name}`,
            category: "course_completion",
            relatedEntity: lesson._id,
            relatedEntityType: "Lesson",
            timestamp: new Date(),
          });
          await wallet.save();
        } else {
          // Create wallet if doesn't exist
          await Wallet.create({
            userId,
            balance: pointsAwarded,
            lifetimeEarnings: pointsAwarded,
            transactions: [
              {
                type: "earn",
                amount: pointsAwarded,
                description: `Completed lesson: ${lesson.name}`,
                category: "course_completion",
                relatedEntity: lesson._id,
                relatedEntityType: "Lesson",
                timestamp: new Date(),
              },
            ],
          });
        }
      }
    }

    // Move to next lesson (advance nextLessonOrder)
    const currentLessonOrder = lesson.order;
    moduleProgress.nextLessonOrder = currentLessonOrder + 1;

    // Update completion percentage
    const totalLessons = await Lesson.countDocuments({ moduleId });
    const completionPercentage =
      totalLessons > 0
        ? Math.round((moduleProgress.completedLessonCount / totalLessons) * 100)
        : 0;

    moduleProgress.completionPercentage = isNaN(completionPercentage)
      ? 0
      : completionPercentage;
    moduleProgress.totalLessons = totalLessons;

    // Check if module is completed
    if (moduleProgress.completedLessonCount >= totalLessons) {
      moduleProgress.status = "completed";
      moduleProgress.completedAt = new Date();
    } else if (moduleProgress.status === "not_started") {
      moduleProgress.status = "in_progress";
    }

    moduleProgress.lastAccessedAt = new Date();

    // Save with write concern to ensure it's committed
    const savedProgress = await moduleProgress.save({
      writeConcern: { w: "majority", j: true },
    });

    console.log("[SAVE-PROGRESS] Progress saved:", {
      userId,
      moduleId,
      nextLessonOrder: savedProgress.nextLessonOrder,
      completedLessonCount: savedProgress.completedLessonCount,
      completionPercentage: savedProgress.completionPercentage,
      pointsAwarded,
    });

    // Wait a bit for replication
    await new Promise((resolve) => setTimeout(resolve, 100));

    // Verify the save
    const verifyProgress = await ModuleProgress.findOne({ userId, moduleId })
      .read("primary")
      .exec();

    console.log("[SAVE-PROGRESS] Verification:", {
      nextLessonOrder: verifyProgress?.nextLessonOrder,
      completedLessonCount: verifyProgress?.completedLessonCount,
    });

    // Prepare response (without exposing order)
    const response = {
      success: true,
      lessonCompleted: !isLessonAlreadyCompleted,
      pointsAwarded,
      progress: {
        completedLessonCount: moduleProgress.completedLessonCount,
        completionPercentage: moduleProgress.completionPercentage,
        pointsEarned: moduleProgress.pointsEarned,
        moduleCompleted: moduleProgress.status === "completed",
      },
      message:
        moduleProgress.status === "completed"
          ? "🎉 Congratulations! You have completed this module!"
          : isLessonAlreadyCompleted
          ? "Lesson already completed. Moving to next lesson."
          : `✅ Lesson completed! ${pointsAwarded} points earned.`,
    };

    return NextResponse.json({
      success: true,
      data: response,
    });
  } catch (error) {
    console.error("Error saving progress:", error);
    return NextResponse.json(
      {
        success: false,
        error: "Failed to save progress",
        details: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
