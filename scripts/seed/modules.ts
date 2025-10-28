import { Module } from '../../src/models';

export const seedModules = async (skills: any[]) => {
  console.log('🌱 Seeding modules...');
  
  const modulesData = [
    {
      name: 'JavaScript Fundamentals',
      description: 'Learn the basics of JavaScript programming language',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'JavaScript')?._id,
      duration: 120, // 2 hours
      points: 100
    },
    {
      name: 'React Components',
      description: 'Understanding React components and their lifecycle',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'React')?._id,
      duration: 180, // 3 hours
      points: 150
    },
    {
      name: 'Node.js Backend Development',
      description: 'Building server-side applications with Node.js',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'Node.js')?._id,
      duration: 240, // 4 hours
      points: 200
    },
    {
      name: 'Python Basics',
      description: 'Introduction to Python programming',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'Python')?._id,
      duration: 150, // 2.5 hours
      points: 125
    },
    {
      name: 'Java Object-Oriented Programming',
      description: 'Learn OOP concepts in Java',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'Java')?._id,
      duration: 200, // 3.33 hours
      points: 175
    },
    {
      name: 'React Hooks Deep Dive',
      description: 'Master React Hooks for state management',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'React Hooks')?._id,
      duration: 160, // 2.67 hours
      points: 140
    },
    {
      name: 'Redux State Management',
      description: 'Managing application state with Redux',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'Redux')?._id,
      duration: 220, // 3.67 hours
      points: 180
    },
    {
      name: 'TypeScript Advanced',
      description: 'Advanced TypeScript features and best practices',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'TypeScript')?._id,
      duration: 190, // 3.17 hours
      points: 160
    },
    {
      name: 'MongoDB Database Design',
      description: 'Designing and working with MongoDB databases',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'MongoDB')?._id,
      duration: 180, // 3 hours
      points: 150
    },
    {
      name: 'PostgreSQL Queries',
      description: 'Writing efficient SQL queries in PostgreSQL',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'PostgreSQL')?._id,
      duration: 170, // 2.83 hours
      points: 145
    },
    {
      name: 'AWS Cloud Services',
      description: 'Introduction to Amazon Web Services',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'AWS')?._id,
      duration: 300, // 5 hours
      points: 250
    },
    {
      name: 'Docker Containerization',
      description: 'Containerizing applications with Docker',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'Docker')?._id,
      duration: 140, // 2.33 hours
      points: 120
    },
    {
      name: 'Git Version Control',
      description: 'Using Git for version control and collaboration',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'Git')?._id,
      duration: 100, // 1.67 hours
      points: 80
    },
    {
      name: 'HTML5 Semantic Elements',
      description: 'Modern HTML5 features and semantic markup',
      level: 'Beginner',
      skillId: skills.find(s => s.name === 'HTML')?._id,
      duration: 90, // 1.5 hours
      points: 70
    },
    {
      name: 'CSS3 Advanced Styling',
      description: 'Advanced CSS3 features and responsive design',
      level: 'Intermediate',
      skillId: skills.find(s => s.name === 'CSS')?._id,
      duration: 160, // 2.67 hours
      points: 130
    },
    {
      name: 'Data Structures Implementation',
      description: 'Implementing common data structures',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'Data Structures')?._id,
      duration: 280, // 4.67 hours
      points: 220
    },
    {
      name: 'Algorithm Design Patterns',
      description: 'Common algorithm design patterns and techniques',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'Algorithms')?._id,
      duration: 320, // 5.33 hours
      points: 260
    },
    {
      name: 'Machine Learning Basics',
      description: 'Introduction to machine learning concepts',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'Machine Learning')?._id,
      duration: 360, // 6 hours
      points: 300
    },
    {
      name: 'AI Applications',
      description: 'Real-world applications of artificial intelligence',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'Artificial Intelligence')?._id,
      duration: 240, // 4 hours
      points: 200
    },
    {
      name: 'Blockchain Development',
      description: 'Building decentralized applications',
      level: 'Advanced',
      skillId: skills.find(s => s.name === 'Blockchain')?._id,
      duration: 400, // 6.67 hours
      points: 350
    }
  ];

  const modules = await Module.insertMany(modulesData);
  console.log(`✅ Seeded ${modules.length} modules`);
  
  return modules;
};
