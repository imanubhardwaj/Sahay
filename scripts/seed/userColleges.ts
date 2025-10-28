import { UserCollege } from '../../src/models';

export const seedUserColleges = async (users: any[], colleges: any[]) => {
  console.log('🌱 Seeding user colleges...');
  
  const userCollegesData = users.slice(0, 5).map((user, index) => ({
    userId: user._id,
    collegeId: colleges[index % colleges.length]?._id
  }));

  const userColleges = await UserCollege.insertMany(userCollegesData);
  console.log(`✅ Seeded ${userColleges.length} user colleges`);
  
  return userColleges;
};
