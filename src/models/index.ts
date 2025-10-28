// Base Model
export { baseSchema, updateUpdatedAt, softDelete } from './BaseModel';

// Core Models
export { default as Skill } from './Skill';
export { default as Module } from './Module';
export { default as Course } from './Course';
export { default as Lesson } from './Lesson';
export { default as Quiz } from './Quiz';
export { default as Question } from './Question';

// Content Models
export { default as Attachment } from './Attachment';
export { default as SocialLink } from './SocialLink';
export { default as Community } from './Community';
export { default as Comment } from './Comment';
export { default as Post } from './Post';
export { default as PostComment } from './PostComment';
export { default as PostReaction } from './PostReaction';

// Organization Models
export { default as College } from './College';
export { default as Company } from './Company';
export { default as Project } from './Project';
export { default as Experience } from './Experience';

// Transaction Models
export { default as Transaction } from './Transaction';
export { default as Wallet } from './Wallet';

// User Models
export { default as User } from './User';
export { default as WorkingProfessional } from './WorkingProfessional';
export { default as UserBooking } from './UserBooking';
export { default as UserSchedule } from './UserSchedule';
export { default as UserResume } from './UserResume';
export { default as UserProject } from './UserProject';
export { default as UserSocialLink } from './UserSocialLink';
export { default as UserSkill } from './UserSkill';
export { default as UserCollege } from './UserCollege';
export { default as UserCompany } from './UserCompany';
export { default as UserQuizAnswer } from './UserQuizAnswer';
export { default as UserQuizSubmission } from './UserQuizSubmission';
export { default as UserLessonProgress } from './UserLessonProgress';
export { default as LessonProgress } from './LessonProgress';
export { default as ModuleProgress } from './ModuleProgress';
export { default as UserCourseProgress } from './UserCourseProgress';

// Mentorship Models
export { default as MentorProfile } from './MentorProfile';

// Legacy Models (for backward compatibility)
export { default as LegacyQuestion } from './Question';
export { default as Schedule } from './Schedule';
export { default as Booking } from './Booking';
