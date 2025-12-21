import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { Skill, Module, Course } from '../../src/models';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Linkdein:0KNy75C7ovMdb74T@cluster0.6jhyn.mongodb.net/Sahay';
    await mongoose.connect(mongoUri);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
};

const verifyData = async () => {
  console.log('🔍 Verifying JavaScript Beginner course and modules...\n');
  
  // Count all modules
  const totalModules = await Module.countDocuments({ deletedAt: null });
  console.log(`📊 Total modules in database: ${totalModules}`);
  
  // Find JavaScript Beginner module
  const jsSkill = await Skill.findOne({ name: 'JavaScript' });
  if (!jsSkill) {
    console.error('❌ JavaScript skill not found');
    return;
  }
  
  const jsBeginnerModule = await Module.findOne({ 
    name: 'JavaScript Beginner',
    skillId: jsSkill._id 
  });
  
  console.log(`\n📚 JavaScript Beginner Module:`);
  if (jsBeginnerModule) {
    console.log(`   ✅ Found: ${jsBeginnerModule.name}`);
    console.log(`   📝 Description: ${jsBeginnerModule.description.substring(0, 60)}...`);
    console.log(`   ⏱️  Duration: ${jsBeginnerModule.duration} minutes`);
    console.log(`   📖 Lessons Count: ${jsBeginnerModule.lessonsCount || 0}`);
    console.log(`   🆔 ID: ${jsBeginnerModule._id}`);
  } else {
    console.log(`   ❌ Not found!`);
  }
  
  // Find JavaScript Beginner course
  const jsBeginnerCourse = await Course.findOne({ name: 'JavaScript Beginner' })
    .populate('subModuleIds', 'name');
  
  console.log(`\n🎓 JavaScript Beginner Course:`);
  if (jsBeginnerCourse) {
    console.log(`   ✅ Found: ${jsBeginnerCourse.name}`);
    console.log(`   📝 Description: ${jsBeginnerCourse.description.substring(0, 60)}...`);
    console.log(`   📊 Level: ${jsBeginnerCourse.level}`);
    console.log(`   ⏱️  Duration: ${jsBeginnerCourse.duration} minutes`);
    console.log(`   🔗 Linked Modules: ${jsBeginnerCourse.subModuleIds.map((m: any) => m.name).join(', ')}`);
    console.log(`   🆔 ID: ${jsBeginnerCourse._id}`);
  } else {
    console.log(`   ❌ Not found!`);
  }
  
  // List all modules
  const allModules = await Module.find({ deletedAt: null })
    .populate('skillId', 'name')
    .sort({ createdAt: -1 });
  
  console.log(`\n📋 All ${allModules.length} Modules:`);
  allModules.forEach((module, index) => {
    console.log(`   ${index + 1}. ${module.name} (${module.skillId?.name || 'No Skill'}) - ${module.level}`);
  });
  
  // List all courses
  const allCourses = await Course.find({ deletedAt: null })
    .sort({ createdAt: -1 });
  
  console.log(`\n🎓 All ${allCourses.length} Courses:`);
  allCourses.forEach((course, index) => {
    console.log(`   ${index + 1}. ${course.name} - ${course.level}`);
  });
};

const main = async () => {
  try {
    await connectDB();
    await verifyData();
    await mongoose.disconnect();
    console.log('\n✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

if (require.main === module) {
  main();
}

export { main as verifyJavaScriptCourse };

