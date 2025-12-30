import mongoose from "mongoose";
import dotenv from "dotenv";
import path from "path";

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), ".env.local") });

// Import all models
import {
  Skill,
  Module,
  Course,
  Lesson,
  Quiz,
  Question,
} from "../../src/models";

// Import seed data
import { seedModules } from "./modules";
import { seedLessonsWithContent } from "./lessons-with-content";

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI;
    if (!mongoUri) {
      throw new Error("MONGODB_URI environment variable is not set");
    }

    await mongoose.connect(mongoUri);
    console.log("✅ Connected to MongoDB");
  } catch (error) {
    console.error("❌ MongoDB connection error:", error);
    process.exit(1);
  }
};

const clearDatabase = async () => {
  try {
    console.log("🗑️  Clearing database...");

    // Clear all collections
    await Promise.all([
      Skill.deleteMany({}),
      Module.deleteMany({}),
      Course.deleteMany({}),
      Lesson.deleteMany({}),
      Quiz.deleteMany({}),
      Question.deleteMany({}),
    ]);

    console.log("✅ Database cleared");
  } catch (error) {
    console.error("❌ Error clearing database:", error);
    throw error;
  }
};

const seedDatabase = async () => {
  try {
    console.log("🌱 Starting database seeding...");

    // Seed in order of dependencies
    const skills = await seedModules([]);
    const modules = await seedModules(skills);
    const { lessons, quizzes, questions } = await seedLessonsWithContent(
      modules
    );

    console.log("✅ Database seeding completed successfully!");
    console.log(`📊 Seeded ${skills.length} skills`);
    console.log(`📊 Seeded ${modules.length} modules`);
    console.log(`📊 Seeded ${lessons.length} lessons`);
    console.log(`📊 Seeded ${quizzes.length} quizzes`);
    console.log(`📊 Seeded ${questions.length} questions`);
  } catch (error) {
    console.error("❌ Error seeding database:", error);
    throw error;
  }
};

const main = async () => {
  try {
    await connectDB();
    await clearDatabase();
    await seedDatabase();
    console.log("🎉 All done!");
    process.exit(0);
  } catch (error) {
    console.error("💥 Fatal error:", error);
    process.exit(1);
  }
};

// Run the seeding script
if (require.main === module) {
  main();
}

export { main as seedDatabase };
