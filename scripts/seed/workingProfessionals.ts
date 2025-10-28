import { WorkingProfessional } from '../../src/models';

export const seedWorkingProfessionals = async (users: any[], companies: any[]) => {
  console.log('🌱 Seeding working professionals...');
  
  const workingProfessionalsData = users
    .filter(user => user.userType === 'working_professional')
    .map((user, index) => ({
      userId: user._id,
      companyId: companies[index % companies.length]?._id,
      title: user.title,
      department: 'Engineering',
      startDate: new Date('2020-01-01'),
      isCurrent: true,
      skills: [],
      experience: [],
      availability: {
        isAvailable: true,
        maxMentees: 5,
        hourlyRate: 50
      }
    }));

  const workingProfessionals = await WorkingProfessional.insertMany(workingProfessionalsData);
  console.log(`✅ Seeded ${workingProfessionals.length} working professionals`);
  
  return workingProfessionals;
};
