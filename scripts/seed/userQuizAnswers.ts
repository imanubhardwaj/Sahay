import { UserQuizAnswer } from '../../src/models';

export const seedUserQuizAnswers = async (users: any[], questions: any[]) => {
  console.log('🌱 Seeding user quiz answers...');
  
  const userQuizAnswersData = [
    {
      userId: users[0]?._id,
      questionId: questions[0]?._id,
      answer: 'all of the above',
      type: 'mcq'
    }
  ];

  const userQuizAnswers = await UserQuizAnswer.insertMany(userQuizAnswersData);
  console.log(`✅ Seeded ${userQuizAnswers.length} user quiz answers`);
  
  return userQuizAnswers;
};
