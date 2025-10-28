import { Post } from '../../src/models';

export const seedPosts = async (users: any[], communities: any[], skills: any[], attachments: any[]) => {
  console.log('🌱 Seeding posts...');
  
  const postsData = [
    {
      userId: users[0]?._id,
      content: 'Just completed my first React project! Excited to share what I learned.',
      communityId: communities[0]?._id,
      skillIds: [skills.find(s => s.name === 'React')?._id],
      postAttachments: []
    },
    {
      userId: users[1]?._id,
      content: 'Tips for JavaScript performance optimization that every developer should know.',
      communityId: communities[0]?._id,
      skillIds: [skills.find(s => s.name === 'JavaScript')?._id],
      postAttachments: []
    }
  ];

  const posts = await Post.insertMany(postsData);
  console.log(`✅ Seeded ${posts.length} posts`);
  
  return posts;
};
