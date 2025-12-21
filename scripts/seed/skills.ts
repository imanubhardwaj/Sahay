import { Skill } from '../../src/models';

export const seedSkills = async () => {
  console.log('🌱 Seeding skills...');
  
  const skillsData = [
    {
      name: 'JavaScript',
      description: 'A high-level programming language that is one of the core technologies of the World Wide Web',
      parentSkillId: null
    },
    {
      name: 'React',
      description: 'A JavaScript library for building user interfaces',
      parentSkillId: null
    },
    {
      name: 'Node.js',
      description: 'A JavaScript runtime built on Chrome\'s V8 JavaScript engine',
      parentSkillId: null
    },
    {
      name: 'Python',
      description: 'A high-level programming language with dynamic semantics',
      parentSkillId: null
    },
    {
      name: 'Java',
      description: 'A high-level, class-based, object-oriented programming language',
      parentSkillId: null
    },
    {
      name: 'React Hooks',
      description: 'Functions that let you use state and other React features in functional components',
      parentSkillId: null
    },
    {
      name: 'Redux',
      description: 'A predictable state container for JavaScript applications',
      parentSkillId: null
    },
    {
      name: 'TypeScript',
      description: 'A strongly typed programming language that builds on JavaScript',
      parentSkillId: null
    },
    {
      name: 'MongoDB',
      description: 'A source-available cross-platform document-oriented database program',
      parentSkillId: null
    },
    {
      name: 'PostgreSQL',
      description: 'A free and open-source relational database management system',
      parentSkillId: null
    },
    {
      name: 'AWS',
      description: 'Amazon Web Services - a comprehensive cloud computing platform',
      parentSkillId: null
    },
    {
      name: 'Docker',
      description: 'A platform for developing, shipping, and running applications in containers',
      parentSkillId: null
    },
    {
      name: 'Git',
      description: 'A distributed version control system for tracking changes in source code',
      parentSkillId: null
    },
    {
      name: 'HTML',
      description: 'The standard markup language for documents designed to be displayed in a web browser',
      parentSkillId: null
    },
    {
      name: 'CSS',
      description: 'A style sheet language used for describing the presentation of a document written in HTML',
      parentSkillId: null
    },
    {
      name: 'Data Structures',
      description: 'A data organization, management, and storage format that enables efficient access and modification',
      parentSkillId: null
    },
    {
      name: 'Algorithms',
      description: 'A finite sequence of rigorous instructions, typically used to solve a class of specific problems',
      parentSkillId: null
    },
    {
      name: 'Machine Learning',
      description: 'A method of data analysis that automates analytical model building',
      parentSkillId: null
    },
    {
      name: 'Artificial Intelligence',
      description: 'Intelligence demonstrated by machines, in contrast to the natural intelligence displayed by humans',
      parentSkillId: null
    },
    {
      name: 'Blockchain',
      description: 'A distributed ledger technology that maintains a continuously growing list of records',
      parentSkillId: null
    },
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

  const skills = await Skill.insertMany(skillsData);
  console.log(`✅ Seeded ${skills.length} skills`);
  
  return skills;
};
