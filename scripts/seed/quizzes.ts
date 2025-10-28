import { Quiz } from '../../src/models';

export const seedQuizzes = async (modules: any[], lessons: any[]) => {
  console.log('🌱 Seeding quizzes...');
  
  const quizzesData = [
    {
      name: 'JavaScript Fundamentals Quiz',
      description: 'Test your knowledge of JavaScript basics',
      duration: 30, // 30 minutes
      moduleId: modules.find(m => m.name === 'JavaScript Fundamentals')?._id,
      lessonId: lessons.find(l => l.name === 'Variables and Data Types')?._id,
      numberOfQuestions: 10,
      points: 50
    },
    {
      name: 'React Components Quiz',
      description: 'Quiz on React component concepts',
      duration: 25, // 25 minutes
      moduleId: modules.find(m => m.name === 'React Components')?._id,
      lessonId: lessons.find(l => l.name === 'Creating Your First Component')?._id,
      numberOfQuestions: 8,
      points: 40
    },
    {
      name: 'Node.js Backend Quiz',
      description: 'Test your Node.js and Express knowledge',
      duration: 35, // 35 minutes
      moduleId: modules.find(m => m.name === 'Node.js Backend Development')?._id,
      lessonId: lessons.find(l => l.name === 'Setting up Express Server')?._id,
      numberOfQuestions: 12,
      points: 60
    },
    {
      name: 'Python Basics Quiz',
      description: 'Python programming fundamentals quiz',
      duration: 20, // 20 minutes
      moduleId: modules.find(m => m.name === 'Python Basics')?._id,
      lessonId: lessons.find(l => l.name === 'Python Syntax and Variables')?._id,
      numberOfQuestions: 6,
      points: 30
    },
    {
      name: 'Java OOP Quiz',
      description: 'Object-oriented programming in Java',
      duration: 40, // 40 minutes
      moduleId: modules.find(m => m.name === 'Java Object-Oriented Programming')?._id,
      lessonId: lessons.find(l => l.name === 'Classes and Objects')?._id,
      numberOfQuestions: 15,
      points: 75
    }
  ];

  const quizzes = await Quiz.insertMany(quizzesData);
  console.log(`✅ Seeded ${quizzes.length} quizzes`);
  
  return quizzes;
};
