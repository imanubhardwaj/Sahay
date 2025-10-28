import { UserSocialLink } from '../../src/models';

export const seedUserSocialLinks = async (users: any[], socialLinks: any[]) => {
  console.log('🌱 Seeding user social links...');
  
  const userSocialLinksData = [
    {
      userId: users[0]?._id,
      linkId: socialLinks[0]?._id
    },
    {
      userId: users[1]?._id,
      linkId: socialLinks[1]?._id
    }
  ];

  const userSocialLinks = await UserSocialLink.insertMany(userSocialLinksData);
  console.log(`✅ Seeded ${userSocialLinks.length} user social links`);
  
  return userSocialLinks;
};
