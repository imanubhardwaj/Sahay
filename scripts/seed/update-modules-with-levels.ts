import mongoose from 'mongoose';

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb+srv://Linkdein:0KNy75C7ovMdb74T@cluster0.6jhyn.mongodb.net/Sahay';

// Connect to MongoDB
async function connectDB() {
  try {
    await mongoose.connect(MONGODB_URI);
    console.log('✅ Connected to MongoDB');
  } catch (error) {
    console.error('❌ MongoDB connection error:', error);
    process.exit(1);
  }
}

// Define schemas once
const moduleSchema = new mongoose.Schema({}, { strict: false });
const lessonSchema = new mongoose.Schema({}, { strict: false });
const quizSchema = new mongoose.Schema({}, { strict: false });
const skillSchema = new mongoose.Schema({}, { strict: false });

// Helper to get or create model
function getModel(name: string, schema: mongoose.Schema) {
  return mongoose.models[name] || mongoose.model(name, schema);
}

// Update existing modules with levels and lesson counts
async function updateModules() {
  const Module = getModel('Module', moduleSchema);
  const Lesson = getModel('Lesson', lessonSchema);
  
  try {
    console.log('\n📚 Updating Modules with Levels...');
    
    const modules = await Module.find({});
    console.log(`Found ${modules.length} modules`);

    const levelPatterns = {
      'Beginner': ['basic', 'intro', 'fundamentals', 'getting started', 'beginner', 'start', '101'],
      'Intermediate': ['intermediate', 'advanced basics', 'beyond', 'practical', 'real-world'],
      'Advanced': ['advanced', 'expert', 'master', 'deep dive', 'professional', 'senior']
    };

    let updated = 0;
    for (const module of modules) {
      // Determine level based on module name
      let level = 'Beginner';
      const nameLower = module.name.toLowerCase();
      
      for (const [lvl, patterns] of Object.entries(levelPatterns)) {
        if (patterns.some(pattern => nameLower.includes(pattern))) {
          level = lvl;
          break;
        }
      }

      // Count lessons for this module
      const lessonsCount = await Lesson.countDocuments({ moduleId: module._id });

      // Update module
      await Module.updateOne(
        { _id: module._id },
        { 
          $set: { 
            level,
            lessonsCount
          } 
        }
      );

      console.log(`  ✓ ${module.name} → ${level} (${lessonsCount} lessons)`);
      updated++;
    }

    console.log(`\n✅ Updated ${updated} modules with levels`);
  } catch (error) {
    console.error('❌ Error updating modules:', error);
    throw error;
  }
}

// Update lessons with proper ordering
async function updateLessons() {
  const Lesson = getModel('Lesson', lessonSchema);
  const Module = getModel('Module', moduleSchema);
  
  try {
    console.log('\n📖 Updating Lessons with Order...');
    
    const modules = await Module.find({});
    let totalUpdated = 0;

    for (const module of modules) {
      const lessons = await Lesson.find({ moduleId: module._id }).sort({ createdAt: 1 });
      
      if (lessons.length === 0) continue;

      console.log(`\n  Module: ${module.name} (${lessons.length} lessons)`);

      for (let i = 0; i < lessons.length; i++) {
        await Lesson.updateOne(
          { _id: lessons[i]._id },
          { $set: { order: i + 1 } }
        );
        console.log(`    ${i + 1}. ${lessons[i].name}`);
        totalUpdated++;
      }
    }

    console.log(`\n✅ Updated ${totalUpdated} lessons with proper ordering`);
  } catch (error) {
    console.error('❌ Error updating lessons:', error);
    throw error;
  }
}

// Update quizzes to link with lessons
async function updateQuizzes() {
  const Quiz = getModel('Quiz', quizSchema);
  const Lesson = getModel('Lesson', lessonSchema);
  
  try {
    console.log('\n🎯 Updating Quizzes with Lesson Links...');
    
    const quizzes = await Quiz.find({});
    let updated = 0;

    for (const quiz of quizzes) {
      // Find lessons for this module
      const lessons = await Lesson.find({ moduleId: quiz.moduleId }).sort({ order: 1 });
      
      if (lessons.length === 0) continue;

      // If quiz doesn't have a lesson, assign to first lesson
      if (!quiz.lessonId && lessons.length > 0) {
        const lesson = lessons[0];
        await Quiz.updateOne(
          { _id: quiz._id },
          { 
            $set: { 
              lessonId: lesson._id,
              lessonOrder: lesson.order || 1
            } 
          }
        );
        console.log(`  ✓ Linked quiz "${quiz.name}" to lesson "${lesson.name}"`);
        updated++;
      }
    }

    console.log(`\n✅ Updated ${updated} quizzes with lesson links`);
  } catch (error) {
    console.error('❌ Error updating quizzes:', error);
    throw error;
  }
}

// Create sample modules with proper structure if database is empty
async function createSampleModules() {
  const Module = getModel('Module', moduleSchema);
  const Lesson = getModel('Lesson', lessonSchema);
  const Quiz = getModel('Quiz', quizSchema);
  const Skill = getModel('Skill', skillSchema);
  
  try {
    const existingModules = await Module.countDocuments();
    
    if (existingModules > 0) {
      console.log('\n⏭️  Modules already exist, skipping sample creation');
      return;
    }

    console.log('\n🆕 Creating Sample Modules...');

    // Get or create a skill
    let skill = await Skill.findOne({});
    if (!skill) {
      skill = await Skill.create({
        name: 'Web Development',
        description: 'Learn web development from scratch',
        category: 'Programming',
        demand: 'High'
      });
    }

    // Create sample modules with lessons and quizzes
    const sampleModules = [
      {
        name: 'JavaScript Fundamentals',
        description: 'Learn the basics of JavaScript programming',
        level: 'Beginner',
        duration: 120,
        points: 100,
        lessons: [
          { name: 'Variables and Data Types', content: 'Learn about variables, strings, numbers, and booleans' },
          { name: 'Functions and Scope', content: 'Understanding functions, parameters, and scope' },
          { name: 'Arrays and Objects', content: 'Working with arrays and objects in JavaScript' },
        ]
      },
      {
        name: 'React.js Essentials',
        description: 'Build modern web applications with React',
        level: 'Intermediate',
        duration: 180,
        points: 150,
        lessons: [
          { name: 'React Components', content: 'Creating and using React components' },
          { name: 'State and Props', content: 'Managing component state and passing props' },
          { name: 'React Hooks', content: 'Using useState, useEffect, and custom hooks' },
        ]
      },
      {
        name: 'Advanced TypeScript',
        description: 'Master TypeScript for large-scale applications',
        level: 'Advanced',
        duration: 240,
        points: 200,
        lessons: [
          { name: 'Advanced Types', content: 'Union types, intersection types, and type guards' },
          { name: 'Generics', content: 'Creating reusable components with generics' },
          { name: 'Decorators and Metadata', content: 'Using decorators for meta-programming' },
        ]
      }
    ];

    for (const moduleData of sampleModules) {
      const module = await Module.create({
        name: moduleData.name,
        description: moduleData.description,
        level: moduleData.level,
        skillId: skill._id,
        duration: moduleData.duration,
        points: moduleData.points,
        lessonsCount: moduleData.lessons.length
      });

      console.log(`\n  ✓ Created module: ${module.name} (${module.level})`);

      // Create lessons for this module
      for (let i = 0; i < moduleData.lessons.length; i++) {
        const lessonData = moduleData.lessons[i];
        
        const lesson = await Lesson.create({
          name: lessonData.name,
          content: lessonData.content,
          contentArray: [lessonData.content],
          type: 'Text',
          moduleId: module._id,
          skillId: skill._id,
          duration: 30,
          points: 30,
          order: i + 1
        });

        console.log(`    ${i + 1}. Created lesson: ${lesson.name}`);

        // Create quiz for this lesson
        const quiz = await Quiz.create({
          name: `${lessonData.name} Quiz`,
          description: `Test your knowledge of ${lessonData.name}`,
          duration: 15,
          moduleId: module._id,
          lessonId: lesson._id,
          lessonOrder: i + 1,
          numberOfQuestions: 5,
          points: 20
        });

        console.log(`       + Created quiz: ${quiz.name}`);
      }
    }

    console.log(`\n✅ Created ${sampleModules.length} sample modules with lessons and quizzes`);
  } catch (error) {
    console.error('❌ Error creating sample modules:', error);
    throw error;
  }
}

// Main execution
async function main() {
  try {
    console.log('🚀 Starting Module Seed Script\n');
    console.log('=' .repeat(60));
    
    await connectDB();
    
    // Check if we need to create sample data
    const Module = getModel('Module', moduleSchema);
    const moduleCount = await Module.countDocuments();
    
    if (moduleCount === 0) {
      console.log('\n📦 No modules found. Creating sample data...');
      await createSampleModules();
    } else {
      console.log(`\n📦 Found ${moduleCount} existing modules. Updating...`);
      await updateModules();
      await updateLessons();
      await updateQuizzes();
    }
    
    console.log('\n' + '='.repeat(60));
    console.log('✅ Seed script completed successfully!\n');
    
    // Display summary
    const Lesson = getModel('Lesson', lessonSchema);
    const Quiz = getModel('Quiz', quizSchema);
    
    const finalModuleCount = await Module.countDocuments();
    const lessonCount = await Lesson.countDocuments();
    const quizCount = await Quiz.countDocuments();
    
    console.log('📊 Database Summary:');
    console.log(`   - Modules: ${finalModuleCount}`);
    console.log(`   - Lessons: ${lessonCount}`);
    console.log(`   - Quizzes: ${quizCount}`);
    console.log('');
    
    // Show breakdown by level
    const beginnerCount = await Module.countDocuments({ level: 'Beginner' });
    const intermediateCount = await Module.countDocuments({ level: 'Intermediate' });
    const advancedCount = await Module.countDocuments({ level: 'Advanced' });
    
    console.log('📈 Modules by Level:');
    console.log(`   - Beginner: ${beginnerCount}`);
    console.log(`   - Intermediate: ${intermediateCount}`);
    console.log(`   - Advanced: ${advancedCount}`);
    console.log('');
    
  } catch (error) {
    console.error('\n❌ Seed script failed:', error);
    process.exit(1);
  } finally {
    await mongoose.disconnect();
    console.log('👋 Disconnected from MongoDB\n');
    process.exit(0);
  }
}

// Run the script
main();

