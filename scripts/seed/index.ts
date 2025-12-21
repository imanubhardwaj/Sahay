import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

// Import all models
import {
  Skill,
  Module,
  Course,
  Lesson,
  Quiz,
  Question,
  Attachment,
  SocialLink,
  Community,
  Comment,
  Post,
  PostComment,
  PostReaction,
  College,
  Company,
  Project,
  Experience,
  Transaction,
  Wallet,
  User,
  WorkingProfessional,
  UserBooking,
  UserSchedule,
  UserResume,
  UserProject,
  UserSocialLink,
  UserSkill,
  UserCollege,
  UserCompany,
  UserQuizAnswer,
  UserQuizSubmission,
  Schedule,
  Booking
} from '../../src/models';

// Import seed data
import { seedSkills } from './skills';
import { seedModules } from './modules';
import { seedCourses } from './courses';
import { seedLessons } from './lessons';
import { seedQuizzes } from './quizzes';
import { seedQuestions } from './questions';
import { seedAttachments } from './attachments';
import { seedSocialLinks } from './socialLinks';
import { seedCommunities } from './communities';
import { seedComments } from './comments';
import { seedPosts } from './posts';
import { seedPostComments } from './postComments';
import { seedPostReactions } from './postReactions';
import { seedColleges } from './colleges';
import { seedCompanies } from './companies';
import { seedProjects } from './projects';
import { seedExperiences } from './experiences';
import { seedTransactions } from './transactions';
import { seedWallets } from './wallets';
import { seedUsers } from './users';
import { seedWorkingProfessionals } from './workingProfessionals';
import { seedUserBookings } from './userBookings';
import { seedUserSchedules } from './userSchedules';
import { seedUserResumes } from './userResumes';
import { seedUserProjects } from './userProjects';
import { seedUserSocialLinks } from './userSocialLinks';
import { seedUserSkills } from './userSkills';
import { seedUserColleges } from './userColleges';
import { seedUserCompanies } from './userCompanies';
import { seedUserQuizAnswers } from './userQuizAnswers';
import { seedUserQuizSubmissions } from './userQuizSubmissions';
import { seedSchedules } from './schedules';
import { seedBookings } from './bookings';
import { seedCodingProblems } from './codingProblems';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error('MONGODB_URI environment variable is not set');
    }
    
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    console.log('🗑️  Clearing database...');
    
    // Clear all collections
    await Promise.all([
      Skill.deleteMany({}),
      Module.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
      Attachment.deleteMany({}),
      SocialLink.deleteMany({}),
      Community.deleteMany({}),
      Comment.deleteMany({}),
      Post.deleteMany({}),
      PostComment.deleteMany({}),
      PostReaction.deleteMany({}),
      College.deleteMany({}),
      Company.deleteMany({}),
      Project.deleteMany({}),
      Experience.deleteMany({}),
      Transaction.deleteMany({}),
      Wallet.deleteMany({}),
      User.deleteMany({}),
      WorkingProfessional.deleteMany({}),
      UserBooking.deleteMany({}),
      UserSchedule.deleteMany({}),
      UserResume.deleteMany({}),
      UserProject.deleteMany({}),
      UserSocialLink.deleteMany({}),
      UserSkill.deleteMany({}),
      UserCollege.deleteMany({}),
      UserCompany.deleteMany({}),
      UserQuizAnswer.deleteMany({}),
      UserQuizSubmission.deleteMany({}),
      Schedule.deleteMany({}),
      Booking.deleteMany({})
    ]);
    
    console.log('✅ Database cleared');
  } catch (error) {
    console.error('❌ Error clearing database:', error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log('🌱 Starting database seeding...');
    
    // Seed in order of dependencies
    const skills = await seedSkills();
    const colleges = await seedColleges();
    const companies = await seedCompanies();
    const attachments = await seedAttachments();
    const socialLinks = await seedSocialLinks();
    const projects = await seedProjects();
    
    const modules = await seedModules(skills);
    const courses = await seedCourses(skills, modules);
    const lessons = await seedLessons(modules, skills);
    const quizzes = await seedQuizzes(modules, lessons);
    const questions = await seedQuestions(quizzes, lessons, modules);
    
    const users = await seedUsers(colleges, attachments);
    const wallets = await seedWallets(users);
    const transactions = await seedTransactions(users, wallets);
    
    const communities = await seedCommunities(users, skills);
    const posts = await seedPosts(users, communities, skills, attachments);
    const comments = await seedComments(users, posts);
    const postComments = await seedPostComments(posts, comments, users);
    const postReactions = await seedPostReactions(posts, users);
    
    const workingProfessionals = await seedWorkingProfessionals(users, companies);
    const experiences = await seedExperiences(companies, skills);
    
    const userBookings = await seedUserBookings(users);
    const userSchedules = await seedUserSchedules(users);
    const userResumes = await seedUserResumes(users, attachments);
    const userProjects = await seedUserProjects(users, projects);
    const userSocialLinks = await seedUserSocialLinks(users, socialLinks);
    const userSkills = await seedUserSkills(users, skills);
    const userColleges = await seedUserColleges(users, colleges);
    const userCompanies = await seedUserCompanies(users, companies);
    const userQuizAnswers = await seedUserQuizAnswers(users, questions);
    const userQuizSubmissions = await seedUserQuizSubmissions(quizzes, users);
    
    const schedules = await seedSchedules(users);
    const bookings = await seedBookings(users, schedules);
    const codingProblems = await seedCodingProblems();
    
    console.log('✅ Database seeding completed successfully!');
    console.log(`📊 Seeded ${skills.length} skills`);
    console.log(`📊 Seeded ${modules.length} modules`);
    console.log(`📊 Seeded ${courses.length} courses`);
    console.log(`📊 Seeded ${lessons.length} lessons`);
    console.log(`📊 Seeded ${quizzes.length} quizzes`);
    console.log(`📊 Seeded ${questions.length} questions`);
    console.log(`📊 Seeded ${users.length} users`);
    console.log(`📊 Seeded ${wallets.length} wallets`);
    console.log(`📊 Seeded ${transactions.length} transactions`);
    console.log(`📊 Seeded ${communities.length} communities`);
    console.log(`📊 Seeded ${posts.length} posts`);
    console.log(`📊 Seeded ${comments.length} comments`);
    console.log(`📊 Seeded ${colleges.length} colleges`);
    console.log(`📊 Seeded ${companies.length} companies`);
    console.log(`📊 Seeded ${projects.length} projects`);
    console.log(`📊 Seeded ${experiences.length} experiences`);
    
  } catch (error) {
    console.error('❌ Error seeding database:', error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await clearDatabase();
    await seedDatabase();
    console.log('🎉 All done!');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    process.exit(1);
  }
};

// Run the seeding script
if (require.main === module) {
  main();
}

export { main as seedDatabase };
