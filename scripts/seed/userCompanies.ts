import { UserCompany } from '../../src/models';

export const seedUserCompanies = async (users: any[], companies: any[]) => {
  console.log('🌱 Seeding user companies...');
  
  const userCompaniesData = users
    .filter(user => user.userType === 'working_professional')
    .slice(0, 3)
    .map((user, index) => ({
      userId: user._id,
      companyId: companies[index % companies.length]?._id
    }));

  const userCompanies = await UserCompany.insertMany(userCompaniesData);
  console.log(`✅ Seeded ${userCompanies.length} user companies`);
  
  return userCompanies;
};
