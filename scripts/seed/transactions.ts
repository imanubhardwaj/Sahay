import { Transaction } from '../../src/models';

export const seedTransactions = async (users: any[], wallets: any[]) => {
  console.log('🌱 Seeding transactions...');
  
  const transactionsData = [
    {
      userId: users[0]?._id,
      walletId: wallets[0]?._id,
      type: 'earn',
      points: 50,
      source: 'quiz',
      description: 'Completed JavaScript Fundamentals Quiz',
      referenceId: 'quiz_1'
    },
    {
      userId: users[1]?._id,
      walletId: wallets[1]?._id,
      type: 'earn',
      points: 75,
      source: 'lesson',
      description: 'Completed React Components Lesson',
      referenceId: 'lesson_1'
    }
  ];

  const transactions = await Transaction.insertMany(transactionsData);
  console.log(`✅ Seeded ${transactions.length} transactions`);
  
  return transactions;
};
