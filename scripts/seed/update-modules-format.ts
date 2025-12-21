import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { Module } from '../../src/models';

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

// Icon and image URLs for each technology
const moduleAssets: Record<string, { icon: string; image: string }> = {
  'JavaScript': {
    icon: 'https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc',
    image: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop'
  },
  'TypeScript': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
    image: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop'
  },
  'HTML': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/html5/html5-original.svg',
    image: 'https://images.unsplash.com/photo-1467232004584-a241de8bcf5d?w=800&h=400&fit=crop'
  },
  'CSS': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg',
    image: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=800&h=400&fit=crop'
  },
  'React': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
    image: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop'
  },
  'Angular': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/angularjs/angularjs-original.svg',
    image: 'https://images.unsplash.com/photo-1551650975-87deedd944c3?w=800&h=400&fit=crop'
  },
  'Node.js': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop'
  },
  'MongoDB': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop'
  },
  'Express': {
    icon: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
    image: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop'
  }
};

// Estimated lessons count based on duration (roughly 1 lesson per 15-20 minutes)
const getEstimatedLessonsCount = (duration: number): number => {
  return Math.max(1, Math.round(duration / 15));
};

const updateModules = async () => {
  console.log('🔧 Updating modules to match JavaScript Beginner format...\n');

  // Get all modules that need updating (those without icon/image or with lessonsCount = 0)
  const modulesToUpdate = await Module.find({
    deletedAt: null,
    $or: [
      { icon: { $exists: false } },
      { icon: null },
      { image: { $exists: false } },
      { image: null },
      { lessonsCount: 0 }
    ]
  }).populate('skillId', 'name');

  console.log(`📋 Found ${modulesToUpdate.length} modules to update\n`);

  let updatedCount = 0;

  for (const module of modulesToUpdate) {
    const skillName = (module.skillId as any)?.name;
    const assets = moduleAssets[skillName || ''] || {
      icon: 'https://imgs.search.brave.com/0amGyAiF3uFKKjlFLdALYRLoeTeTOygh1JCd-4MlrA8/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9jZG4t/aWNvbnMtcG5nLmZy/ZWVwaWsuY29tLzI1/Ni83ODM3Lzc4Mzcx/NTcucG5nP3NlbXQ9/YWlzX3doaXRlX2xh/YmVs',
      image: 'https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=800&h=400&fit=crop'
    };

    const updates: any = {};
    
    if (!module.icon) {
      updates.icon = assets.icon;
    }
    
    if (!module.image) {
      updates.image = assets.image;
    }
    
    if (!module.lessonsCount || module.lessonsCount === 0) {
      updates.lessonsCount = getEstimatedLessonsCount(module.duration);
    }

    if (Object.keys(updates).length > 0) {
      await Module.updateOne(
        { _id: module._id },
        { $set: updates }
      );
      
      console.log(`✅ Updated: ${module.name}`);
      console.log(`   - Icon: ${updates.icon ? 'Added' : 'Already exists'}`);
      console.log(`   - Image: ${updates.image ? 'Added' : 'Already exists'}`);
      console.log(`   - Lessons Count: ${updates.lessonsCount || module.lessonsCount}`);
      updatedCount++;
    }
  }

  console.log(`\n✅ Successfully updated ${updatedCount} modules`);
  
  // Verify updates
  const modulesWithoutAssets = await Module.countDocuments({
    deletedAt: null,
    $or: [
      { icon: { $exists: false } },
      { icon: null },
      { image: { $exists: false } },
      { image: null },
      { lessonsCount: 0 }
    ]
  });

  if (modulesWithoutAssets === 0) {
    console.log('✅ All modules now have icon, image, and lessonsCount!');
  } else {
    console.log(`⚠️  ${modulesWithoutAssets} modules still need updates`);
  }
};

const main = async () => {
  try {
    await connectDB();
    await updateModules();
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

export { main as updateModulesFormat };

