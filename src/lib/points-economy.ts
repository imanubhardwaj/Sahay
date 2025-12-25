/**
 * Sahay Points Economy Configuration
 * 
 * This file contains all point values, rates, and business logic
 * for the Sahay platform's points-based economy.
 */

// ============================================
// EARNING POINTS (INFLOW)
// ============================================

export const SIGNUP_BONUS = 100; // One-time bonus for new users

export const PROFILE_COMPLETION_BONUS = 100; // Rewarded upon 100% profile completion

// Practice Questions Points (based on difficulty)
export const PRACTICE_QUESTION_POINTS = {
  easy: 20,
  medium: 30,
  hard: 50,
} as const;

// Course Completion Points (based on difficulty)
export const COURSE_COMPLETION_POINTS = {
  Beginner: 500,    // Easy
  Intermediate: 750, // Medium
  Advanced: 1000,   // Hard
} as const;

// Course Points Split Logic: 60% running, 40% on completion
export const COURSE_POINTS_SPLIT = {
  running: 0.6,    // 60% awarded as running points (progress)
  completion: 0.4, // 40% awarded upon final completion
} as const;

// Project Addition Points (tentative)
export const PROJECT_ADD_POINTS = 100;

// ============================================
// SPENDING POINTS (OUTFLOW)
// ============================================

// Course Start Cost
export const COURSE_START_COST = 500;

// Mentorship Call Points (by mentor level)
export const MENTORSHIP_CALL_POINTS = {
  L1: 3000, // Elite/Consultants
  L2: 2000, // Top Tier Tech (FAANG, etc.)
  L3: 1000, // Standard/Startup ecosystem
} as const;

// Mock Interview Cost
export const MOCK_INTERVIEW_COST = 4000; // Per 45-minute session

// First Call Discount (platform subsidizes 50%)
export const FIRST_CALL_DISCOUNT = 0.5;

// ============================================
// QUIZ & LESSON PROGRESSION RULES
// ============================================

// Quiz passing percentage required to unlock next lesson
export const QUIZ_PASSING_PERCENTAGE = 80;

// Minimum attempts allowed before showing hints
export const QUIZ_MIN_ATTEMPTS_FOR_HINTS = 2;

// ============================================
// HELPER FUNCTIONS
// ============================================

/**
 * Get points reward for a practice question based on difficulty
 */
export function getPracticeQuestionPoints(difficulty: 'easy' | 'medium' | 'hard'): number {
  return PRACTICE_QUESTION_POINTS[difficulty] || PRACTICE_QUESTION_POINTS.easy;
}

/**
 * Get course completion points based on course level/difficulty
 */
export function getCourseCompletionPoints(level: 'Beginner' | 'Intermediate' | 'Advanced'): number {
  return COURSE_COMPLETION_POINTS[level] || COURSE_COMPLETION_POINTS.Beginner;
}

/**
 * Calculate running points (progress points) for a course
 * @param level - Course difficulty level
 * @param progressPercentage - Current progress percentage (0-100)
 * @param previousProgressPercentage - Previous progress percentage
 */
export function calculateRunningPoints(
  level: 'Beginner' | 'Intermediate' | 'Advanced',
  progressPercentage: number,
  previousProgressPercentage: number = 0
): number {
  const totalCoursePoints = getCourseCompletionPoints(level);
  const runningPool = totalCoursePoints * COURSE_POINTS_SPLIT.running;
  
  // Calculate points for the progress increment
  const progressIncrement = progressPercentage - previousProgressPercentage;
  const pointsEarned = Math.floor((progressIncrement / 100) * runningPool);
  
  return Math.max(0, pointsEarned);
}

/**
 * Calculate completion bonus (40% of total) when course is 100% complete
 */
export function calculateCompletionBonus(level: 'Beginner' | 'Intermediate' | 'Advanced'): number {
  const totalCoursePoints = getCourseCompletionPoints(level);
  return Math.floor(totalCoursePoints * COURSE_POINTS_SPLIT.completion);
}

/**
 * Get mentorship call cost based on mentor level
 */
export function getMentorshipCallCost(mentorLevel: 'L1' | 'L2' | 'L3'): number {
  return MENTORSHIP_CALL_POINTS[mentorLevel] || MENTORSHIP_CALL_POINTS.L3;
}

/**
 * Calculate first call discounted price (user pays 50%, platform subsidizes rest)
 * @param mentorLevel - Mentor's level
 * @returns Object with userPays and platformSubsidy
 */
export function calculateFirstCallPrice(mentorLevel: 'L1' | 'L2' | 'L3'): {
  fullPrice: number;
  userPays: number;
  platformSubsidy: number;
  mentorReceives: number;
} {
  const fullPrice = getMentorshipCallCost(mentorLevel);
  const userPays = Math.floor(fullPrice * FIRST_CALL_DISCOUNT);
  const platformSubsidy = fullPrice - userPays;
  
  return {
    fullPrice,
    userPays,
    platformSubsidy,
    mentorReceives: fullPrice, // Mentor receives full value regardless
  };
}

/**
 * Calculate profile completion percentage based on filled fields
 */
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
  const requiredFields = [
    { key: 'firstName', weight: 10 },
    { key: 'lastName', weight: 10 },
    { key: 'email', weight: 10 },
    { key: 'bio', weight: 15 },
    { key: 'title', weight: 10 },
    { key: 'location', weight: 10 },
    { key: 'profilePictureAttachmentId', weight: 15 },
    { key: 'skills', weight: 10, isArray: true, minLength: 1 },
    { key: 'userType', weight: 10 },
  ];

  let totalScore = 0;
  let maxScore = 0;

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

  return Math.round((totalScore / maxScore) * 100);
}

/**
 * Check if user is eligible for free first course
 * @param courseHistory - Array of user's previous course enrollments
 */
export function isEligibleForFreeCourse(courseHistory: { status: string }[]): boolean {
  // User is eligible if they have no prior course history or no started/completed courses
  if (!courseHistory || courseHistory.length === 0) {
    return true;
  }
  
  // Check if user has any course that's not "not_started"
  const hasActiveCourse = courseHistory.some(
    course => course.status === 'in_progress' || course.status === 'completed'
  );
  
  return !hasActiveCourse;
}

/**
 * Check if user is eligible for first call discount
 * @param bookingHistory - Array of user's previous bookings
 */
export function isEligibleForFirstCallDiscount(bookingHistory: { status: string }[]): boolean {
  // User is eligible if they have no prior completed or confirmed bookings
  if (!bookingHistory || bookingHistory.length === 0) {
    return true;
  }
  
  // Check if user has any successful booking
  const hasCompletedBooking = bookingHistory.some(
    booking => booking.status === 'completed' || booking.status === 'confirmed'
  );
  
  return !hasCompletedBooking;
}

// ============================================
// TRANSACTION DESCRIPTIONS
// ============================================

export const TRANSACTION_DESCRIPTIONS = {
  SIGNUP_BONUS: 'Welcome bonus for joining Sahay!',
  PROFILE_COMPLETION: 'Bonus for completing your profile 100%',
  PRACTICE_QUESTION: (difficulty: string) => `Solved ${difficulty} practice question`,
  COURSE_PROGRESS: (courseName: string, progress: number) => 
    `Progress points for ${courseName} (${progress}%)`,
  COURSE_COMPLETION: (courseName: string) => 
    `Completion bonus for completing ${courseName}`,
  COURSE_START: (courseName: string) => 
    `Started course: ${courseName}`,
  COURSE_START_FREE: (courseName: string) => 
    `Started first course (FREE): ${courseName}`,
  PROJECT_ADD: (projectName: string) => 
    `Added project to portfolio: ${projectName}`,
  MENTORSHIP_BOOKING: (mentorName: string) => 
    `Mentorship session with ${mentorName}`,
  MENTORSHIP_FIRST_CALL: (mentorName: string) => 
    `First mentorship session (50% off) with ${mentorName}`,
  MENTORSHIP_EARNING: (studentName: string) => 
    `Payment from ${studentName} for mentorship session`,
  MOCK_INTERVIEW: (interviewerName: string) => 
    `Mock interview session with ${interviewerName}`,
  REFUND: (reason: string) => 
    `Refund: ${reason}`,
};

export type CourseLevel = 'Beginner' | 'Intermediate' | 'Advanced';
export type QuestionDifficulty = 'easy' | 'medium' | 'hard';
export type MentorLevel = 'L1' | 'L2' | 'L3';

