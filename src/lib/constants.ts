export enum USER_TYPES {
  StudentFresher = "student_fresher",
  WorkingProfessional = "working_professional",
}

export enum MODULE_STATUS {
  NotStarted = "not_started",
  InProgress = "in_progress",
  Completed = "completed",
}

export enum USER_ROLE {
  Student = "student",
  Mentor = "mentor",
}

export enum DAYS_OF_WEEK {
  Monday = "monday",
  Tuesday = "tuesday",
  Wednesday = "wednesday",
  Thursday = "thursday",
  Friday = "friday",
  Saturday = "saturday",
  Sunday = "sunday",
}

export enum USER_SKILL_PROFICIENCY {
  Beginner = "beginner",
  Intermediate = "intermediate",
  Advanced = "advanced",
  Expert = "expert",
}

export enum QUESTION_TYPE {
  MCQ = "mcq",
  Subjective = "subjective",
  Code = "code",
}

export enum ATTACHMENT_TYPE {
  Image = "image",
  Video = "video",
  Audio = "audio",
  Document = "document",
  Pdf = "pdf",
  Code = "code",
  Other = "other",
}

export enum SOCIAL_LINK_PLATFORM {
  Github = "github",
  Linkedin = "linkedin",
  Twitter = "twitter",
  Instagram = "instagram",
  Facebook = "facebook",
  Youtube = "youtube",
  Website = "website",
  Portfolio = "portfolio",
  Other = "other",
}

export enum POST_REACTION {
  Like = "like",
  Heart = "heart",
  Laugh = "laugh",
  Angry = "angry",
  Sad = "sad",
  Wow = "wow",
}

export enum TRANSACTION_TYPE {
  Earn = "earn",
  Redeem = "redeem",
}

export enum TRANSACTION_SOURCE {
  Quiz = "quiz",
  Lesson = "lesson",
  Redeem = "redeem",
  Mentor = "mentor",
  Referral = "referral",
  Bonus = "bonus",
}

export enum BOOKING_STATUS {
  Pending = "pending",
  Confirmed = "confirmed",
  Cancelled = "cancelled",
  Completed = "completed",
  NoShow = "no-show",
}

// Mentor Tiers - Admin-managed levels
export enum MENTOR_LEVEL {
  L1 = "L1", // Elite/Consultants: High-net-worth individuals, investors, founders, or consultants with >1 Cr packages
  L2 = "L2", // Top Tier Tech: High earners working at top product companies (FAANG, Apple, Google)
  L3 = "L3", // Standard: Regular employees, largely from the startup ecosystem
}

// Admin emails - only these users can access admin features
export const ADMIN_EMAILS: string[] = [
  "kartikeyebhardwaj2003@gmail.com",
  "bhardwaj93kartiekey@gmail.com",
  "admin@sahay.com",
  // Add more admin emails as needed
];

// Default point rates per level (can be overridden with customPointRate)
export const MENTOR_LEVEL_RATES = {
  [MENTOR_LEVEL.L1]: 500, // Elite mentors charge 500 points/hour
  [MENTOR_LEVEL.L2]: 300, // Top tier tech charge 300 points/hour
  [MENTOR_LEVEL.L3]: 100, // Standard mentors charge 100 points/hour
};
