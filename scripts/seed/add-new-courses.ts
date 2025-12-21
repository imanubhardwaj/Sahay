import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load environment variables - try both .env.local and .env
dotenv.config({ path: path.join(process.cwd(), '.env.local') });
dotenv.config({ path: path.join(process.cwd(), '.env') });

import { Skill, Module, Course } from '../../src/models';

const connectDB = async () => {
  try {
    const mongoUri = process.env.MONGODB_URI || 'mongodb+srv://Linkdein:0KNy75C7ovMdb74T@cluster0.6jhyn.mongodb.net/Sahay';
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

const addNewSkills = async () => {
  console.log('🌱 Adding new skills...');
  
  const newSkills = [
    {
      name: 'Angular',
      description: 'A TypeScript-based web application framework for building dynamic single-page applications',
      parentSkillId: null
    },
    {
      name: 'Express',
      description: 'A fast, unopinionated, minimalist web framework for Node.js',
      parentSkillId: null
    }
  ];

  const addedSkills = [];
  for (const skillData of newSkills) {
    const existing = await Skill.findOne({ name: skillData.name });
    if (!existing) {
      const skill = await Skill.create(skillData);
      addedSkills.push(skill);
      console.log(`✅ Added skill: ${skillData.name}`);
    } else {
      addedSkills.push(existing);
      console.log(`⏭️  Skill already exists: ${skillData.name}`);
    }
  }

  // Get all skills for module/course creation
  const allSkills = await Skill.find({});
  console.log(`✅ Total skills: ${allSkills.length}`);
  
  return allSkills;
};

const addNewModules = async (skills: any[]) => {
  console.log('🌱 Adding new modules...');
  
  const newModules = [
    // JavaScript modules
    {
      name: 'JavaScript Intermediate',
      description: 'Intermediate JavaScript concepts including closures, prototypes, async/await, and ES6+ features',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'JavaScript')?._id,
      duration: 240,
      points: 200
    },
    {
      name: 'JavaScript Advanced',
      description: 'Advanced JavaScript patterns, performance optimization, and complex application architecture',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'JavaScript')?._id,
      duration: 300,
      points: 250
    },
    // TypeScript modules
    {
      name: 'TypeScript Beginner',
      description: 'Introduction to TypeScript, type annotations, interfaces, and basic type system',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'TypeScript')?._id,
      duration: 180,
      points: 150
    },
    {
      name: 'TypeScript Intermediate',
      description: 'Intermediate TypeScript features including generics, utility types, and advanced type manipulation',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'TypeScript')?._id,
      duration: 220,
      points: 180
    },
    // HTML modules
    {
      name: 'HTML Intermediate',
      description: 'Intermediate HTML concepts including forms, media elements, accessibility, and best practices',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'HTML')?._id,
      duration: 150,
      points: 125
    },
    {
      name: 'HTML Advanced',
      description: 'Advanced HTML techniques, web components, progressive web apps, and modern HTML APIs',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'HTML')?._id,
      duration: 200,
      points: 175
    },
    // CSS modules
    {
      name: 'CSS Beginner',
      description: 'Introduction to CSS, selectors, properties, layout basics, and styling fundamentals',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'CSS')?._id,
      duration: 120,
      points: 100
    },
    {
      name: 'CSS Advanced',
      description: 'Advanced CSS techniques including animations, transforms, Grid, Flexbox mastery, and CSS architecture',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'CSS')?._id,
      duration: 240,
      points: 200
    },
    // React modules
    {
      name: 'React Intermediate',
      description: 'Intermediate React concepts including hooks, context API, performance optimization, and testing',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'React')?._id,
      duration: 250,
      points: 210
    },
    {
      name: 'React Advanced',
      description: 'Advanced React patterns, custom hooks, render optimization, concurrent features, and architecture',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'React')?._id,
      duration: 320,
      points: 270
    },
    // Angular modules
    {
      name: 'Angular Beginner',
      description: 'Introduction to Angular framework, components, templates, data binding, and basic concepts',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'Angular')?._id,
      duration: 200,
      points: 170
    },
    {
      name: 'Angular Intermediate',
      description: 'Intermediate Angular concepts including services, dependency injection, routing, and forms',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'Angular')?._id,
      duration: 280,
      points: 230
    },
    {
      name: 'Angular Advanced',
      description: 'Advanced Angular patterns, RxJS, state management, performance optimization, and enterprise architecture',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'Angular')?._id,
      duration: 360,
      points: 300
    },
    // Node.js modules
    {
      name: 'Node.js Beginner',
      description: 'Introduction to Node.js, npm, modules, file system operations, and basic server creation',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'Node.js')?._id,
      duration: 180,
      points: 150
    },
    {
      name: 'Node.js Advanced',
      description: 'Advanced Node.js concepts including streams, clusters, performance optimization, and microservices',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'Node.js')?._id,
      duration: 320,
      points: 270
    },
    // MongoDB modules
    {
      name: 'MongoDB Beginner',
      description: 'Introduction to MongoDB, CRUD operations, queries, indexes, and basic database concepts',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'MongoDB')?._id,
      duration: 150,
      points: 125
    },
    {
      name: 'MongoDB Advanced',
      description: 'Advanced MongoDB concepts including aggregation pipelines, sharding, replication, and optimization',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'MongoDB')?._id,
      duration: 280,
      points: 230
    },
    // Express modules
    {
      name: 'Express Beginner',
      description: 'Introduction to Express.js, routing, middleware, request/response handling, and basic API creation',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'Express')?._id,
      duration: 160,
      points: 130
    },
    {
      name: 'Express Intermediate',
      description: 'Intermediate Express concepts including advanced routing, error handling, authentication, and REST APIs',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'Express')?._id,
      duration: 240,
      points: 200
    },
    {
      name: 'Express Advanced',
      description: 'Advanced Express patterns, security best practices, performance optimization, microservices, and deployment',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'Express')?._id,
      duration: 300,
      points: 250
    }
  ];

  const addedModules = [];
  for (const moduleData of newModules) {
    const existing = await Module.findOne({ 
      name: moduleData.name,
      skillId: moduleData.skillId 
    });
    if (!existing) {
      const module = await Module.create(moduleData);
      addedModules.push(module);
      console.log(`✅ Added module: ${moduleData.name}`);
    } else {
      addedModules.push(existing);
      console.log(`⏭️  Module already exists: ${moduleData.name}`);
    }
  }

  // Get all modules for course creation
  const allModules = await Module.find({});
  console.log(`✅ Total modules: ${allModules.length}`);
  
  return allModules;
};

const addNewCourses = async (skills: any[], modules: any[]) => {
  console.log('🌱 Adding new courses...');
  
  const newCourses = [
    // JavaScript courses
    {
      name: 'JavaScript Beginner',
      description: 'Learn JavaScript from scratch. Master variables, data types, functions, arrays, objects, DOM manipulation, and more',
      skillIds: [skills.find(s => s.name === 'JavaScript')?._id].filter(Boolean),
      duration: 120,
      level: 'Beginner',
      subModuleIds: [modules.find(m => m.name === 'JavaScript Fundamentals')?._id].filter(Boolean),
      tags: ['JavaScript', 'Beginner', 'Programming', 'Web Development']
    },
    {
      name: 'JavaScript Intermediate',
      description: 'Master intermediate JavaScript concepts including closures, prototypes, async programming, and modern ES6+ features',
      skillIds: [skills.find(s => s.name === 'JavaScript')?._id].filter(Boolean),
      duration: 240,
      level: 'Intermediate',
      subModuleIds: [modules.find(m => m.name === 'JavaScript Intermediate')?._id].filter(Boolean),
      tags: ['JavaScript', 'Intermediate', 'ES6', 'Async Programming']
    },
    {
      name: 'JavaScript Advanced',
      description: 'Advanced JavaScript patterns, performance optimization, design patterns, and complex application architecture',
      skillIds: [skills.find(s => s.name === 'JavaScript')?._id].filter(Boolean),
      duration: 300,
      level: 'Advanced',
      subModuleIds: [modules.find(m => m.name === 'JavaScript Advanced')?._id].filter(Boolean),
      tags: ['JavaScript', 'Advanced', 'Design Patterns', 'Performance']
    },
    // TypeScript courses
    {
      name: 'TypeScript Beginner',
      description: 'Learn TypeScript from scratch. Master type annotations, interfaces, and the TypeScript type system',
      skillIds: [skills.find(s => s.name === 'TypeScript')?._id].filter(Boolean),
      duration: 180,
      level: 'Beginner',
      subModuleIds: [modules.find(m => m.name === 'TypeScript Beginner')?._id].filter(Boolean),
      tags: ['TypeScript', 'Beginner', 'Type System', 'Programming']
    },
    {
      name: 'TypeScript Intermediate',
      description: 'Intermediate TypeScript features including generics, utility types, advanced type manipulation, and decorators',
      skillIds: [skills.find(s => s.name === 'TypeScript')?._id].filter(Boolean),
      duration: 220,
      level: 'Intermediate',
      subModuleIds: [modules.find(m => m.name === 'TypeScript Intermediate')?._id].filter(Boolean),
      tags: ['TypeScript', 'Intermediate', 'Generics', 'Advanced Types']
    },
    {
      name: 'TypeScript Advanced',
      description: 'Advanced TypeScript patterns, conditional types, mapped types, and enterprise-level TypeScript development',
      skillIds: [skills.find(s => s.name === 'TypeScript')?._id].filter(Boolean),
      duration: 190,
      level: 'Advanced',
      subModuleIds: [modules.find(m => m.name === 'TypeScript Advanced')?._id].filter(Boolean),
      tags: ['TypeScript', 'Advanced', 'Type System', 'Enterprise']
    },
    // HTML and CSS courses
    {
      name: 'HTML and CSS Beginner',
      description: 'Complete beginner course covering HTML fundamentals, CSS basics, and building your first web pages',
      skillIds: [
        skills.find(s => s.name === 'HTML')?._id,
        skills.find(s => s.name === 'CSS')?._id
      ].filter(Boolean),
      duration: 210,
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'HTML5 Semantic Elements')?._id,
        modules.find(m => m.name === 'CSS Beginner')?._id
      ].filter(Boolean),
      tags: ['HTML', 'CSS', 'Beginner', 'Web Development', 'Frontend']
    },
    {
      name: 'HTML and CSS Intermediate',
      description: 'Intermediate HTML and CSS concepts including forms, responsive design, CSS Grid, Flexbox, and accessibility',
      skillIds: [
        skills.find(s => s.name === 'HTML')?._id,
        skills.find(s => s.name === 'CSS')?._id
      ].filter(Boolean),
      duration: 310,
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'HTML Intermediate')?._id,
        modules.find(m => m.name === 'CSS3 Advanced Styling')?._id
      ].filter(Boolean),
      tags: ['HTML', 'CSS', 'Intermediate', 'Responsive Design', 'Layout']
    },
    {
      name: 'HTML and CSS Advanced',
      description: 'Advanced HTML and CSS techniques including animations, transforms, web components, and modern CSS architecture',
      skillIds: [
        skills.find(s => s.name === 'HTML')?._id,
        skills.find(s => s.name === 'CSS')?._id
      ].filter(Boolean),
      duration: 440,
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'HTML Advanced')?._id,
        modules.find(m => m.name === 'CSS Advanced')?._id
      ].filter(Boolean),
      tags: ['HTML', 'CSS', 'Advanced', 'Animations', 'Web Components']
    },
    // React courses
    {
      name: 'React Beginner',
      description: 'Learn React from scratch. Master components, JSX, props, state, and building your first React applications',
      skillIds: [skills.find(s => s.name === 'React')?._id].filter(Boolean),
      duration: 180,
      level: 'Beginner',
      subModuleIds: [modules.find(m => m.name === 'React Components')?._id].filter(Boolean),
      tags: ['React', 'Beginner', 'Components', 'JSX', 'Frontend']
    },
    {
      name: 'React Intermediate',
      description: 'Intermediate React concepts including hooks, context API, performance optimization, and testing React applications',
      skillIds: [
        skills.find(s => s.name === 'React')?._id,
        skills.find(s => s.name === 'React Hooks')?._id
      ].filter(Boolean),
      duration: 410,
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'React Intermediate')?._id,
        modules.find(m => m.name === 'React Hooks Deep Dive')?._id
      ].filter(Boolean),
      tags: ['React', 'Intermediate', 'Hooks', 'Context API', 'Testing']
    },
    {
      name: 'React Advanced',
      description: 'Advanced React patterns, custom hooks, render optimization, concurrent features, and enterprise architecture',
      skillIds: [
        skills.find(s => s.name === 'React')?._id,
        skills.find(s => s.name === 'Redux')?._id
      ].filter(Boolean),
      duration: 540,
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'React Advanced')?._id,
        modules.find(m => m.name === 'Redux State Management')?._id
      ].filter(Boolean),
      tags: ['React', 'Advanced', 'Performance', 'Architecture', 'Redux']
    },
    // Angular courses
    {
      name: 'Angular Beginner',
      description: 'Learn Angular from scratch. Master components, templates, data binding, directives, and building your first Angular app',
      skillIds: [skills.find(s => s.name === 'Angular')?._id].filter(Boolean),
      duration: 200,
      level: 'Beginner',
      subModuleIds: [modules.find(m => m.name === 'Angular Beginner')?._id].filter(Boolean),
      tags: ['Angular', 'Beginner', 'Components', 'TypeScript', 'Frontend']
    },
    {
      name: 'Angular Intermediate',
      description: 'Intermediate Angular concepts including services, dependency injection, routing, forms, and HTTP client',
      skillIds: [skills.find(s => s.name === 'Angular')?._id].filter(Boolean),
      duration: 280,
      level: 'Intermediate',
      subModuleIds: [modules.find(m => m.name === 'Angular Intermediate')?._id].filter(Boolean),
      tags: ['Angular', 'Intermediate', 'Services', 'Routing', 'Forms']
    },
    {
      name: 'Angular Advanced',
      description: 'Advanced Angular patterns, RxJS, state management, performance optimization, and enterprise architecture',
      skillIds: [skills.find(s => s.name === 'Angular')?._id].filter(Boolean),
      duration: 360,
      level: 'Advanced',
      subModuleIds: [modules.find(m => m.name === 'Angular Advanced')?._id].filter(Boolean),
      tags: ['Angular', 'Advanced', 'RxJS', 'Performance', 'Enterprise']
    },
    // Node.js courses
    {
      name: 'Node.js Beginner',
      description: 'Learn Node.js from scratch. Master npm, modules, file system operations, and building your first Node.js server',
      skillIds: [skills.find(s => s.name === 'Node.js')?._id].filter(Boolean),
      duration: 180,
      level: 'Beginner',
      subModuleIds: [modules.find(m => m.name === 'Node.js Beginner')?._id].filter(Boolean),
      tags: ['Node.js', 'Beginner', 'Backend', 'JavaScript', 'Server']
    },
    {
      name: 'Node.js Intermediate',
      description: 'Intermediate Node.js concepts including Express integration, async patterns, error handling, and RESTful APIs',
      skillIds: [skills.find(s => s.name === 'Node.js')?._id].filter(Boolean),
      duration: 240,
      level: 'Intermediate',
      subModuleIds: [modules.find(m => m.name === 'Node.js Backend Development')?._id].filter(Boolean),
      tags: ['Node.js', 'Intermediate', 'Backend', 'APIs', 'Express']
    },
    {
      name: 'Node.js Advanced',
      description: 'Advanced Node.js concepts including streams, clusters, performance optimization, microservices, and deployment',
      skillIds: [skills.find(s => s.name === 'Node.js')?._id].filter(Boolean),
      duration: 320,
      level: 'Advanced',
      subModuleIds: [modules.find(m => m.name === 'Node.js Advanced')?._id].filter(Boolean),
      tags: ['Node.js', 'Advanced', 'Performance', 'Microservices', 'Deployment']
    },
    // MongoDB courses
    {
      name: 'MongoDB Beginner',
      description: 'Learn MongoDB from scratch. Master CRUD operations, queries, indexes, and basic database concepts',
      skillIds: [skills.find(s => s.name === 'MongoDB')?._id].filter(Boolean),
      duration: 150,
      level: 'Beginner',
      subModuleIds: [modules.find(m => m.name === 'MongoDB Beginner')?._id].filter(Boolean),
      tags: ['MongoDB', 'Beginner', 'Database', 'NoSQL', 'CRUD']
    },
    {
      name: 'MongoDB Intermediate',
      description: 'Intermediate MongoDB concepts including advanced queries, aggregation, indexing strategies, and data modeling',
      skillIds: [skills.find(s => s.name === 'MongoDB')?._id].filter(Boolean),
      duration: 180,
      level: 'Intermediate',
      subModuleIds: [modules.find(m => m.name === 'MongoDB Database Design')?._id].filter(Boolean),
      tags: ['MongoDB', 'Intermediate', 'Database', 'Aggregation', 'Indexing']
    },
    {
      name: 'MongoDB Advanced',
      description: 'Advanced MongoDB concepts including aggregation pipelines, sharding, replication, performance optimization, and scaling',
      skillIds: [skills.find(s => s.name === 'MongoDB')?._id].filter(Boolean),
      duration: 280,
      level: 'Advanced',
      subModuleIds: [modules.find(m => m.name === 'MongoDB Advanced')?._id].filter(Boolean),
      tags: ['MongoDB', 'Advanced', 'Sharding', 'Replication', 'Scaling']
    },
    // Express courses
    {
      name: 'Express Beginner',
      description: 'Learn Express.js from scratch. Master routing, middleware, request/response handling, and building your first REST API',
      skillIds: [
        skills.find(s => s.name === 'Express')?._id,
        skills.find(s => s.name === 'Node.js')?._id
      ].filter(Boolean),
      duration: 160,
      level: 'Beginner',
      subModuleIds: [modules.find(m => m.name === 'Express Beginner')?._id].filter(Boolean),
      tags: ['Express', 'Beginner', 'Backend', 'API', 'REST']
    },
    {
      name: 'Express Intermediate',
      description: 'Intermediate Express concepts including advanced routing, error handling, authentication, validation, and RESTful APIs',
      skillIds: [
        skills.find(s => s.name === 'Express')?._id,
        skills.find(s => s.name === 'Node.js')?._id
      ].filter(Boolean),
      duration: 240,
      level: 'Intermediate',
      subModuleIds: [modules.find(m => m.name === 'Express Intermediate')?._id].filter(Boolean),
      tags: ['Express', 'Intermediate', 'Authentication', 'Validation', 'REST API']
    },
    {
      name: 'Express Advanced',
      description: 'Advanced Express patterns, security best practices, performance optimization, microservices architecture, and deployment',
      skillIds: [
        skills.find(s => s.name === 'Express')?._id,
        skills.find(s => s.name === 'Node.js')?._id
      ].filter(Boolean),
      duration: 300,
      level: 'Advanced',
      subModuleIds: [modules.find(m => m.name === 'Express Advanced')?._id].filter(Boolean),
      tags: ['Express', 'Advanced', 'Security', 'Performance', 'Microservices']
    }
  ];

  const addedCourses = [];
  for (const courseData of newCourses) {
    const existing = await Course.findOne({ name: courseData.name });
    if (!existing) {
      const course = await Course.create(courseData);
      addedCourses.push(course);
      console.log(`✅ Added course: ${courseData.name}`);
    } else {
      console.log(`⏭️  Course already exists: ${courseData.name}`);
    }
  }

  console.log(`✅ Total courses added: ${addedCourses.length}`);
  return addedCourses;
};

const main = async () => {
  try {
    await connectDB();
    
    console.log('🚀 Starting to add new courses, modules, and skills...\n');
    
    const skills = await addNewSkills();
    console.log('');
    
    const modules = await addNewModules(skills);
    console.log('');
    
    const courses = await addNewCourses(skills, modules);
    console.log('');
    
    console.log('🎉 Successfully added all new courses!');
    console.log(`📊 Summary:`);
    console.log(`   - Skills: ${skills.length} total`);
    console.log(`   - Modules: ${modules.length} total`);
    console.log(`   - Courses: ${courses.length} new courses added`);
    
    await mongoose.disconnect();
    console.log('✅ Disconnected from MongoDB');
    process.exit(0);
  } catch (error) {
    console.error('💥 Fatal error:', error);
    await mongoose.disconnect();
    process.exit(1);
  }
};

// Run the script
if (require.main === module) {
  main();
}

export { main as addNewCourses };

