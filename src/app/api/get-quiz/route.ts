import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import ModuleProgress from '@/models/ModuleProgress';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';

// GET - Get quiz questions for a lesson (secure - doesn't expose correct answers)
export async function GET(request: NextRequest) {
  try {
    await connectDB();

    const { searchParams } = new URL(request.url);
    const lessonId = searchParams.get('lessonId');
    const userId = searchParams.get('userId');

    if (!lessonId || !userId) {
      return NextResponse.json(
        { success: false, error: 'lessonId and userId are required' },
        { status: 400 }
      );
    }

    // Find the lesson by lessonId
    const lesson = await Lesson.findById(lessonId);

    if (!lesson) {
      return NextResponse.json(
        { success: false, error: 'Lesson not found' },
        { status: 404 }
      );
    }

    // Get module progress - ensure we get the latest from DB (bypass cache)
    const moduleProgress = await ModuleProgress.findOne({ 
      userId, 
      moduleId: lesson.moduleId 
    })
      .read('primary') // Force read from primary database
      .lean()
      .exec();

    // For testing purposes, allow quiz access without module progress
    // TODO: Remove this bypass in production
    if (!moduleProgress) {
      console.log('No module progress found, creating temporary progress for testing');
      // Create a temporary module progress for testing
      const tempProgress = await ModuleProgress.create({
        userId,
        moduleId: lesson.moduleId,
        currentLessonId: lessonId,
        completedLessons: [],
        totalLessons: 5,
        progressPercentage: 0,
        pointsEarned: 0,
        isCompleted: false,
        startedAt: new Date(),
        lastAccessedAt: new Date()
      });
    }

    console.log('[GET-QUIZ] Loading quiz for lesson:', {
      userId,
      lessonId: lesson._id.toString(),
      lessonName: lesson.name
    });

    // Check if this lesson has an associated quiz
    const associatedQuiz = await Quiz.findOne({ lessonId: lesson._id });
    
    if (!associatedQuiz) {
      return NextResponse.json(
        { success: false, error: 'This lesson does not have an associated quiz' },
        { status: 404 }
      );
    }

    // Get quiz questions
    const quizQuestions = await Question.find({ lessonId: lesson._id }).sort({ order: 1 });
    
    console.log('Found quiz questions:', quizQuestions.length);
    if (quizQuestions.length > 0) {
      console.log('First question content:', quizQuestions[0].questionText);
      console.log('First question fields:', Object.keys(quizQuestions[0].toObject()));
    }
    
    if (quizQuestions.length === 0) {
      return NextResponse.json(
        { success: false, error: 'No questions found for this quiz' },
        { status: 404 }
      );
    }

    // Transform questions to hide correct answers
    const questions = quizQuestions.map(q => ({
      _id: q._id,
      question: q.questionText, // Use the question text field
      type: q.type,
      points: q.points || 10,
      // For MCQ questions, include options but WITHOUT marking correct ones
      options: q.options?.map((opt: { id?: string; content?: string }) => ({
        _id: opt.id,
        text: opt.content,
        // DO NOT include 'isCorrect' field
      })),
      // For subjective questions, include evaluation criteria
      evaluationCriteria: q.type === 'subjective' ? q.evaluationCriteria : undefined,
      explanation: undefined // Don't send explanation until after submission
    }));

    const response = {
      quiz: {
        _id: associatedQuiz._id,
        title: associatedQuiz.title || `Quiz for ${lesson.name}`,
        description: associatedQuiz.description,
        totalQuestions: questions.length,
        totalPoints: questions.reduce((sum, q) => sum + (q.points || 0), 0),
        passingScore: associatedQuiz.passingScore || 70,
        timeLimit: associatedQuiz.timeLimit,
        attempts: associatedQuiz.attempts || 3
      },
      questions: questions
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error fetching quiz:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch quiz',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

