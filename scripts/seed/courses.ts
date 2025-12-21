import { Course } from '../../src/models';

export const seedCourses = async (skills: any[], modules: any[]) => {
  console.log('🌱 Seeding courses...');
  
  const coursesData = [
    {
      name: 'Full Stack JavaScript Development',
      description: 'Complete course covering frontend and backend JavaScript development',
      skillIds: [
        skills.find(s => s.name === 'JavaScript')?._id,
        skills.find(s => s.name === 'React')?._id,
        skills.find(s => s.name === 'Node.js')?._id,
        skills.find(s => s.name === 'MongoDB')?._id
      ],
      duration: 1200, // 20 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'JavaScript Fundamentals')?._id,
        modules.find(m => m.name === 'React Components')?._id,
        modules.find(m => m.name === 'Node.js Backend Development')?._id,
        modules.find(m => m.name === 'MongoDB Database Design')?._id
      ],
      tags: ['JavaScript', 'Full Stack', 'Web Development', 'MERN Stack']
    },
    {
      name: 'Python Data Science',
      description: 'Complete data science course using Python',
      skillIds: [
        skills.find(s => s.name === 'Python')?._id,
        skills.find(s => s.name === 'Machine Learning')?._id,
        skills.find(s => s.name === 'Data Structures')?._id
      ],
      duration: 1800, // 30 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'Python Basics')?._id,
        modules.find(m => m.name === 'Machine Learning Basics')?._id,
        modules.find(m => m.name === 'Data Structures Implementation')?._id
      ],
      tags: ['Python', 'Data Science', 'Machine Learning', 'Analytics']
    },
    {
      name: 'Java Enterprise Development',
      description: 'Enterprise-level Java development with Spring framework',
      skillIds: [
        skills.find(s => s.name === 'Java')?._id,
        skills.find(s => s.name === 'PostgreSQL')?._id,
        skills.find(s => s.name === 'Docker')?._id
      ],
      duration: 1500, // 25 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'Java Object-Oriented Programming')?._id,
        modules.find(m => m.name === 'PostgreSQL Queries')?._id,
        modules.find(m => m.name === 'Docker Containerization')?._id
      ],
      tags: ['Java', 'Enterprise', 'Spring', 'Microservices']
    },
    {
      name: 'React Advanced Patterns',
      description: 'Advanced React patterns and state management',
      skillIds: [
        skills.find(s => s.name === 'React')?._id,
        skills.find(s => s.name === 'React Hooks')?._id,
        skills.find(s => s.name === 'Redux')?._id,
        skills.find(s => s.name === 'TypeScript')?._id
      ],
      duration: 1000, // 16.67 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'React Components')?._id,
        modules.find(m => m.name === 'React Hooks Deep Dive')?._id,
        modules.find(m => m.name === 'Redux State Management')?._id,
        modules.find(m => m.name === 'TypeScript Advanced')?._id
      ],
      tags: ['React', 'State Management', 'TypeScript', 'Frontend']
    },
    {
      name: 'Cloud Computing with AWS',
      description: 'Complete cloud computing course using Amazon Web Services',
      skillIds: [
        skills.find(s => s.name === 'AWS')?._id,
        skills.find(s => s.name === 'Docker')?._id,
        skills.find(s => s.name === 'Node.js')?._id
      ],
      duration: 2000, // 33.33 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'AWS Cloud Services')?._id,
        modules.find(m => m.name === 'Docker Containerization')?._id,
        modules.find(m => m.name === 'Node.js Backend Development')?._id
      ],
      tags: ['AWS', 'Cloud Computing', 'DevOps', 'Infrastructure']
    },
    {
      name: 'Web Development Fundamentals',
      description: 'Complete web development course covering HTML, CSS, and JavaScript',
      skillIds: [
        skills.find(s => s.name === 'HTML')?._id,
        skills.find(s => s.name === 'CSS')?._id,
        skills.find(s => s.name === 'JavaScript')?._id,
        skills.find(s => s.name === 'Git')?._id
      ],
      duration: 800, // 13.33 hours
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'HTML5 Semantic Elements')?._id,
        modules.find(m => m.name === 'CSS3 Advanced Styling')?._id,
        modules.find(m => m.name === 'JavaScript Fundamentals')?._id,
        modules.find(m => m.name === 'Git Version Control')?._id
      ],
      tags: ['HTML', 'CSS', 'JavaScript', 'Web Development', 'Beginner']
    },
    {
      name: 'Algorithm and Data Structures Mastery',
      description: 'Comprehensive course on algorithms and data structures',
      skillIds: [
        skills.find(s => s.name === 'Data Structures')?._id,
        skills.find(s => s.name === 'Algorithms')?._id,
        skills.find(s => s.name === 'Python')?._id
      ],
      duration: 2400, // 40 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'Data Structures Implementation')?._id,
        modules.find(m => m.name === 'Algorithm Design Patterns')?._id,
        modules.find(m => m.name === 'Python Basics')?._id
      ],
      tags: ['Algorithms', 'Data Structures', 'Python', 'Computer Science']
    },
    {
      name: 'AI and Machine Learning',
      description: 'Complete artificial intelligence and machine learning course',
      skillIds: [
        skills.find(s => s.name === 'Artificial Intelligence')?._id,
        skills.find(s => s.name === 'Machine Learning')?._id,
        skills.find(s => s.name === 'Python')?._id
      ],
      duration: 3000, // 50 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'AI Applications')?._id,
        modules.find(m => m.name === 'Machine Learning Basics')?._id,
        modules.find(m => m.name === 'Python Basics')?._id
      ],
      tags: ['AI', 'Machine Learning', 'Python', 'Data Science']
    },
    {
      name: 'Blockchain Development',
      description: 'Complete blockchain development course',
      skillIds: [
        skills.find(s => s.name === 'Blockchain')?._id,
        skills.find(s => s.name === 'JavaScript')?._id,
        skills.find(s => s.name === 'Node.js')?._id
      ],
      duration: 1800, // 30 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'Blockchain Development')?._id,
        modules.find(m => m.name === 'JavaScript Fundamentals')?._id,
        modules.find(m => m.name === 'Node.js Backend Development')?._id
      ],
      tags: ['Blockchain', 'Cryptocurrency', 'Web3', 'Decentralized']
    },
    {
      name: 'DevOps and CI/CD',
      description: 'DevOps practices and continuous integration/deployment',
      skillIds: [
        skills.find(s => s.name === 'Docker')?._id,
        skills.find(s => s.name === 'AWS')?._id,
        skills.find(s => s.name === 'Git')?._id
      ],
      duration: 1200, // 20 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'Docker Containerization')?._id,
        modules.find(m => m.name === 'AWS Cloud Services')?._id,
        modules.find(m => m.name === 'Git Version Control')?._id
      ],
      tags: ['DevOps', 'CI/CD', 'Docker', 'AWS', 'Automation']
    },
    // JavaScript courses
    {
      name: 'JavaScript Beginner',
      description: 'Learn JavaScript from scratch. Master variables, data types, functions, arrays, objects, DOM manipulation, and more',
      skillIds: [
        skills.find(s => s.name === 'JavaScript')?._id
      ],
      duration: 120, // 2 hours
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'JavaScript Fundamentals')?._id
      ],
      tags: ['JavaScript', 'Beginner', 'Programming', 'Web Development']
    },
    {
      name: 'JavaScript Intermediate',
      description: 'Master intermediate JavaScript concepts including closures, prototypes, async programming, and modern ES6+ features',
      skillIds: [
        skills.find(s => s.name === 'JavaScript')?._id
      ],
      duration: 240, // 4 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'JavaScript Intermediate')?._id
      ],
      tags: ['JavaScript', 'Intermediate', 'ES6', 'Async Programming']
    },
    {
      name: 'JavaScript Advanced',
      description: 'Advanced JavaScript patterns, performance optimization, design patterns, and complex application architecture',
      skillIds: [
        skills.find(s => s.name === 'JavaScript')?._id
      ],
      duration: 300, // 5 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'JavaScript Advanced')?._id
      ],
      tags: ['JavaScript', 'Advanced', 'Design Patterns', 'Performance']
    },
    // TypeScript courses
    {
      name: 'TypeScript Beginner',
      description: 'Learn TypeScript from scratch. Master type annotations, interfaces, and the TypeScript type system',
      skillIds: [
        skills.find(s => s.name === 'TypeScript')?._id
      ],
      duration: 180, // 3 hours
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'TypeScript Beginner')?._id
      ],
      tags: ['TypeScript', 'Beginner', 'Type System', 'Programming']
    },
    {
      name: 'TypeScript Intermediate',
      description: 'Intermediate TypeScript features including generics, utility types, advanced type manipulation, and decorators',
      skillIds: [
        skills.find(s => s.name === 'TypeScript')?._id
      ],
      duration: 220, // 3.67 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'TypeScript Intermediate')?._id
      ],
      tags: ['TypeScript', 'Intermediate', 'Generics', 'Advanced Types']
    },
    {
      name: 'TypeScript Advanced',
      description: 'Advanced TypeScript patterns, conditional types, mapped types, and enterprise-level TypeScript development',
      skillIds: [
        skills.find(s => s.name === 'TypeScript')?._id
      ],
      duration: 190, // 3.17 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'TypeScript Advanced')?._id
      ],
      tags: ['TypeScript', 'Advanced', 'Type System', 'Enterprise']
    },
    // HTML and CSS courses
    {
      name: 'HTML and CSS Beginner',
      description: 'Complete beginner course covering HTML fundamentals, CSS basics, and building your first web pages',
      skillIds: [
        skills.find(s => s.name === 'HTML')?._id,
        skills.find(s => s.name === 'CSS')?._id
      ],
      duration: 210, // 3.5 hours
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'HTML5 Semantic Elements')?._id,
        modules.find(m => m.name === 'CSS Beginner')?._id
      ],
      tags: ['HTML', 'CSS', 'Beginner', 'Web Development', 'Frontend']
    },
    {
      name: 'HTML and CSS Intermediate',
      description: 'Intermediate HTML and CSS concepts including forms, responsive design, CSS Grid, Flexbox, and accessibility',
      skillIds: [
        skills.find(s => s.name === 'HTML')?._id,
        skills.find(s => s.name === 'CSS')?._id
      ],
      duration: 310, // 5.17 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'HTML Intermediate')?._id,
        modules.find(m => m.name === 'CSS3 Advanced Styling')?._id
      ],
      tags: ['HTML', 'CSS', 'Intermediate', 'Responsive Design', 'Layout']
    },
    {
      name: 'HTML and CSS Advanced',
      description: 'Advanced HTML and CSS techniques including animations, transforms, web components, and modern CSS architecture',
      skillIds: [
        skills.find(s => s.name === 'HTML')?._id,
        skills.find(s => s.name === 'CSS')?._id
      ],
      duration: 440, // 7.33 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'HTML Advanced')?._id,
        modules.find(m => m.name === 'CSS Advanced')?._id
      ],
      tags: ['HTML', 'CSS', 'Advanced', 'Animations', 'Web Components']
    },
    // React courses
    {
      name: 'React Beginner',
      description: 'Learn React from scratch. Master components, JSX, props, state, and building your first React applications',
      skillIds: [
        skills.find(s => s.name === 'React')?._id
      ],
      duration: 180, // 3 hours
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'React Components')?._id
      ],
      tags: ['React', 'Beginner', 'Components', 'JSX', 'Frontend']
    },
    {
      name: 'React Intermediate',
      description: 'Intermediate React concepts including hooks, context API, performance optimization, and testing React applications',
      skillIds: [
        skills.find(s => s.name === 'React')?._id,
        skills.find(s => s.name === 'React Hooks')?._id
      ],
      duration: 410, // 6.83 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'React Intermediate')?._id,
        modules.find(m => m.name === 'React Hooks Deep Dive')?._id
      ],
      tags: ['React', 'Intermediate', 'Hooks', 'Context API', 'Testing']
    },
    {
      name: 'React Advanced',
      description: 'Advanced React patterns, custom hooks, render optimization, concurrent features, and enterprise architecture',
      skillIds: [
        skills.find(s => s.name === 'React')?._id,
        skills.find(s => s.name === 'Redux')?._id
      ],
      duration: 540, // 9 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'React Advanced')?._id,
        modules.find(m => m.name === 'Redux State Management')?._id
      ],
      tags: ['React', 'Advanced', 'Performance', 'Architecture', 'Redux']
    },
    // Angular courses
    {
      name: 'Angular Beginner',
      description: 'Learn Angular from scratch. Master components, templates, data binding, directives, and building your first Angular app',
      skillIds: [
        skills.find(s => s.name === 'Angular')?._id
      ],
      duration: 200, // 3.33 hours
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'Angular Beginner')?._id
      ],
      tags: ['Angular', 'Beginner', 'Components', 'TypeScript', 'Frontend']
    },
    {
      name: 'Angular Intermediate',
      description: 'Intermediate Angular concepts including services, dependency injection, routing, forms, and HTTP client',
      skillIds: [
        skills.find(s => s.name === 'Angular')?._id
      ],
      duration: 280, // 4.67 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'Angular Intermediate')?._id
      ],
      tags: ['Angular', 'Intermediate', 'Services', 'Routing', 'Forms']
    },
    {
      name: 'Angular Advanced',
      description: 'Advanced Angular patterns, RxJS, state management, performance optimization, and enterprise architecture',
      skillIds: [
        skills.find(s => s.name === 'Angular')?._id
      ],
      duration: 360, // 6 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'Angular Advanced')?._id
      ],
      tags: ['Angular', 'Advanced', 'RxJS', 'Performance', 'Enterprise']
    },
    // Node.js courses
    {
      name: 'Node.js Beginner',
      description: 'Learn Node.js from scratch. Master npm, modules, file system operations, and building your first Node.js server',
      skillIds: [
        skills.find(s => s.name === 'Node.js')?._id
      ],
      duration: 180, // 3 hours
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'Node.js Beginner')?._id
      ],
      tags: ['Node.js', 'Beginner', 'Backend', 'JavaScript', 'Server']
    },
    {
      name: 'Node.js Intermediate',
      description: 'Intermediate Node.js concepts including Express integration, async patterns, error handling, and RESTful APIs',
      skillIds: [
        skills.find(s => s.name === 'Node.js')?._id
      ],
      duration: 240, // 4 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'Node.js Backend Development')?._id
      ],
      tags: ['Node.js', 'Intermediate', 'Backend', 'APIs', 'Express']
    },
    {
      name: 'Node.js Advanced',
      description: 'Advanced Node.js concepts including streams, clusters, performance optimization, microservices, and deployment',
      skillIds: [
        skills.find(s => s.name === 'Node.js')?._id
      ],
      duration: 320, // 5.33 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'Node.js Advanced')?._id
      ],
      tags: ['Node.js', 'Advanced', 'Performance', 'Microservices', 'Deployment']
    },
    // MongoDB courses
    {
      name: 'MongoDB Beginner',
      description: 'Learn MongoDB from scratch. Master CRUD operations, queries, indexes, and basic database concepts',
      skillIds: [
        skills.find(s => s.name === 'MongoDB')?._id
      ],
      duration: 150, // 2.5 hours
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'MongoDB Beginner')?._id
      ],
      tags: ['MongoDB', 'Beginner', 'Database', 'NoSQL', 'CRUD']
    },
    {
      name: 'MongoDB Intermediate',
      description: 'Intermediate MongoDB concepts including advanced queries, aggregation, indexing strategies, and data modeling',
      skillIds: [
        skills.find(s => s.name === 'MongoDB')?._id
      ],
      duration: 180, // 3 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'MongoDB Database Design')?._id
      ],
      tags: ['MongoDB', 'Intermediate', 'Database', 'Aggregation', 'Indexing']
    },
    {
      name: 'MongoDB Advanced',
      description: 'Advanced MongoDB concepts including aggregation pipelines, sharding, replication, performance optimization, and scaling',
      skillIds: [
        skills.find(s => s.name === 'MongoDB')?._id
      ],
      duration: 280, // 4.67 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'MongoDB Advanced')?._id
      ],
      tags: ['MongoDB', 'Advanced', 'Sharding', 'Replication', 'Scaling']
    },
    // Express courses
    {
      name: 'Express Beginner',
      description: 'Learn Express.js from scratch. Master routing, middleware, request/response handling, and building your first REST API',
      skillIds: [
        skills.find(s => s.name === 'Express')?._id,
        skills.find(s => s.name === 'Node.js')?._id
      ],
      duration: 160, // 2.67 hours
      level: 'Beginner',
      subModuleIds: [
        modules.find(m => m.name === 'Express Beginner')?._id
      ],
      tags: ['Express', 'Beginner', 'Backend', 'API', 'REST']
    },
    {
      name: 'Express Intermediate',
      description: 'Intermediate Express concepts including advanced routing, error handling, authentication, validation, and RESTful APIs',
      skillIds: [
        skills.find(s => s.name === 'Express')?._id,
        skills.find(s => s.name === 'Node.js')?._id
      ],
      duration: 240, // 4 hours
      level: 'Intermediate',
      subModuleIds: [
        modules.find(m => m.name === 'Express Intermediate')?._id
      ],
      tags: ['Express', 'Intermediate', 'Authentication', 'Validation', 'REST API']
    },
    {
      name: 'Express Advanced',
      description: 'Advanced Express patterns, security best practices, performance optimization, microservices architecture, and deployment',
      skillIds: [
        skills.find(s => s.name === 'Express')?._id,
        skills.find(s => s.name === 'Node.js')?._id
      ],
      duration: 300, // 5 hours
      level: 'Advanced',
      subModuleIds: [
        modules.find(m => m.name === 'Express Advanced')?._id
      ],
      tags: ['Express', 'Advanced', 'Security', 'Performance', 'Microservices']
    }
  ];

  const courses = await Course.insertMany(coursesData);
  console.log(`✅ Seeded ${courses.length} courses`);
  
  return courses;
};
