import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ModuleProgress from '@/models/ModuleProgress';
import Lesson from '@/models/Lesson';

// GET - Debug and view current progress
// POST - Fix progress issues
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const userId = searchParams.get('userId');
    const moduleId = searchParams.get('moduleId');

    if (!userId || !moduleId) {
      return NextResponse.json(
        { success: false, error: 'userId and moduleId are required' },
        { status: 400 }
      );
    }

    const moduleProgress = await ModuleProgress.findOne({ userId, moduleId });

    if (!moduleProgress) {
      return NextResponse.json(
        { success: false, error: 'Module progress not found' },
        { status: 404 }
      );
    }

    // Get all lessons for this module
    const allLessons = await Lesson.find({ moduleId }).sort({ order: 1 });
    
    // Check which lessons are completed
    const completedLessonIds = moduleProgress.completedLessons || [];
    const lessonStatus = allLessons.map(lesson => ({
      order: lesson.order,
      title: lesson.name,
      _id: lesson._id.toString(),
      isCompleted: completedLessonIds.some((id: any) => id.toString() === lesson._id.toString())
    }));

    return NextResponse.json({
      success: true,
      data: {
        progress: {
          nextLessonOrder: moduleProgress.nextLessonOrder,
          completedLessonCount: moduleProgress.completedLessonCount,
          completedLessons: completedLessonIds.length,
          status: moduleProgress.status,
          completionPercentage: moduleProgress.completionPercentage
        },
        lessons: lessonStatus,
        totalLessons: allLessons.length
      }
    });

  } catch (error) {
    console.error('Error debugging progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to debug progress' },
      { status: 500 }
    );
  }
}

// POST - Fix progress by setting nextLessonOrder based on completed lessons
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, moduleId, forceNextLessonOrder } = body;

    if (!userId || !moduleId) {
      return NextResponse.json(
        { success: false, error: 'userId and moduleId are required' },
        { status: 400 }
      );
    }

    const moduleProgress = await ModuleProgress.findOne({ userId, moduleId });

    if (!moduleProgress) {
      return NextResponse.json(
        { success: false, error: 'Module progress not found' },
        { status: 404 }
      );
    }

    const before = {
      nextLessonOrder: moduleProgress.nextLessonOrder,
      completedLessonCount: moduleProgress.completedLessonCount,
      completedLessonsLength: moduleProgress.completedLessons?.length || 0
    };

    if (forceNextLessonOrder !== undefined) {
      // Manually set nextLessonOrder
      moduleProgress.nextLessonOrder = forceNextLessonOrder;
    } else {
      // Auto-fix: set nextLessonOrder to (highest completed lesson order + 1)
      const completedLessonIds = moduleProgress.completedLessons || [];
      if (completedLessonIds.length > 0) {
        const completedLessons = await Lesson.find({
          _id: { $in: completedLessonIds }
        }).sort({ order: -1 }).limit(1);

        if (completedLessons.length > 0) {
          moduleProgress.nextLessonOrder = completedLessons[0].order + 1;
        }
      }
    }

    await moduleProgress.save();

    // Verify the save
    const verifyProgress = await ModuleProgress.findOne({ userId, moduleId });

    return NextResponse.json({
      success: true,
      data: {
        before,
        after: {
          nextLessonOrder: verifyProgress?.nextLessonOrder,
          completedLessonCount: verifyProgress?.completedLessonCount,
          completedLessonsLength: verifyProgress?.completedLessons?.length || 0
        }
      }
    });

  } catch (error) {
    console.error('Error fixing progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fix progress' },
      { status: 500 }
    );
  }
}

