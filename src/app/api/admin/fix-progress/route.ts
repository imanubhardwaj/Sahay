import { NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import ModuleProgress from '@/models/ModuleProgress';

// GET - Fix all module progress records where nextLessonOrder is incorrect
export async function GET() {
  try {
    await connectDB();

    // Find all module progress where completedLessonCount > 0
    const progressRecords = await ModuleProgress.find({
      completedLessonCount: { $gt: 0 }
    });

    console.log(`Found ${progressRecords.length} progress records to check`);

    const fixed = [];
    const alreadyCorrect = [];

    for (const progress of progressRecords) {
      const correctNextLessonOrder = progress.completedLessonCount + 1;
      
      if (progress.nextLessonOrder !== correctNextLessonOrder) {
        const before = {
          userId: progress.userId.toString(),
          moduleId: progress.moduleId.toString(),
          completedLessonCount: progress.completedLessonCount,
          nextLessonOrder: progress.nextLessonOrder
        };
        
        progress.nextLessonOrder = correctNextLessonOrder;
        await progress.save();
        
        const after = {
          userId: progress.userId.toString(),
          moduleId: progress.moduleId.toString(),
          completedLessonCount: progress.completedLessonCount,
          nextLessonOrder: progress.nextLessonOrder
        };
        
        fixed.push({ before, after });
        console.log(`✅ Fixed progress for user ${progress.userId}, module ${progress.moduleId}`);
      } else {
        alreadyCorrect.push({
          userId: progress.userId.toString(),
          moduleId: progress.moduleId.toString(),
          completedLessonCount: progress.completedLessonCount,
          nextLessonOrder: progress.nextLessonOrder
        });
      }
    }

    return NextResponse.json({
      success: true,
      data: {
        totalChecked: progressRecords.length,
        fixed: fixed.length,
        alreadyCorrect: alreadyCorrect.length,
        fixedRecords: fixed,
        correctRecords: alreadyCorrect
      }
    });

  } catch (error) {
    console.error('Error fixing progress:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fix progress',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

