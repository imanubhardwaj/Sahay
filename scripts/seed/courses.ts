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
    }
  ];

  const courses = await Course.insertMany(coursesData);
  console.log(`✅ Seeded ${courses.length} courses`);
  
  return courses;
};
