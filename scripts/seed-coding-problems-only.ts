import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import { seedCodingProblems } from './seed/codingProblems';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });

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

const main = async () => {
  try {
    await connectDB();
    console.log('🌱 Seeding coding problems only...');
    await seedCodingProblems();
    console.log('🎉 Coding problems seeded successfully!');
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

