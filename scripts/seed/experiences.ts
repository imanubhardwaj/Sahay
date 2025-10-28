import { Experience } from '../../src/models';

export const seedExperiences = async (companies: any[], skills: any[]) => {
  console.log('🌱 Seeding experiences...');
  
  const experiencesData = [
    {
      title: 'Senior Software Engineer',
      companyId: companies[0]?._id,
      startDate: new Date('2020-01-01'),
      endDate: new Date('2023-12-31'),
      description: 'Led development of microservices architecture',
      skillIds: [skills.find(s => s.name === 'JavaScript')?._id],
      isCurrent: false,
      visibility: 'public'
    }
  ];

  const experiences = await Experience.insertMany(experiencesData);
  console.log(`✅ Seeded ${experiences.length} experiences`);
  
  return experiences;
};
