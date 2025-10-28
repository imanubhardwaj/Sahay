import { Project } from '../../src/models';

export const seedProjects = async () => {
  console.log('🌱 Seeding projects...');
  
  const projectsData = [
    {
      name: 'E-commerce Website',
      url: 'https://github.com/user/ecommerce',
      description: 'A full-stack e-commerce website built with React and Node.js',
      skillIds: [],
      sourceCodeUrl: 'https://github.com/user/ecommerce'
    },
    {
      name: 'Task Management App',
      url: 'https://github.com/user/taskapp',
      description: 'A task management application with real-time updates',
      skillIds: [],
      sourceCodeUrl: 'https://github.com/user/taskapp'
    }
  ];

  const projects = await Project.insertMany(projectsData);
  console.log(`✅ Seeded ${projects.length} projects`);
  
  return projects;
};
