import { NextResponse } from "next/server";
import connectDB from "@/lib/mongodb";
import { Lesson, Quiz, Question } from "@/models";
import { quizData } from "../../../../scripts/seed/detailed-lessons-content";

export async function POST() {
  try {
    await connectDB();
    console.log("🌱 Starting quiz data seeding...");

    // Get all lessons
    const lessons = await Lesson.find({}).populate("moduleId");
    console.log(`📚 Found ${lessons.length} lessons`);

    // Clear existing quizzes and questions
    await Quiz.deleteMany({});
    await Question.deleteMany({});
    console.log("🗑️  Cleared existing quizzes and questions");

    const quizzesData = [];
    const questionsData = [];

    // Create quizzes for lessons that have quiz data
    for (const lesson of lessons) {
      const lessonModule = lesson.moduleId as { name: string };
      if (!lessonModule || !lessonModule.name) continue;

      const moduleQuizData =
        quizData[lessonModule.name as keyof typeof quizData];
      if (!moduleQuizData) continue;

      const lessonQuizData = moduleQuizData.find(
        (q) => q.lessonOrder === lesson.order
      );
      if (!lessonQuizData) continue;

      // Create quiz
      const quiz = {
        name: `${lesson.name} Quiz`,
        description: `Quiz for ${lesson.name} - Test your knowledge!`,
        duration: 10, // 10 minutes
        moduleId: lesson.moduleId._id,
        lessonId: lesson._id,
        lessonOrder: lesson.order,
        numberOfQuestions: lessonQuizData.questions.length,
        points: lesson.points,
      };

      quizzesData.push(quiz);

      // Create questions for this quiz
      for (let i = 0; i < lessonQuizData.questions.length; i++) {
        const questionInfo = lessonQuizData.questions[i];

        // Convert options to the correct format
        const options = questionInfo.options.map((option, index) => ({
          id: `option_${index + 1}`,
          type: "mcq",
          content: option,
        }));

        const question = {
          type: "mcq",
          quizId: null, // Will be set after quiz is inserted
          lessonId: lesson._id,
          moduleId: lesson.moduleId._id,
          options: options,
          answer: {
            type: "mcq",
            content: questionInfo.options[questionInfo.correctAnswer],
            optionId: `option_${questionInfo.correctAnswer + 1}`,
          },
        };

        questionsData.push({
          ...question,
          lessonOrder: lesson.order,
        });
      }
    }

    // Insert quizzes
    const quizzes = await Quiz.insertMany(quizzesData);
    console.log(`✅ Seeded ${quizzes.length} quizzes`);

    // Update questions with quiz IDs
    const questionsWithQuizIds = questionsData
      .map((questionData) => {
        const quiz = quizzes.find(
          (q) => q.lessonId.toString() === questionData.lessonId.toString()
        );
        return {
          ...questionData,
          quizId: quiz?._id,
        };
      })
      .filter((question) => question.quizId);

    const questions = await Question.insertMany(questionsWithQuizIds);
    console.log(`✅ Seeded ${questions.length} questions`);

    return NextResponse.json({
      success: true,
      message: "Quiz data seeded successfully!",
      stats: {
        lessons: lessons.length,
        quizzes: quizzes.length,
        questions: questions.length,
      },
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error("❌ Error seeding quiz data:", error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : "Unknown error",
        timestamp: new Date().toISOString(),
      },
      { status: 500 }
    );
  }
}
