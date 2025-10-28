import connectDB from './mongodb';
import { Wallet } from '@/models';

/**
 * Get user's wallet balance (points)
 * @param userId - User ID
 * @returns Promise<number> - User's current points balance
 */
export async function getUserPoints(userId: string): Promise<number> {
  try {
    await connectDB();
    
    const wallet = await Wallet.findOne({ userId });
    if (!wallet) return 0;
    
    // Handle both old schema (points) and new schema (balance)
    return wallet.balance || wallet.points || 0;
  } catch (error) {
    console.error('Error fetching user points:', error);
    return 0;
  }
}

/**
 * Get user's wallet with full details
 * @param userId - User ID
 * @returns Promise<Wallet | null> - User's wallet or null if not found
 */
export async function getUserWallet(userId: string) {
  try {
    await connectDB();
    
    const wallet = await Wallet.findOne({ userId });
    return wallet;
  } catch (error) {
    console.error('Error fetching user wallet:', error);
    return null;
  }
}

/**
 * Create a wallet for a user if it doesn't exist
 * @param userId - User ID
 * @returns Promise<Wallet> - Created or existing wallet
 */
export async function createUserWallet(userId: string) {
  try {
    await connectDB();
    
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await Wallet.create({
        userId,
        balance: 0,
        totalEarned: 0,
        totalSpent: 0
      });
    }
    
    return wallet;
  } catch (error) {
    console.error('Error creating user wallet:', error);
    throw error;
  }
}
