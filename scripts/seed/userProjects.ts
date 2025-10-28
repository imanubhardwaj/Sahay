import { UserProject } from '../../src/models';

export const seedUserProjects = async (users: any[], projects: any[]) => {
  console.log('🌱 Seeding user projects...');
  
  const userProjectsData = [
    {
      userId: users[0]?._id,
      projectId: projects[0]?._id
    },
    {
      userId: users[1]?._id,
      projectId: projects[1]?._id
    }
  ];

  const userProjects = await UserProject.insertMany(userProjectsData);
  console.log(`✅ Seeded ${userProjects.length} user projects`);
  
  return userProjects;
};
