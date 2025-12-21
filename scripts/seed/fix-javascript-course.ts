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

const fixJavaScriptCourse = async () => {
  console.log('🔧 Fixing JavaScript Beginner course...');
  
  // Find the JavaScript skill
  const jsSkill = await Skill.findOne({ name: 'JavaScript' });
  if (!jsSkill) {
    console.error('❌ JavaScript skill not found');
    return;
  }
  
  // Find the "JavaScript Beginner" module (the one with full lessons)
  const jsBeginnerModule = await Module.findOne({ 
    name: 'JavaScript Beginner',
    skillId: jsSkill._id 
  });
  
  // Also check for "JavaScript Fundamentals" module
  const jsFundamentalsModule = await Module.findOne({ 
    name: 'JavaScript Fundamentals',
    skillId: jsSkill._id 
  });
  
  console.log('📋 Found modules:');
  console.log(`   - JavaScript Beginner: ${jsBeginnerModule ? '✅' : '❌'}`);
  console.log(`   - JavaScript Fundamentals: ${jsFundamentalsModule ? '✅' : '❌'}`);
  
  // Find existing JavaScript Beginner course
  const existingCourse = await Course.findOne({ name: 'JavaScript Beginner' });
  
  if (jsBeginnerModule) {
    // Update or create course to use the correct module
    if (existingCourse) {
      // Update the course to use JavaScript Beginner module
      existingCourse.subModuleIds = [jsBeginnerModule._id];
      existingCourse.duration = jsBeginnerModule.duration || 1020;
      await existingCourse.save();
      console.log('✅ Updated JavaScript Beginner course to use correct module');
    } else {
      // Create the course if it doesn't exist
      const course = await Course.create({
        name: 'JavaScript Beginner',
        description: 'Learn JavaScript from scratch. Master the fundamentals including variables, data types, operators, conditionals, loops, functions, arrays, objects, DOM manipulation, and more.',
        skillIds: [jsSkill._id],
        duration: jsBeginnerModule.duration || 1020,
        level: 'Beginner',
        subModuleIds: [jsBeginnerModule._id],
        tags: ['JavaScript', 'Beginner', 'Programming', 'Web Development']
      });
      console.log('✅ Created JavaScript Beginner course with correct module');
    }
  } else if (jsFundamentalsModule) {
    // If only JavaScript Fundamentals exists, update course to use it
    if (existingCourse) {
      existingCourse.subModuleIds = [jsFundamentalsModule._id];
      existingCourse.duration = jsFundamentalsModule.duration || 120;
      await existingCourse.save();
      console.log('✅ Updated JavaScript Beginner course to use JavaScript Fundamentals module');
    }
  } else {
    console.log('⚠️  No JavaScript Beginner or Fundamentals module found');
  }
  
  // Show the final course
  const finalCourse = await Course.findOne({ name: 'JavaScript Beginner' })
    .populate('subModuleIds', 'name description duration lessonsCount');
  
  if (finalCourse) {
    console.log('\n📚 JavaScript Beginner Course:');
    console.log(`   Name: ${finalCourse.name}`);
    console.log(`   Level: ${finalCourse.level}`);
    console.log(`   Duration: ${finalCourse.duration} minutes`);
    console.log(`   Modules: ${finalCourse.subModuleIds.map((m: any) => m.name).join(', ')}`);
  }
};

const main = async () => {
  try {
    await connectDB();
    await fixJavaScriptCourse();
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
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

export { main as fixJavaScriptCourse };

