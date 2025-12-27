// Points Economy System for Sahay Platform
// This file contains all constants and calculation functions for the points-based economy

// ============================================
// TYPE DEFINITIONS
// ============================================

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type MentorLevel = 'L1' | 'L2' | 'L3';

// ============================================
// CONSTANTS - EARNING POINTS
// ============================================

/**
 * Initial signup bonus
 */
export const SIGNUP_BONUS = 100;

/**
 * Profile completion bonus (awarded when profile reaches 100%)
 */
export const PROFILE_COMPLETION_BONUS = 100;

/**
 * Points awarded for adding a project
 */
export const PROJECT_ADD_POINTS = 100;

// ============================================
// CONSTANTS - SPENDING POINTS
// ============================================

/**
 * Cost to start a course (after first free course)
 */
export const COURSE_START_COST = 500;

/**
 * Cost for a mock interview session (45-minute session)
 */
export const MOCK_INTERVIEW_COST = 4000;

/**
 * Minimum quiz score percentage required to pass (80%)
 */
export const QUIZ_PASSING_PERCENTAGE = 80;

// ============================================
// COURSE COMPLETION POINTS
// Based on difficulty level:
// - Hard (Advanced): 1000 total (600 running/60%, 400 completion/40%)
// - Medium (Intermediate): 750 total (450 running/60%, 300 completion/40%)
// - Easy (Beginner): 500 total (300 running/60%, 200 completion/40%)
// ============================================

const COURSE_COMPLETION_POINTS = {
  Beginner: 500,    // Easy course
  Intermediate: 750, // Medium course
  Advanced: 1000,   // Hard course
} as const;

// ============================================
// PRACTICE QUESTION POINTS
// Based on difficulty:
// - Easy: 20 points
// - Medium: 30 points
// - Hard: 50 points
// ============================================

const PRACTICE_QUESTION_POINTS = {
  easy: 20,
  medium: 30,
  hard: 50,
} as const;

// ============================================
// MENTORSHIP CALL COSTS
// Based on mentor level:
// - L1: 3000 points
// - L2: 2000 points
// - L3: 1000 points
// ============================================

const MENTORSHIP_CALL_COSTS = {
  L1: 3000,
  L2: 2000,
  L3: 1000,
} as const;

// ============================================
// CALCULATION FUNCTIONS
// ============================================

/**
 * Calculate running points for course progress (60% of total)
 * Points are distributed based on progress percentage
 * @param courseLevel - Course difficulty level
 * @param currentProgress - Current progress percentage (0-100)
 * @param previousProgress - Previous progress percentage (0-100)
 * @returns Points to award for this progress increment
 */
export function calculateRunningPoints(
  courseLevel: CourseLevel,
  currentProgress: number,
  previousProgress: number = 0
): number {
  const totalPoints = COURSE_COMPLETION_POINTS[courseLevel];
  const runningPointsPool = Math.floor(totalPoints * 0.6); // 60% of total
  
  // Calculate points based on progress increment
  const progressIncrement = currentProgress - previousProgress;
  if (progressIncrement <= 0) {
    return 0;
  }
  
  // Award points proportionally to progress increment
  const pointsToAward = Math.floor((runningPointsPool * progressIncrement) / 100);
  
  return pointsToAward;
}

/**
 * Calculate completion bonus for finishing a course (40% of total)
 * @param courseLevel - Course difficulty level
 * @returns Completion bonus points
 */
export function calculateCompletionBonus(courseLevel: CourseLevel): number {
  const totalPoints = COURSE_COMPLETION_POINTS[courseLevel];
  return Math.floor(totalPoints * 0.4); // 40% of total
}

/**
 * Get practice question points based on difficulty
 * @param difficulty - Question difficulty level
 * @returns Points for solving this question
 */
export function getPracticeQuestionPoints(difficulty: QuestionDifficulty): number {
  return PRACTICE_QUESTION_POINTS[difficulty];
}

/**
 * Get mentorship call cost based on mentor level
 * @param mentorLevel - Mentor's level (L1, L2, or L3)
 * @returns Cost in points for a mentorship call
 */
export function getMentorshipCallCost(mentorLevel: MentorLevel): number {
  return MENTORSHIP_CALL_COSTS[mentorLevel];
}

/**
 * Get mock interview cost (standard rate per 45-minute session)
 * @returns Cost in points for a mock interview
 */
export function getMockInterviewCost(): number {
  return MOCK_INTERVIEW_COST;
}

/**
 * Calculate pricing for first mentorship call (50% discount)
 * User pays 50%, but mentor receives full value
 * @param mentorLevel - Mentor's level
 * @returns Object with userPays and mentorReceives amounts
 */
export function calculateFirstCallPrice(mentorLevel: MentorLevel): {
  userPays: number;
  mentorReceives: number;
} {
  const fullPrice = MENTORSHIP_CALL_COSTS[mentorLevel];
  return {
    userPays: Math.floor(fullPrice * 0.5), // User pays 50%
    mentorReceives: fullPrice, // Mentor receives full value
  };
}

// ============================================
// ELIGIBILITY CHECK FUNCTIONS
// ============================================

/**
 * Check if user is eligible for free first course
 * @param hasStartedFirstCourse - Whether user has started their first course
 * @returns True if eligible for free course
 */
export function isEligibleForFreeCourse(hasStartedFirstCourse: boolean): boolean {
  return !hasStartedFirstCourse;
}

/**
 * Check if user is eligible for first call discount (50% off)
 * @param bookings - Array of user's previous bookings
 * @returns True if eligible for discount
 */
export function isEligibleForFirstCallDiscount(
  bookings: Array<{ status: string }>
): boolean {
  // Check if user has any confirmed or completed bookings
  const hasCompletedBooking = bookings.some(
    (booking) => booking.status === 'confirmed' || booking.status === 'completed'
  );
  return !hasCompletedBooking;
}

// ============================================
// TRANSACTION DESCRIPTIONS
// ============================================

export const TRANSACTION_DESCRIPTIONS = {
  SIGNUP_BONUS: 'Welcome bonus for signing up',
  PROFILE_COMPLETION: 'Profile completion bonus (100% complete)',
  PRACTICE_QUESTION: (difficulty: QuestionDifficulty) =>
    `Solved ${difficulty} practice question`,
  COURSE_PROGRESS: (courseName: string, progress: number) =>
    `Course progress: ${courseName} (${progress}%)`,
  COURSE_COMPLETION: (courseName: string) =>
    `Course completion bonus: ${courseName}`,
  PROJECT_ADD: (projectName: string) => `Added project: ${projectName}`,
  COURSE_START: (courseName: string) => `Started course: ${courseName}`,
  COURSE_START_FREE: (courseName: string) =>
    `Started first course (FREE): ${courseName}`,
  MENTORSHIP_BOOKING: (mentorName: string) =>
    `Mentorship session with ${mentorName}`,
  MENTORSHIP_FIRST_CALL: (mentorName: string) =>
    `First mentorship session (50% off) with ${mentorName}`,
  MENTORSHIP_EARNING: (studentName: string) =>
    `Earned from mentorship session with ${studentName}`,
  MOCK_INTERVIEW: (mentorName: string) =>
    `Mock interview session (45 min) with ${mentorName}`,
  REFUND: (reason: string) => `Refund: ${reason}`,
} as const;

// ============================================
// PROFILE COMPLETION CALCULATION
// ============================================

export function calculateProfileCompletionPercentage(user: {
  firstName?: string;
  lastName?: string;
  email?: string;
  bio?: string;
  title?: string;
  location?: string;
  profilePictureAttachmentId?: string;
  skills?: string[];
  userType?: string;
  college?: string;
  company?: string;
  yoe?: number;
}): number {
  // Required fields (must have all of these to reach 100%)
  const requiredFields = [
    { key: 'firstName', weight: 10 },
    { key: 'lastName', weight: 10 },
    { key: 'email', weight: 10 },
    { key: 'bio', weight: 15 },
    { key: 'title', weight: 10 },
    { key: 'location', weight: 10 },
    { key: 'skills', weight: 15, isArray: true, minLength: 1 }, // Skills are required
    { key: 'userType', weight: 10 },
  ];

  // Optional fields (bonus points)
  const optionalFields = [
    { key: 'profilePictureAttachmentId', weight: 5 }, // Optional bonus
  ];

  let totalScore = 0;
  let maxScore = 0;

  // Calculate required fields (must total 100%)
  for (const field of requiredFields) {
    maxScore += field.weight;
    const value = user[field.key as keyof typeof user];
    
    if (field.isArray) {
      if (Array.isArray(value) && value.length >= (field.minLength || 1)) {
        totalScore += field.weight;
      }
    } else if (value && String(value).trim().length > 0) {
      totalScore += field.weight;
    }
  }

  // Add optional fields (bonus, can exceed 100%)
  for (const field of optionalFields) {
    const value = user[field.key as keyof typeof user];
    if (value && String(value).trim().length > 0) {
      totalScore += field.weight;
      maxScore += field.weight;
    }
  }

  // If all required fields are complete, return 100% immediately
  const allRequiredComplete = requiredFields.every(field => {
    const value = user[field.key as keyof typeof user];
    if (field.isArray) {
      return Array.isArray(value) && value.length >= (field.minLength || 1);
    }
    return value && String(value).trim().length > 0;
  });

  if (allRequiredComplete) {
    return 100; // Return 100% when all required fields are complete
  }

  return Math.round((totalScore / maxScore) * 100);
}
