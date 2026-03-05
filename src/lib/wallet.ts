import connectDB from './mongodb';
import { Wallet, Transaction } from '@/models';
import { TRANSACTION_TYPE, TRANSACTION_SOURCE } from './constants';
import {
  SIGNUP_BONUS,
  PROFILE_COMPLETION_BONUS,
  PROJECT_ADD_POINTS,
  COURSE_START_COST,
  getPracticeQuestionPoints,
  calculateRunningPoints,
  calculateCompletionBonus,
  getMentorshipCallCost,
  calculateFirstCallPrice,
  getMockInterviewCost,
  TRANSACTION_DESCRIPTIONS,
  type CourseLevel,
  type QuestionDifficulty,
  type MentorLevel,
} from './points-economy';

// ============================================
// CORE WALLET FUNCTIONS
// ============================================

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
 * CRITICAL: Validate wallet balance before any transaction
 * This MUST be called before attempting any spending operation
 * @param userId - User ID
 * @param requiredPoints - Points needed for the transaction
 * @returns Object with validation result and balance info
 */
export async function validateWalletBalance(
  userId: string,
  requiredPoints: number
): Promise<{
  isValid: boolean;
  currentBalance: number;
  requiredPoints: number;
  shortfall: number;
  error?: string;
}> {
  try {
    await connectDB();
    
    const wallet = await Wallet.findOne({ userId });
    const currentBalance = wallet?.balance || wallet?.points || 0;
    const shortfall = Math.max(0, requiredPoints - currentBalance);
    const isValid = currentBalance >= requiredPoints;
    
    return {
      isValid,
      currentBalance,
      requiredPoints,
      shortfall,
      error: isValid 
        ? undefined 
        : `Insufficient balance. You have ${currentBalance} points but need ${requiredPoints} points. You're short by ${shortfall} points.`,
    };
  } catch (error) {
    console.error('Error validating wallet balance:', error);
    return {
      isValid: false,
      currentBalance: 0,
      requiredPoints,
      shortfall: requiredPoints,
      error: 'Failed to validate wallet balance. Please try again.',
    };
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
 * @param withSignupBonus - Whether to add signup bonus (default: true)
 * @returns Promise<Wallet> - Created or existing wallet
 */
export async function createUserWallet(userId: string, withSignupBonus: boolean = true) {
  try {
    await connectDB();
    
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      const initialBalance = withSignupBonus ? SIGNUP_BONUS : 0;
      wallet = await Wallet.create({
        userId,
        balance: initialBalance,
        totalEarned: initialBalance,
        totalSpent: 0
      });

      // Create transaction record for signup bonus
      if (withSignupBonus) {
        await Transaction.create({
          userId,
          walletId: wallet._id,
          type: TRANSACTION_TYPE.Earn,
          points: SIGNUP_BONUS,
          source: TRANSACTION_SOURCE.Signup,
          description: TRANSACTION_DESCRIPTIONS.SIGNUP_BONUS,
        });
      }
    }
    
    return wallet;
  } catch (error) {
    console.error('Error creating user wallet:', error);
    throw error;
  }
}

// ============================================
// EARNING POINTS FUNCTIONS
// ============================================

/**
 * Award signup bonus to a new user
 * @param userId - User ID
 */
export async function awardSignupBonus(userId: string): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
}> {
  try {
    await connectDB();
    
    let wallet = await Wallet.findOne({ userId });
    
    if (!wallet) {
      wallet = await createUserWallet(userId, true);
      return {
        success: true,
        points: SIGNUP_BONUS,
        newBalance: wallet.balance,
      };
    }

    // Check if signup bonus was already awarded
    const existingBonus = await Transaction.findOne({
      userId,
      source: TRANSACTION_SOURCE.Signup,
    });

    if (existingBonus) {
      return {
        success: false,
        points: 0,
        newBalance: wallet.balance,
      };
    }

    wallet.balance += SIGNUP_BONUS;
    wallet.totalEarned += SIGNUP_BONUS;
    await wallet.save();

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Earn,
      points: SIGNUP_BONUS,
      source: TRANSACTION_SOURCE.Signup,
      description: TRANSACTION_DESCRIPTIONS.SIGNUP_BONUS,
    });

    return {
      success: true,
      points: SIGNUP_BONUS,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error awarding signup bonus:', error);
    throw error;
  }
}

/**
 * Award profile completion bonus
 * @param userId - User ID
 */
export async function awardProfileCompletionBonus(userId: string): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
  alreadyAwarded?: boolean;
}> {
  try {
    await connectDB();
    
    // Check if already awarded
    const existingBonus = await Transaction.findOne({
      userId,
      source: TRANSACTION_SOURCE.ProfileCompletion,
    });

    if (existingBonus) {
      const wallet = await Wallet.findOne({ userId });
      return {
        success: false,
        points: 0,
        newBalance: wallet?.balance || 0,
        alreadyAwarded: true,
      };
    }

    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await createUserWallet(userId, false);
    }

    wallet.balance += PROFILE_COMPLETION_BONUS;
    wallet.totalEarned += PROFILE_COMPLETION_BONUS;
    await wallet.save();

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Earn,
      points: PROFILE_COMPLETION_BONUS,
      source: TRANSACTION_SOURCE.ProfileCompletion,
      description: TRANSACTION_DESCRIPTIONS.PROFILE_COMPLETION,
    });

    return {
      success: true,
      points: PROFILE_COMPLETION_BONUS,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error awarding profile completion bonus:', error);
    throw error;
  }
}

/**
 * Award points for solving a practice question
 * @param userId - User ID
 * @param problemId - Problem ID (for reference)
 * @param difficulty - Problem difficulty
 */
export async function awardPracticeQuestionPoints(
  userId: string,
  problemId: string,
  difficulty: QuestionDifficulty
): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
}> {
  try {
    await connectDB();
    
    const points = getPracticeQuestionPoints(difficulty);
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await createUserWallet(userId, false);
    }

    wallet.balance += points;
    wallet.totalEarned += points;
    await wallet.save();

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Earn,
      points,
      source: TRANSACTION_SOURCE.PracticeQuestion,
      description: TRANSACTION_DESCRIPTIONS.PRACTICE_QUESTION(difficulty),
      referenceId: problemId,
    });

    return {
      success: true,
      points,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error awarding practice question points:', error);
    throw error;
  }
}

/**
 * Award running points for course progress (60% pool)
 * @param userId - User ID
 * @param moduleId - Module/Course ID
 * @param courseName - Course name for description
 * @param courseLevel - Course difficulty level
 * @param currentProgress - Current progress percentage
 * @param previousProgress - Previous progress percentage
 */
export async function awardCourseProgressPoints(
  userId: string,
  moduleId: string,
  courseName: string,
  courseLevel: CourseLevel,
  currentProgress: number,
  previousProgress: number = 0
): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
}> {
  try {
    await connectDB();
    
    const points = calculateRunningPoints(courseLevel, currentProgress, previousProgress);
    
    if (points <= 0) {
      const wallet = await Wallet.findOne({ userId });
      return {
        success: true,
        points: 0,
        newBalance: wallet?.balance || 0,
      };
    }
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await createUserWallet(userId, false);
    }

    wallet.balance += points;
    wallet.totalEarned += points;
    await wallet.save();

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Earn,
      points,
      source: TRANSACTION_SOURCE.CourseProgress,
      description: TRANSACTION_DESCRIPTIONS.COURSE_PROGRESS(courseName, currentProgress),
      referenceId: moduleId,
    });

    return {
      success: true,
      points,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error awarding course progress points:', error);
    throw error;
  }
}

/**
 * Award completion bonus for finishing a course (40% pool)
 * @param userId - User ID
 * @param moduleId - Module/Course ID
 * @param courseName - Course name for description
 * @param courseLevel - Course difficulty level
 */
export async function awardCourseCompletionBonus(
  userId: string,
  moduleId: string,
  courseName: string,
  courseLevel: CourseLevel
): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
  alreadyAwarded?: boolean;
}> {
  try {
    await connectDB();
    
    // Check if completion bonus already awarded for this course
    const existingBonus = await Transaction.findOne({
      userId,
      referenceId: moduleId,
      source: TRANSACTION_SOURCE.CourseCompletion,
    });

    if (existingBonus) {
      const wallet = await Wallet.findOne({ userId });
      return {
        success: false,
        points: 0,
        newBalance: wallet?.balance || 0,
        alreadyAwarded: true,
      };
    }

    const points = calculateCompletionBonus(courseLevel);
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await createUserWallet(userId, false);
    }

    wallet.balance += points;
    wallet.totalEarned += points;
    await wallet.save();

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Earn,
      points,
      source: TRANSACTION_SOURCE.CourseCompletion,
      description: TRANSACTION_DESCRIPTIONS.COURSE_COMPLETION(courseName),
      referenceId: moduleId,
    });

    return {
      success: true,
      points,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error awarding course completion bonus:', error);
    throw error;
  }
}

/**
 * Award points for adding a project
 * @param userId - User ID
 * @param projectId - Project ID
 * @param projectName - Project name for description
 */
export async function awardProjectAddPoints(
  userId: string,
  projectId: string,
  projectName: string
): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
}> {
  try {
    await connectDB();
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await createUserWallet(userId, false);
    }

    wallet.balance += PROJECT_ADD_POINTS;
    wallet.totalEarned += PROJECT_ADD_POINTS;
    await wallet.save();

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Earn,
      points: PROJECT_ADD_POINTS,
      source: TRANSACTION_SOURCE.ProjectAdd,
      description: TRANSACTION_DESCRIPTIONS.PROJECT_ADD(projectName),
      referenceId: projectId,
    });

    return {
      success: true,
      points: PROJECT_ADD_POINTS,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error awarding project add points:', error);
    throw error;
  }
}

// ============================================
// SPENDING POINTS FUNCTIONS
// ============================================

/**
 * Deduct points for starting a course
 * @param userId - User ID
 * @param moduleId - Module/Course ID
 * @param courseName - Course name for description
 * @param isFirstCourse - Whether this is user's first course (FREE)
 */
export async function deductCourseStartPoints(
  userId: string,
  moduleId: string,
  courseName: string,
  isFirstCourse: boolean
): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
  isFree: boolean;
  error?: string;
}> {
  try {
    await connectDB();
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await createUserWallet(userId, false);
    }

    // First course is FREE
    if (isFirstCourse) {
      await Transaction.create({
        userId,
        walletId: wallet._id,
        type: TRANSACTION_TYPE.Redeem,
        points: 0,
        source: TRANSACTION_SOURCE.CourseStart,
        description: TRANSACTION_DESCRIPTIONS.COURSE_START_FREE(courseName),
        referenceId: moduleId,
      });

      return {
        success: true,
        points: 0,
        newBalance: wallet.balance,
        isFree: true,
      };
    }

    // Check if user has enough balance
    if (wallet.balance < COURSE_START_COST) {
      return {
        success: false,
        points: 0,
        newBalance: wallet.balance,
        isFree: false,
        error: `Insufficient balance. You need ${COURSE_START_COST} points but have ${wallet.balance} points.`,
      };
    }

    wallet.balance -= COURSE_START_COST;
    wallet.totalSpent += COURSE_START_COST;
    await wallet.save();

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Redeem,
      points: COURSE_START_COST,
      source: TRANSACTION_SOURCE.CourseStart,
      description: TRANSACTION_DESCRIPTIONS.COURSE_START(courseName),
      referenceId: moduleId,
    });

    return {
      success: true,
      points: COURSE_START_COST,
      newBalance: wallet.balance,
      isFree: false,
    };
  } catch (error) {
    console.error('Error deducting course start points:', error);
    throw error;
  }
}

/**
 * Deduct points for mentorship booking
 * @param userId - User ID
 * @param bookingId - Booking ID
 * @param mentorName - Mentor name for description
 * @param mentorLevel - Mentor's level
 * @param isFirstCall - Whether this is user's first mentorship call (50% discount)
 * @param customAmount - Override: use this amount instead of mentor level (e.g. schedule price)
 */
export async function deductMentorshipPoints(
  userId: string,
  bookingId: string,
  mentorName: string,
  mentorLevel: MentorLevel,
  isFirstCall: boolean,
  customAmount?: number
): Promise<{
  success: boolean;
  pointsDeducted: number;
  mentorReceives: number;
  newBalance: number;
  isDiscounted: boolean;
  error?: string;
}> {
  try {
    await connectDB();
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await createUserWallet(userId, false);
    }

    let pointsToDeduct: number;
    let mentorReceives: number;

    if (customAmount != null && customAmount > 0) {
      pointsToDeduct = isFirstCall ? Math.floor(customAmount * 0.5) : customAmount;
      mentorReceives = customAmount;
    } else if (isFirstCall) {
      const pricing = calculateFirstCallPrice(mentorLevel);
      pointsToDeduct = pricing.userPays;
      mentorReceives = pricing.mentorReceives;
    } else {
      pointsToDeduct = getMentorshipCallCost(mentorLevel);
      mentorReceives = pointsToDeduct;
    }

    // Check if user has enough balance
    if (wallet.balance < pointsToDeduct) {
      return {
        success: false,
        pointsDeducted: 0,
        mentorReceives: 0,
        newBalance: wallet.balance,
        isDiscounted: isFirstCall,
        error: `Insufficient balance. You need ${pointsToDeduct} points but have ${wallet.balance} points.`,
      };
    }

    wallet.balance -= pointsToDeduct;
    wallet.totalSpent += pointsToDeduct;
    await wallet.save();

    const description = isFirstCall
      ? TRANSACTION_DESCRIPTIONS.MENTORSHIP_FIRST_CALL(mentorName)
      : TRANSACTION_DESCRIPTIONS.MENTORSHIP_BOOKING(mentorName);

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Redeem,
      points: pointsToDeduct,
      source: TRANSACTION_SOURCE.Mentor,
      description,
      referenceId: bookingId,
    });

    return {
      success: true,
      pointsDeducted: pointsToDeduct,
      mentorReceives,
      newBalance: wallet.balance,
      isDiscounted: isFirstCall,
    };
  } catch (error) {
    console.error('Error deducting mentorship points:', error);
    throw error;
  }
}

/**
 * Deduct points for mock interview booking
 * @param userId - User ID
 * @param bookingId - Booking ID
 * @param mentorName - Mentor name for description
 * @returns Result object with success status and balance info
 */
export async function deductMockInterviewPoints(
  userId: string,
  bookingId: string,
  mentorName: string
): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
  error?: string;
}> {
  try {
    await connectDB();
    
    const pointsToDeduct = getMockInterviewCost();
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await createUserWallet(userId, false);
    }

    // Check if user has enough balance
    if (wallet.balance < pointsToDeduct) {
      return {
        success: false,
        points: 0,
        newBalance: wallet.balance,
        error: `Insufficient balance. You need ${pointsToDeduct} points but have ${wallet.balance} points.`,
      };
    }

    wallet.balance -= pointsToDeduct;
    wallet.totalSpent += pointsToDeduct;
    await wallet.save();

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Redeem,
      points: pointsToDeduct,
      source: TRANSACTION_SOURCE.MockInterview,
      description: TRANSACTION_DESCRIPTIONS.MOCK_INTERVIEW(mentorName),
      referenceId: bookingId,
    });

    return {
      success: true,
      points: pointsToDeduct,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error deducting mock interview points:', error);
    throw error;
  }
}

/**
 * Credit points to mentor after completed session
 * @param mentorId - Mentor's User ID
 * @param bookingId - Booking ID
 * @param studentName - Student name for description
 * @param points - Points to credit
 */
export async function creditMentorEarnings(
  mentorId: string,
  bookingId: string,
  studentName: string,
  points: number
): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
}> {
  try {
    await connectDB();
    
    let wallet = await Wallet.findOne({ userId: mentorId });
    if (!wallet) {
      wallet = await createUserWallet(mentorId, false);
    }

    wallet.balance += points;
    wallet.totalEarned += points;
    await wallet.save();

    await Transaction.create({
      userId: mentorId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Earn,
      points,
      source: TRANSACTION_SOURCE.Mentor,
      description: TRANSACTION_DESCRIPTIONS.MENTORSHIP_EARNING(studentName),
      referenceId: bookingId,
    });

    return {
      success: true,
      points,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error crediting mentor earnings:', error);
    throw error;
  }
}

/**
 * Process refund to user wallet
 * @param userId - User ID
 * @param referenceId - Reference ID (booking, course, etc.)
 * @param points - Points to refund
 * @param reason - Reason for refund
 */
export async function processRefund(
  userId: string,
  referenceId: string,
  points: number,
  reason: string
): Promise<{
  success: boolean;
  points: number;
  newBalance: number;
}> {
  try {
    await connectDB();
    
    let wallet = await Wallet.findOne({ userId });
    if (!wallet) {
      wallet = await createUserWallet(userId, false);
    }

    wallet.balance += points;
    // Don't add to totalEarned since this is a refund of spent points
    wallet.totalSpent -= points;
    await wallet.save();

    await Transaction.create({
      userId,
      walletId: wallet._id,
      type: TRANSACTION_TYPE.Earn,
      points,
      source: TRANSACTION_SOURCE.Redeem,
      description: TRANSACTION_DESCRIPTIONS.REFUND(reason),
      referenceId,
    });

    return {
      success: true,
      points,
      newBalance: wallet.balance,
    };
  } catch (error) {
    console.error('Error processing refund:', error);
    throw error;
  }
}
