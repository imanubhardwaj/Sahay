import { UserQuizSubmission } from '../../src/models';

export const seedUserQuizSubmissions = async (quizzes: any[], users: any[]) => {
  console.log('🌱 Seeding user quiz submissions...');
  
  const userQuizSubmissionsData = [
    {
      quizId: quizzes[0]?._id,
      userId: users[0]?._id,
      score: 85,
      maxScore: 100,
      report: 'Good understanding of JavaScript fundamentals'
    }
  ];

  const userQuizSubmissions = await UserQuizSubmission.insertMany(userQuizSubmissionsData);
  console.log(`✅ Seeded ${userQuizSubmissions.length} user quiz submissions`);
  
  return userQuizSubmissions;
};
