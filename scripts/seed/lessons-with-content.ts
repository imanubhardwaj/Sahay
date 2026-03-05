import { Lesson, Quiz, Question } from "../../src/models";
import { detailedLessonsContent, quizData } from "./detailed-lessons-content";
import type mongoose from "mongoose";

type ModuleDocument = {
  _id: mongoose.Types.ObjectId;
  name: string;
  skillId: mongoose.Types.ObjectId;
  lessonsCount?: number;
  save(): Promise<unknown>;
};

export const seedLessonsWithContent = async (modules: ModuleDocument[]) => {
  // Clear existing data
  await (
    Lesson as {
      deleteMany: (filter?: object) => Promise<{ deletedCount: number }>;
    }
  ).deleteMany({});
  await (
    Quiz as {
      deleteMany: (filter?: object) => Promise<{ deletedCount: number }>;
    }
  ).deleteMany({});
  await (
    Question as {
      deleteMany: (filter?: object) => Promise<{ deletedCount: number }>;
    }
  ).deleteMany({});

  const lessonsData: Array<{
    name: string;
    contentArray: string[];
    type: string;
    content: string;
    moduleId: mongoose.Types.ObjectId;
    skillId: mongoose.Types.ObjectId;
    duration: number;
    points: number;
    order: number;
  }> = [];
  const quizzesData: Array<{
    moduleId: mongoose.Types.ObjectId;
    lessonId?: mongoose.Types.ObjectId;
    lessonOrder: number;
    numberOfQuestions: number;
    points: number;
    timeLimit: number;
    passingScore: number;
    lessonName: string;
  }> = [];
  const questionsData: Array<{
    quizId: mongoose.Types.ObjectId | null;
    questionText: string;
    options: unknown;
    correctAnswer: unknown;
    explanation: string;
    order: number;
    points: number;
    lessonName: string;
    quizLessonOrder: number;
  }> = [];

  // Process each module
  for (const moduleData of modules) {
    const moduleName = moduleData.name;
    const moduleContent =
      detailedLessonsContent[moduleName as keyof typeof detailedLessonsContent];

    if (!moduleContent) {
      // Create basic lessons for modules without detailed content
      for (let i = 1; i <= 15; i++) {
        const lesson = {
          name: `${moduleName} Lesson ${i}`,
          contentArray: [`Content for ${moduleName} Lesson ${i}`],
          type: "Text",
          content: `This is the detailed content for ${moduleName} Lesson ${i}. It covers fundamental concepts and practical examples.`,
          moduleId: moduleData._id,
          skillId: moduleData.skillId,
          duration: 20 + i * 2,
          points: 20 + i * 2,
          order: i,
        };
        lessonsData.push(lesson);
      }
      continue;
    }

    // Create lessons for this module
    for (const lessonContent of moduleContent) {
      const lesson = {
        name: lessonContent.name,
        contentArray: lessonContent.keyTopics || [],
        type: "Text",
        content: lessonContent.content,
        moduleId: moduleData._id,
        skillId: moduleData.skillId,
        duration: 20 + lessonContent.order * 2, // Varying duration
        points: 20 + lessonContent.order * 2, // Varying points
        order: lessonContent.order,
      };

      lessonsData.push(lesson);
    }

    // Create quizzes and questions for this module
    const moduleQuizData = quizData[moduleName as keyof typeof quizData];
    if (moduleQuizData) {
      for (const quizInfo of moduleQuizData) {
        const lesson = lessonsData.find(
          (l) =>
            l.moduleId.toString() === moduleData._id.toString() &&
            l.order === quizInfo.lessonOrder,
        );

        if (lesson) {
          // Create quiz
          const quiz = {
            moduleId: moduleData._id,
            lessonOrder: quizInfo.lessonOrder,
            numberOfQuestions: quizInfo.questions.length,
            points: lesson.points,
            timeLimit: 10, // 10 minutes
            passingScore: 60, // 60% to pass
          };

          quizzesData.push({
            ...quiz,
            lessonName: lesson.name,
          });

          // Create questions for this quiz
          for (let i = 0; i < quizInfo.questions.length; i++) {
            const questionInfo = quizInfo.questions[i];
            const question = {
              quizId: null, // Will be set after quiz is inserted
              questionText: questionInfo.question,
              options: questionInfo.options,
              correctAnswer: questionInfo.correctAnswer,
              explanation: questionInfo.explanation,
              order: i + 1,
              points: 10, // 10 points per question
            };

            questionsData.push({
              ...question,
              lessonName: lesson.name,
              quizLessonOrder: quizInfo.lessonOrder,
            });
          }
        }
      }
    }
  }

  // Insert lessons first
  const lessons = await (
    Lesson as { insertMany: (docs: object[]) => Promise<unknown> }
  ).insertMany(lessonsData);

  // Update quizzes with actual lesson IDs and insert them
  const quizzesWithLessonIds = quizzesData
    .map((quizData) => {
      const lesson = (
        lessons as {
          find: (
            callback: (item: {
              moduleId: mongoose.Types.ObjectId;
              order: number;
            }) => boolean,
          ) => { _id: mongoose.Types.ObjectId } | undefined;
        }
      ).find(
        (l) =>
          l.moduleId.toString() === quizData.moduleId.toString() &&
          l.order === quizData.lessonOrder,
      );
      return {
        ...quizData,
        lessonId: lesson?._id as mongoose.Types.ObjectId | undefined,
      };
    })
    .filter((quiz) => quiz.lessonId); // Only include quizzes with valid lesson IDs

  const quizzes = await (
    Quiz as { insertMany: (docs: object[]) => Promise<unknown> }
  ).insertMany(quizzesWithLessonIds);

  // Update questions with actual quiz IDs and insert them
  const questionsWithQuizIds = questionsData
    .map((questionData) => {
      const quiz = (
        quizzes as {
          find: (
            callback: (item: { lessonOrder: number }) => boolean,
          ) => { _id: mongoose.Types.ObjectId } | undefined;
        }
      ).find((q) => q.lessonOrder === questionData.quizLessonOrder);
      return {
        ...questionData,
        quizId: (quiz?._id as mongoose.Types.ObjectId) || null,
      };
    })
    .filter((question) => question.quizId); // Only include questions with valid quiz IDs

  const questions = await (
    Question as { insertMany: (docs: object[]) => Promise<unknown> }
  ).insertMany(questionsWithQuizIds);

  // Update modules with lessonsCount
  for (const moduleData of modules) {
    const lessonCount = (
      lessons as {
        filter: (
          callback: (item: { moduleId: mongoose.Types.ObjectId }) => boolean,
        ) => { length: number };
      }
    ).filter((l) => l.moduleId.toString() === moduleData._id.toString()).length;
    moduleData.lessonsCount = lessonCount;
    await moduleData.save();
  }

  return {
    lessons,
    quizzes,
    questions,
  };
};
