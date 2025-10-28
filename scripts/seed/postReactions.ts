import { PostReaction } from '../../src/models';

export const seedPostReactions = async (posts: any[], users: any[]) => {
  console.log('🌱 Seeding post reactions...');
  
  const postReactionsData = [
    {
      postId: posts[0]?._id,
      reaction: 'Like',
      userId: users[0]?._id
    },
    {
      postId: posts[0]?._id,
      reaction: 'Heart',
      userId: users[1]?._id
    }
  ];

  const postReactions = await PostReaction.insertMany(postReactionsData);
  console.log(`✅ Seeded ${postReactions.length} post reactions`);
  
  return postReactions;
};
