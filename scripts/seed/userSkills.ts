import { UserSkill } from '../../src/models';

export const seedUserSkills = async (users: any[], skills: any[]) => {
  console.log('🌱 Seeding user skills...');
  
  const userSkillsData = users.slice(0, 5).map((user, index) => ({
    userId: user._id,
    skillId: skills[index % skills.length]?._id
  }));

  const userSkills = await UserSkill.insertMany(userSkillsData);
  console.log(`✅ Seeded ${userSkills.length} user skills`);
  
  return userSkills;
};
