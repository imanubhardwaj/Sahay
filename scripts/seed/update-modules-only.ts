import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';
import Module from '../../src/models/Module';
import Skill from '../../src/models/Skill';

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

const ALLOWED_SKILLS = ['JavaScript', 'Node.js', 'Express', 'TypeScript', 'React', 'Python', 'MongoDB', 'SQL'];
const LEVELS = ['Beginner', 'Intermediate', 'Advanced'];

const MODULE_DESCRIPTIONS: Record<string, Record<string, string>> = {
  JavaScript: {
    Beginner: 'Learn JavaScript from scratch. Master the fundamentals including variables, data types, operators, conditionals, loops, functions, arrays, objects, DOM manipulation, and more.',
    Intermediate: 'Intermediate JavaScript concepts including closures, prototypes, async/await, ES6+ features, and advanced functions.',
    Advanced: 'Advanced JavaScript patterns, performance optimization, complex application architecture, design patterns, and modern JavaScript features.'
  },
  'Node.js': {
    Beginner: 'Introduction to Node.js, npm, modules, file system operations, and basic server creation.',
    Intermediate: 'Intermediate Node.js concepts including streams, event loop, middleware, REST APIs, and database integration.',
    Advanced: 'Advanced Node.js concepts including clusters, performance optimization, microservices architecture, and production deployment.'
  },
  Express: {
    Beginner: 'Introduction to Express.js, routing, middleware, request/response handling, and basic API creation.',
    Intermediate: 'Intermediate Express concepts including advanced routing, error handling, authentication, REST APIs, and database integration.',
    Advanced: 'Advanced Express patterns, security best practices, performance optimization, microservices, and deployment strategies.'
  },
  TypeScript: {
    Beginner: 'Introduction to TypeScript, type annotations, interfaces, and basic type system.',
    Intermediate: 'Intermediate TypeScript features including generics, utility types, advanced type manipulation, and decorators.',
    Advanced: 'Advanced TypeScript patterns, complex type systems, conditional types, template literal types, and advanced features.'
  },
  React: {
    Beginner: 'Introduction to React, components, JSX, props, state, and basic React concepts.',
    Intermediate: 'Intermediate React concepts including hooks, context API, performance optimization, routing, and testing.',
    Advanced: 'Advanced React patterns, custom hooks, render optimization, concurrent features, server components, and architecture.'
  },
  Python: {
    Beginner: 'Introduction to Python programming, syntax, data types, control structures, functions, and basic concepts.',
    Intermediate: 'Intermediate Python concepts including OOP, modules, file handling, error handling, and data structures.',
    Advanced: 'Advanced Python patterns, decorators, generators, async programming, design patterns, and advanced libraries.'
  },
  MongoDB: {
    Beginner: 'Introduction to MongoDB, CRUD operations, queries, indexes, and basic database concepts.',
    Intermediate: 'Intermediate MongoDB concepts including aggregation, relationships, transactions, and performance optimization.',
    Advanced: 'Advanced MongoDB concepts including aggregation pipelines, sharding, replication, optimization, and production deployment.'
  },
  SQL: {
    Beginner: 'Introduction to SQL, database concepts, basic queries, SELECT, INSERT, UPDATE, DELETE, and table operations.',
    Intermediate: 'Intermediate SQL concepts including JOINs, subqueries, indexes, views, stored procedures, and complex queries.',
    Advanced: 'Advanced SQL patterns, query optimization, window functions, CTEs, database design, and performance tuning.'
  }
};

const MODULE_ICONS: Record<string, string> = {
  JavaScript: 'https://imgs.search.brave.com/riN3Y5QZ4qdUm2ztlyixU0dgB1duwqJWMACBu76LANE/rs:fit:860:0:0:0/g:ce/aHR0cHM6Ly9hLnRo/dW1icy5yZWRkaXRt/ZWRpYS5jb20vekRP/RkpUWGQ2Zm1sRDU4/VkRHeXBpVjk0TGVm/bHoxMXdveG1nYkdZ/NnBfNC5wbmc',
  'Node.js': 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/nodejs/nodejs-original.svg',
  Express: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/express/express-original.svg',
  TypeScript: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/typescript/typescript-original.svg',
  React: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/react/react-original.svg',
  Python: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg',
  MongoDB: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/mongodb/mongodb-original.svg',
  SQL: 'https://cdn.jsdelivr.net/gh/devicons/devicon/icons/postgresql/postgresql-original.svg'
};

const MODULE_IMAGES: Record<string, string> = {
  JavaScript: 'https://images.unsplash.com/photo-1627398242454-45a1465c2479?w=800&h=400&fit=crop',
  'Node.js': 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
  Express: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
  TypeScript: 'https://images.unsplash.com/photo-1516116216624-53e697fedbea?w=800&h=400&fit=crop',
  React: 'https://images.unsplash.com/photo-1633356122544-f134324a6cee?w=800&h=400&fit=crop',
  Python: 'https://images.unsplash.com/photo-1526379095098-d400fd0bf935?w=800&h=400&fit=crop',
  MongoDB: 'https://images.unsplash.com/photo-1558494949-ef010cbdcc31?w=800&h=400&fit=crop',
  SQL: 'https://images.unsplash.com/photo-1544383835-bda2bc66a55d?w=800&h=400&fit=crop'
};

const MODULE_POINTS: Record<string, Record<string, number>> = {
  Beginner: {
    JavaScript: 1700,
    'Node.js': 150,
    Express: 130,
    TypeScript: 150,
    React: 150,
    Python: 125,
    MongoDB: 125,
    SQL: 100
  },
  Intermediate: {
    JavaScript: 200,
    'Node.js': 200,
    Express: 200,
    TypeScript: 180,
    React: 210,
    Python: 175,
    MongoDB: 150,
    SQL: 150
  },
  Advanced: {
    JavaScript: 250,
    'Node.js': 270,
    Express: 250,
    TypeScript: 200,
    React: 270,
    Python: 200,
    MongoDB: 230,
    SQL: 200
  }
};

const MODULE_DURATION: Record<string, Record<string, number>> = {
  Beginner: {
    JavaScript: 1020, // ~17 hours
    'Node.js': 180,
    Express: 160,
    TypeScript: 180,
    React: 180,
    Python: 150,
    MongoDB: 150,
    SQL: 120
  },
  Intermediate: {
    JavaScript: 240,
    'Node.js': 240,
    Express: 240,
    TypeScript: 220,
    React: 250,
    Python: 200,
    MongoDB: 180,
    SQL: 180
  },
  Advanced: {
    JavaScript: 300,
    'Node.js': 320,
    Express: 300,
    TypeScript: 250,
    React: 320,
    Python: 250,
    MongoDB: 280,
    SQL: 240
  }
};

async function updateModules() {
  try {
    await connectDB();
    console.log('✅ Connected to MongoDB');

    // Get all skills
    const allSkills = await Skill.find({});
    console.log(`📚 Found ${allSkills.length} skills`);

    // Find the allowed skills
    const allowedSkills = allSkills.filter(skill => ALLOWED_SKILLS.includes(skill.name));
    
    // Check if all required skills exist
    const missingSkills = ALLOWED_SKILLS.filter(skillName => 
      !allowedSkills.find(s => s.name === skillName)
    );
    
    if (missingSkills.length > 0) {
      console.log(`⚠️  Missing skills: ${missingSkills.join(', ')}`);
      console.log('Creating missing skills...');
      
      for (const skillName of missingSkills) {
        const newSkill = await Skill.create({
          name: skillName,
          description: `${skillName} programming and development`
        });
        allowedSkills.push(newSkill);
        console.log(`✅ Created skill: ${skillName}`);
      }
    }

    // Delete all existing modules
    console.log('🗑️  Deleting all existing modules...');
    const deleteResult = await Module.deleteMany({});
    console.log(`✅ Deleted ${deleteResult.deletedCount} modules`);

    // Create modules for each skill at each level
    const modulesToCreate = [];
    
    for (const skill of allowedSkills) {
      for (const level of LEVELS) {
        const skillName = skill.name;
        const moduleName = skillName === 'JavaScript' && level === 'Beginner' 
          ? 'JavaScript Beginner' 
          : `${skillName} ${level}`;
        
        modulesToCreate.push({
          name: moduleName,
          description: MODULE_DESCRIPTIONS[skillName]?.[level] || `${level} level ${skillName} course`,
          level: level,
          skillId: skill._id,
          duration: MODULE_DURATION[level]?.[skillName] || 180,
          points: MODULE_POINTS[level]?.[skillName] || 150,
          lessonsCount: 0,
          icon: MODULE_ICONS[skillName] || '',
          image: MODULE_IMAGES[skillName] || ''
        });
      }
    }

    // Insert all modules
    console.log(`🌱 Creating ${modulesToCreate.length} modules...`);
    const createdModules = await Module.insertMany(modulesToCreate);
    console.log(`✅ Created ${createdModules.length} modules`);

    // Display summary
    console.log('\n📊 Module Summary:');
    for (const skill of allowedSkills) {
      const skillModules = createdModules.filter(m => 
        m.skillId.toString() === skill._id.toString()
      );
      console.log(`\n${skill.name}:`);
      for (const level of LEVELS) {
        const module = skillModules.find(m => m.level === level);
        if (module) {
          console.log(`  - ${module.name} (${module.level}) - ${module.points} points`);
        }
      }
    }

    console.log('\n🎉 Module update completed successfully!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Error updating modules:', error);
    process.exit(1);
  }
}

// Run the update
if (require.main === module) {
  updateModules();
}

export { updateModules };

