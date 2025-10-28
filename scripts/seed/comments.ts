import { Comment } from '../../src/models';

export const seedComments = async (users: any[], posts: any[]) => {
  console.log('🌱 Seeding comments...');
  
  const commentsData = [
    {
      content: 'Great post! Thanks for sharing.',
      userId: users[0]?._id,
      postId: posts[0]?._id
    },
    {
      content: 'This is very helpful information.',
      userId: users[1]?._id,
      postId: posts[0]?._id
    }
  ];

  const comments = await Comment.insertMany(commentsData);
  console.log(`✅ Seeded ${comments.length} comments`);
  
  return comments;
};
