import { NextRequest, NextResponse } from 'next/server';
import connectDB from '@/lib/mongodb';
import Lesson from '@/models/Lesson';
import Quiz from '@/models/Quiz';
import Question from '@/models/Question';
import ModuleProgress from '@/models/ModuleProgress';
import LessonProgress from '@/models/LessonProgress';

interface UserAnswer {
  questionId: string;
  optionId?: string; // For MCQ questions
  content?: string;   // For subjective questions
}

interface QuizSubmission {
  userId: string;
  moduleId: string;
  lessonId: string;
  answers: UserAnswer[];
}

// POST - Submit quiz and get results (validates on backend, does NOT advance progress)
export async function POST(request: NextRequest) {
  try {
    await connectDB();

    const body: QuizSubmission = await request.json();
    const { userId, moduleId, lessonId, answers } = body;

    if (!userId || !moduleId || !lessonId || !answers) {
      return NextResponse.json(
        { success: false, error: 'userId, moduleId, lessonId, and answers are required' },
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

    // Verify the lesson belongs to the module (security check)
    if (lesson.moduleId.toString() !== moduleId) {
      return NextResponse.json(
        { success: false, error: 'Lesson does not belong to this module' },
        { status: 400 }
      );
    }

    // Check if this lesson has an associated quiz
    const associatedQuiz = await Quiz.findOne({ lessonId: lesson._id });
    
    if (!associatedQuiz) {
      return NextResponse.json(
        { success: false, error: 'This lesson does not have an associated quiz' },
        { status: 400 }
      );
    }

    // Get module progress - force read from primary to bypass cache
    const moduleProgress = await ModuleProgress.findOne({ userId, moduleId })
      .read('primary')
      .exec();

    if (!moduleProgress) {
      return NextResponse.json(
        { success: false, error: 'Module progress not found' },
        { status: 404 }
      );
    }

    console.log('[SUBMIT-QUIZ] Validating quiz submission:', {
      userId,
      moduleId,
      lessonId: lesson._id.toString(),
      answerCount: answers.length
    });

    // Get all quiz questions
    const quizQuestions = await Question.find({ lessonId: lesson._id }).sort({ order: 1 });

    // Validate and grade answers
    const results = quizQuestions.map(question => {
      const userAnswer = answers.find(a => a.questionId === question._id.toString());

      if (!userAnswer) {
        return {
          questionId: question._id,
          question: question.question,
          type: question.type,
          points: question.points,
          earnedPoints: 0,
          isCorrect: false,
          correctAnswer: question.type === 'mcq' 
            ? question.options?.find((opt: { isCorrect?: boolean }) => opt.isCorrect)?.text 
            : null,
          userAnswer: null,
          explanation: question.explanation
        };
      }

      // For MCQ questions
      if (question.type === 'mcq') {
        const selectedOption = question.options?.find(
          (opt: { id?: string }) => opt.id === userAnswer.optionId
        );
        const correctOption = question.options?.find((opt: { id?: string }) => opt.id === question.answer?.optionId);

        const isCorrect = selectedOption?.id === correctOption?.id;

        return {
          questionId: question._id,
          question: question.content || question.answer?.content,
          type: question.type,
          points: question.points || 10,
          earnedPoints: isCorrect ? (question.points || 10) : 0,
          isCorrect,
          correctAnswer: correctOption?.content,
          userAnswer: selectedOption?.content,
          explanation: question.explanation,
          options: question.options?.map((opt: { id?: string; content?: string }) => ({
            text: opt.content,
            isCorrect: opt.id === question.answer?.optionId,
            isSelected: opt.id === userAnswer.optionId
          }))
        };
      }

      // For subjective questions - store for manual evaluation
      if (question.type === 'subjective') {
        return {
          questionId: question._id,
          question: question.content || question.answer?.content,
          type: question.type,
          points: question.points || 10,
          earnedPoints: 0, // Manual grading required
          isCorrect: null, // Pending evaluation
          userAnswer: userAnswer.content,
          evaluationCriteria: question.evaluationCriteria,
          explanation: question.explanation,
          requiresManualGrading: true
        };
      }

      return null;
    }).filter(Boolean);

    // Calculate total score
    const totalPoints = results.reduce((sum, r) => sum + (r?.points || 0), 0);
    const earnedPoints = results.reduce((sum, r) => sum + (r?.earnedPoints || 0), 0);
    const scorePercentage = totalPoints > 0 ? Math.round((earnedPoints / totalPoints) * 100) : 0;
    const passingScore = 0; // REMOVED 70% requirement - any score passes
    const isPassed = true; // Always pass - just completing the quiz is enough

    // Create or update lesson progress (track attempts, but don't mark as completed yet)
    let lessonProgress = await LessonProgress.findOne({ userId, lessonId: lesson._id });

    if (!lessonProgress) {
      lessonProgress = new LessonProgress({
        userId,
        lessonId: lesson._id,
        moduleId,
        status: 'in_progress', // Don't mark as completed yet
        pointsEarned: earnedPoints,
        attempts: 1,
        lastAttemptAt: new Date()
      });
    } else {
      lessonProgress.attempts += 1;
      lessonProgress.lastAttemptAt = new Date();
      // Update points if this attempt earned more
      if (earnedPoints > lessonProgress.pointsEarned) {
        lessonProgress.pointsEarned = earnedPoints;
      }
    }

    await lessonProgress.save();

    // Prepare response (NO progress advancement here)
    const response = {
      quizResults: {
        totalQuestions: quizQuestions.length,
        totalPoints,
        earnedPoints,
        scorePercentage,
        isPassed,
        passingScore,
        attempts: lessonProgress.attempts
      },
      questionResults: results,
      feedback: isPassed 
        ? '🎉 Congratulations! You passed the quiz!' 
        : `You scored ${scorePercentage}%. You need ${passingScore}% to pass. Try again!`,
      message: 'Quiz completed! Click "Next Lesson" to continue.'
    };

    return NextResponse.json({
      success: true,
      data: response
    });

  } catch (error) {
    console.error('Error submitting quiz:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to submit quiz',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
