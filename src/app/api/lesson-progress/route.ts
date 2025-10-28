import { NextRequest, NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { UserLessonProgress, Lesson, Transaction, Wallet, ModuleProgress } from "@/models";
import mongoose from "mongoose";

// GET /api/lesson-progress - Get user's lesson progress for a module
export async function GET(req: NextRequest) {
  try {
    await connectDB();
    
    const { searchParams } = new URL(req.url);
    const moduleId = searchParams.get("moduleId");
    const userId = searchParams.get("userId") || req.cookies.get("user_id")?.value;
    const recent = searchParams.get("recent") === "true";

    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    // If recent=true, return recent lesson completions across all modules
    if (recent) {
      const userObjectId = new mongoose.Types.ObjectId(userId);
      
      const recentProgress = await UserLessonProgress.find({
        userId: userObjectId,
        status: 'completed',
        completedAt: { $exists: true }
      })
      .populate('lessonId')
      .sort({ completedAt: -1 })
      .limit(10);

      const lessonsWithProgress = recentProgress.map(progress => ({
        lesson: progress.lessonId,
        progress: {
          status: progress.status,
          completedAt: progress.completedAt,
          quizScore: progress.quizScore
        },
        isLocked: false
      }));

      return NextResponse.json({ lessonsWithProgress });
    }

    if (!moduleId) {
      return NextResponse.json(
        { error: "Module ID is required" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    let moduleObjectId, userObjectId;
    try {
      moduleObjectId = new mongoose.Types.ObjectId(moduleId);
      userObjectId = new mongoose.Types.ObjectId(userId);
    } catch (error) {
      console.error('Invalid ObjectId format:', { moduleId, userId, error });
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }

    // Get all lessons for the module
    const lessons = await Lesson.find({ moduleId: moduleObjectId }).sort({ order: 1 });
    console.log(`Found ${lessons.length} lessons for module ${moduleId}`);
    
    // Get user's progress for these lessons
    const progress = await UserLessonProgress.find({
      userId: userObjectId,
      moduleId: moduleObjectId
    });
    console.log(`Found ${progress.length} progress records for user ${userId}`);

    // Create a map of lessonId to progress
    const progressMap = progress.reduce((map, p) => {
      map[p.lessonId.toString()] = p;
      return map;
    }, {} as Record<string, any>);

    // Combine lessons with progress
    const lessonsWithProgress = lessons.map((lesson, index) => {
      const lessonProgress = progressMap[lesson._id.toString()];
      
      // Determine if lesson is locked (previous lesson must be completed)
      let isLocked = false;
      if (index > 0) {
        // Check if previous lesson is completed
        const previousLesson = lessons[index - 1];
        const previousProgress = progressMap[previousLesson._id.toString()];
        isLocked = !(previousProgress?.status === 'completed');
        
        console.log(`Lesson ${index + 1} (${lesson.name}) locking check:`, {
          previousLesson: previousLesson.name,
          previousStatus: previousProgress?.status,
          isLocked
        });
      }
      
      return {
        lesson,
        progress: lessonProgress || null,
        isLocked
      };
    });

    console.log(`Returning ${lessonsWithProgress.length} lessons with progress`);
    return NextResponse.json({ lessonsWithProgress });
  } catch (error) {
    console.error("Get lesson progress error:", error);
    console.error("Error details:", {
      message: error instanceof Error ? error.message : 'Unknown error',
      stack: error instanceof Error ? error.stack : undefined
    });
    return NextResponse.json(
      { error: "Internal server error", details: error instanceof Error ? error.message : 'Unknown error' },
      { status: 500 }
    );
  }
}

// POST /api/lesson-progress - Start or update lesson progress
export async function POST(req: NextRequest) {
  try {
    await connectDB();
    
    const { lessonId, moduleId, status, userId: bodyUserId } = await req.json();
    const userId = bodyUserId || req.cookies.get("user_id")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!lessonId || !moduleId) {
      return NextResponse.json(
        { error: "Lesson ID and Module ID are required" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);
    const moduleObjectId = new mongoose.Types.ObjectId(moduleId);

    // Find or create progress record
    let progress = await UserLessonProgress.findOne({ 
      userId: userObjectId, 
      lessonId: lessonObjectId 
    });

    if (!progress) {
      progress = new UserLessonProgress({
        userId: userObjectId,
        lessonId: lessonObjectId,
        moduleId: moduleObjectId,
        status: status || 'in_progress',
        startedAt: new Date()
      });
    } else {
      progress.status = status || progress.status;
      progress.lastAccessedAt = new Date();
    }

    await progress.save();

    return NextResponse.json({ progress });
  } catch (error) {
    console.error("Update lesson progress error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

// PUT /api/lesson-progress - Submit quiz score and complete lesson
export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    
    const { lessonId, quizId, score, userId: bodyUserId } = await req.json();
    const userId = bodyUserId || req.cookies.get("user_id")?.value;
    
    if (!userId) {
      return NextResponse.json(
        { error: "User ID is required" },
        { status: 400 }
      );
    }

    if (!lessonId || score === undefined) {
      return NextResponse.json(
        { error: "Lesson ID and score are required" },
        { status: 400 }
      );
    }

    // Convert string IDs to ObjectIds
    const userObjectId = new mongoose.Types.ObjectId(userId);
    const lessonObjectId = new mongoose.Types.ObjectId(lessonId);

    // Find progress record
    const progress = await UserLessonProgress.findOne({ 
      userId: userObjectId, 
      lessonId: lessonObjectId 
    });

    if (!progress) {
      return NextResponse.json(
        { error: "Lesson progress not found" },
        { status: 404 }
      );
    }

    // Get lesson details for points
    const lesson = await Lesson.findById(lessonObjectId);
    if (!lesson) {
      return NextResponse.json(
        { error: "Lesson not found" },
        { status: 404 }
      );
    }

    // Check if this is the first completion (to avoid duplicate points)
    const isFirstCompletion = progress.status !== 'completed';
    console.log('Lesson completion check:', {
      lessonId: lessonObjectId.toString(),
      currentStatus: progress.status,
      isFirstCompletion,
      score
    });

    // Update quiz score and status - ANY completion counts (no 70% requirement)
    progress.quizScore = score;
    progress.quizPassed = true; // Completion is based on quiz submission, not score
    progress.quizId = quizId;
    progress.status = 'completed';
    progress.completedAt = new Date();

    await progress.save();

    // Award points on first completion
    let transaction = null;
    let wallet = null;
    
    console.log('isFirstCompletion:', isFirstCompletion, 'lesson.points:', lesson.points);
    
    if (isFirstCompletion && lesson.points > 0) {
      try {
        // Find or create user's wallet
        wallet = await Wallet.findOne({ userId: userObjectId });
        if (!wallet) {
          console.log('Creating new wallet for user:', userObjectId.toString());
          wallet = await Wallet.create({
            userId: userObjectId,
            balance: 0,
            totalEarned: 0,
            totalSpent: 0
          });
        }

        // Create transaction for points
        console.log('Creating transaction with walletId:', wallet._id.toString());
        transaction = await Transaction.create({
          userId: userObjectId,
          walletId: wallet._id,
          points: lesson.points,
          type: 'earn',
          source: 'lesson',
          description: `Completed lesson: ${lesson.name}`,
          referenceId: lessonObjectId.toString()
        });

        // Update wallet balance (handle both old and new schema)
        if (wallet.balance !== undefined) {
          // New schema
          wallet.balance += lesson.points;
          wallet.totalEarned = (wallet.totalEarned || 0) + lesson.points;
        } else {
          // Old schema - migrate to new schema
          wallet.balance = (wallet.points || 0) + lesson.points;
          wallet.totalEarned = lesson.points;
          wallet.totalSpent = 0;
        }
        await wallet.save();
        
        console.log('Successfully awarded points:', lesson.points);
      } catch (pointsError) {
        console.error('Error awarding points:', pointsError);
        // Don't fail the entire request if points awarding fails
      }
    }

    // Update module progress (with error handling)
    try {
      const moduleProgress = await ModuleProgress.findOne({ 
        userId: userObjectId, 
        moduleId: lesson.moduleId 
      });

      if (moduleProgress) {
        // Ensure completedLessons array exists
        if (!moduleProgress.completedLessons) {
          moduleProgress.completedLessons = [];
        }
        
        // Add lesson to completed lessons if not already there
        if (!moduleProgress.completedLessons.includes(lessonObjectId)) {
          moduleProgress.completedLessons.push(lessonObjectId);
        }

        // Calculate completion percentage
        const totalLessons = await Lesson.countDocuments({ moduleId: lesson.moduleId });
        moduleProgress.completionPercentage = Math.round(
          (moduleProgress.completedLessons.length / totalLessons) * 100
        );

        // Update points earned
        if (isFirstCompletion) {
          moduleProgress.pointsEarned += lesson.points;
        }

        // Check if module is completed
        if (moduleProgress.completedLessons.length >= totalLessons) {
          moduleProgress.status = 'completed';
          moduleProgress.completedAt = new Date();
        } else {
          moduleProgress.status = 'in_progress';
        }

        moduleProgress.lastAccessedAt = new Date();
        await moduleProgress.save();
      }
    } catch (moduleProgressError) {
      console.error('Error updating module progress:', moduleProgressError);
      // Don't fail the entire request if module progress update fails
    }

    return NextResponse.json({ 
      progress,
      passed: true,
      pointsEarned: isFirstCompletion ? lesson.points : 0,
      transaction,
      wallet: wallet ? { balance: wallet.balance } : null,
      message: isFirstCompletion 
        ? `Congratulations! You earned ${lesson.points} points! You can now proceed to the next lesson.`
        : 'Lesson completed! You can now proceed to the next lesson.'
    });
  } catch (error) {
    console.error("Submit quiz score error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}


