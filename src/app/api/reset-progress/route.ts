import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ModuleProgress from '@/models/ModuleProgress';

// POST - Reset user progress for a module
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body = await request.json();
    const { userId, moduleId } = body;

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

    // Reset everything
    moduleProgress.nextLessonOrder = 1;
    moduleProgress.completedLessonCount = 0;
    moduleProgress.completedLessons = [];
    moduleProgress.pointsEarned = 0;
    moduleProgress.completionPercentage = 0;
    moduleProgress.status = 'not_started';
    
    await moduleProgress.save();

    return NextResponse.json({
      success: true,
      message: 'Progress reset successfully',
      data: {
        nextLessonOrder: 1,
        completedLessonCount: 0,
        completedLessons: 0
      }
    });

  } catch (error) {
    console.error('Error resetting progress:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to reset progress' },
      { status: 500 }
    );
  }
}


