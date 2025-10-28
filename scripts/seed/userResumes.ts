import { UserResume } from '../../src/models';

export const seedUserResumes = async (users: any[], attachments: any[]) => {
  console.log('🌱 Seeding user resumes...');
  
  const userResumesData = users.slice(0, 5).map((user, index) => ({
    userId: user._id,
    attachmentUrl: attachments[10 + index]?.url || 'https://example.com/resume.pdf'
  }));

  const userResumes = await UserResume.insertMany(userResumesData);
  console.log(`✅ Seeded ${userResumes.length} user resumes`);
  
  return userResumes;
};
