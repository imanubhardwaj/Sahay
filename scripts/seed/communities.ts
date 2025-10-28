import { Community } from '../../src/models';

export const seedCommunities = async (users: any[], skills: any[]) => {
  console.log('🌱 Seeding communities...');
  
  const communitiesData = [
    {
      name: 'JavaScript Developers',
      description: 'A community for JavaScript developers to share knowledge and collaborate',
      userId: users[0]?._id,
      skillId: skills.find(s => s.name === 'JavaScript')?._id
    },
    {
      name: 'React Enthusiasts',
      description: 'React developers sharing tips, tricks, and best practices',
      userId: users[1]?._id,
      skillId: skills.find(s => s.name === 'React')?._id
    },
    {
      name: 'Python Data Science',
      description: 'Data science community using Python',
      userId: users[2]?._id,
      skillId: skills.find(s => s.name === 'Python')?._id
    }
  ];

  const communities = await Community.insertMany(communitiesData);
  console.log(`✅ Seeded ${communities.length} communities`);
  
  return communities;
};
