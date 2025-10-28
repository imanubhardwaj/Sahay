import { Wallet } from '../../src/models';

export const seedWallets = async (users: any[]) => {
  console.log('🌱 Seeding wallets...');
  
  const walletsData = users.map((user, index) => ({
    userId: user._id,
    points: Math.floor(Math.random() * 1000) + 100 // Random points between 100-1099
  }));

  const wallets = await Wallet.insertMany(walletsData);
  console.log(`✅ Seeded ${wallets.length} wallets`);
  
  return wallets;
};
