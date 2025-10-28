import { NextRequest, NextResponse } from 'next/server';
import connectToDatabase from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Module from '@/models/Module';
import Skill from '@/models/Skill';

export async function GET(request: NextRequest) {
  try {
    await connectToDatabase();

    const { searchParams } = new URL(request.url);
    const moduleId = searchParams.get('moduleId');

    let query = {};
    if (moduleId) {
      query = { moduleId };
    }

    const lessons = await Lesson.find(query)
      .populate('moduleId', 'name description')
      .populate('skillId', 'name description')
      .sort({ createdAt: 1 });

    return NextResponse.json({ 
      success: true, 
      lessons 
    });
  } catch (error) {
    console.error('Error fetching lessons:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch lessons' },
      { status: 500 }
    );
  }
}

export async function POST(request: NextRequest) {
  try {
    await connectToDatabase();

    const body = await request.json();
    const { name, contentArray, type, content, moduleId, skillId, duration, points } = body;

    // Validate required fields
    if (!name || !content || !moduleId || !skillId) {
      return NextResponse.json(
        { success: false, error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Verify module and skill exist
    const module = await Module.findById(moduleId);
    const skill = await Skill.findById(skillId);

    if (!module) {
      return NextResponse.json(
        { success: false, error: 'Module not found' },
        { status: 404 }
      );
    }

    if (!skill) {
      return NextResponse.json(
        { success: false, error: 'Skill not found' },
        { status: 404 }
      );
    }

    const lesson = new Lesson({
      name,
      contentArray: contentArray || [],
      type: type || 'Text',
      content,
      moduleId,
      skillId,
      duration: duration || 30,
      points: points || 0
    });

    await lesson.save();

    // Populate the response
    await lesson.populate('moduleId', 'name description');
    await lesson.populate('skillId', 'name description');

    return NextResponse.json({ 
      success: true, 
      lesson 
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating lesson:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to create lesson' },
      { status: 500 }
    );
  }
}