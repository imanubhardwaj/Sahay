import { Question } from '../../src/models';

export const seedQuestions = async (quizzes: any[], lessons: any[], modules: any[]) => {
  console.log('🌱 Seeding questions...');
  
  const questionsData = [
    {
      type: 'mcq',
      quizId: quizzes[0]?._id,
      lessonId: lessons[0]?._id,
      moduleId: modules[0]?._id,
      text: 'What is the output of the following code?',
      options: [
        { id: '1', type: 'mcq', content: 'var' },
        { id: '2', type: 'mcq', content: 'let' },
        { id: '3', type: 'mcq', content: 'const' },
        { id: '4', type: 'mcq', content: 'all of the above' }
      ],
      answer: {
        type: 'mcq',
        content: 'all of the above',
        optionId: '4'
      }
    },
    {
      type: 'subjective',
      quizId: quizzes[0]?._id,
      lessonId: lessons[0]?._id,
      moduleId: modules[0]?._id,
      options: [],
      answer: {
        type: 'subjective',
        content: 'JavaScript is a high-level programming language'
      }
    }
  ];

  const questions = await Question.insertMany(questionsData);
  console.log(`✅ Seeded ${questions.length} questions`);
  
  return questions;
};
