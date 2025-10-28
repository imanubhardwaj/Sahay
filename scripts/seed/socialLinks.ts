import { SocialLink } from '../../src/models';

export const seedSocialLinks = async () => {
  console.log('🌱 Seeding social links...');
  
  const socialLinksData = [
    {
      name: 'GitHub',
      platform: 'github',
      url: 'https://github.com'
    },
    {
      name: 'LinkedIn',
      platform: 'linkedin',
      url: 'https://linkedin.com'
    },
    {
      name: 'Twitter',
      platform: 'twitter',
      url: 'https://twitter.com'
    },
    {
      name: 'Instagram',
      platform: 'instagram',
      url: 'https://instagram.com'
    },
    {
      name: 'YouTube',
      platform: 'youtube',
      url: 'https://youtube.com'
    }
  ];

  const socialLinks = await SocialLink.insertMany(socialLinksData);
  console.log(`✅ Seeded ${socialLinks.length} social links`);
  
  return socialLinks;
};
