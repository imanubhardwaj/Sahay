import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';

// GET - Debug lessons for a module
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    if (!moduleId) {
      return NextResponse.json(
        { success: false, error: 'moduleId is required' },
        { status: 400 }
      );
    }

    // Get all lessons for this module
    const lessons = await Lesson.find({ moduleId }).sort({ order: 1 });

    return NextResponse.json({
      success: true,
      data: {
        moduleId,
        totalLessons: lessons.length,
        lessons: lessons.map(lesson => ({
          _id: lesson._id,
          name: lesson.name,
          order: lesson.order,
          type: lesson.type,
          content: lesson.content?.substring(0, 100) + '...' // First 100 chars
        }))
      }
    });

  } catch (error) {
    console.error('Error debugging lessons:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to debug lessons',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
