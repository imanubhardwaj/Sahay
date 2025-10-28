import { Lesson, Quiz, Question } from '../../src/models';
import { detailedLessonsContent, quizData } from './detailed-lessons-content';

export const seedLessonsWithContent = async (modules: any[], skills: any[]) => {
  console.log('🌱 Seeding lessons with detailed content and quizzes...');
  
  const findModule = (name: string) => modules.find(m => m.name === name)?._id;
  const findSkill = (name: string) => skills.find(s => s.name === name)?._id;
  
  // Clear existing data
  await Lesson.deleteMany({});
  await Quiz.deleteMany({});
  await Question.deleteMany({});
  console.log('🗑️  Cleared existing lessons, quizzes, and questions.');

  const lessonsData = [];
  const quizzesData = [];
  const questionsData = [];

  // Process each module
  for (const module of modules) {
    const moduleName = module.name;
    const moduleContent = detailedLessonsContent[moduleName];
    
    if (!moduleContent) {
      console.log(`⚠️  No detailed content found for module: ${moduleName}`);
      // Create basic lessons for modules without detailed content
      for (let i = 1; i <= 15; i++) {
        const lesson = {
          name: `${moduleName} Lesson ${i}`,
          contentArray: [`Content for ${moduleName} Lesson ${i}`],
          type: 'Text',
          content: `This is the detailed content for ${moduleName} Lesson ${i}. It covers fundamental concepts and practical examples.`,
          moduleId: module._id,
          skillId: module.skillId,
          duration: 20 + (i * 2),
          points: 20 + (i * 2),
          order: i
        };
        lessonsData.push(lesson);
      }
      continue;
    }

    console.log(`📚 Processing module: ${moduleName} with ${moduleContent.length} lessons`);

    // Create lessons for this module
    for (const lessonContent of moduleContent) {
      const lesson = {
        name: lessonContent.name,
        contentArray: lessonContent.keyTopics || [],
        type: 'Text',
        content: lessonContent.content,
        moduleId: module._id,
        skillId: module.skillId,
        duration: 20 + (lessonContent.order * 2), // Varying duration
        points: 20 + (lessonContent.order * 2),   // Varying points
        order: lessonContent.order
      };
      
      lessonsData.push(lesson);
    }

    // Create quizzes and questions for this module
    const moduleQuizData = quizData[moduleName];
    if (moduleQuizData) {
      for (const quizInfo of moduleQuizData) {
        const lesson = lessonsData.find(l => 
          l.moduleId.toString() === module._id.toString() && 
          l.order === quizInfo.lessonOrder
        );
        
        if (lesson) {
          // Create quiz
          const quiz = {
            moduleId: module._id,
            lessonId: lesson._id, // This will be set after lessons are inserted
            lessonOrder: quizInfo.lessonOrder,
            numberOfQuestions: quizInfo.questions.length,
            points: lesson.points,
            timeLimit: 10, // 10 minutes
            passingScore: 60 // 60% to pass
          };
          
          quizzesData.push({
            ...quiz,
            lessonName: lesson.name
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
              points: 10 // 10 points per question
            };
            
            questionsData.push({
              ...question,
              lessonName: lesson.name,
              quizLessonOrder: quizInfo.lessonOrder
            });
          }
        }
      }
    }
  }

  // Insert lessons first
  const lessons = await Lesson.insertMany(lessonsData);
  console.log(`✅ Seeded ${lessons.length} lessons with detailed content`);

  // Update quizzes with actual lesson IDs and insert them
  const quizzesWithLessonIds = quizzesData.map(quizData => {
    const lesson = lessons.find(l => 
      l.moduleId.toString() === quizData.moduleId.toString() && 
      l.order === quizData.lessonOrder
    );
    return {
      ...quizData,
      lessonId: lesson?._id
    };
  }).filter(quiz => quiz.lessonId); // Only include quizzes with valid lesson IDs

  console.log(`📊 Found ${quizzesWithLessonIds.length} valid quizzes out of ${quizzesData.length} quiz data entries`);

  const quizzes = await Quiz.insertMany(quizzesWithLessonIds);
  console.log(`✅ Seeded ${quizzes.length} quizzes`);

  // Update questions with actual quiz IDs and insert them
  const questionsWithQuizIds = questionsData.map(questionData => {
    const quiz = quizzes.find(q => 
      q.lessonOrder === questionData.quizLessonOrder
    );
    return {
      ...questionData,
      quizId: quiz?._id
    };
  }).filter(question => question.quizId); // Only include questions with valid quiz IDs

  console.log(`📊 Found ${questionsWithQuizIds.length} valid questions out of ${questionsData.length} question data entries`);

  const questions = await Question.insertMany(questionsWithQuizIds);
  console.log(`✅ Seeded ${questions.length} questions`);

  // Update modules with lessonsCount
  for (const module of modules) {
    const lessonCount = lessons.filter(l => l.moduleId.toString() === module._id.toString()).length;
    module.lessonsCount = lessonCount;
    await module.save();
  }
  
  console.log('✅ Updated modules with lesson counts');
  
  return {
    lessons,
    quizzes,
    questions
  };
};
