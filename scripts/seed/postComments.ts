import { PostComment } from '../../src/models';

export const seedPostComments = async (posts: any[], comments: any[], users: any[]) => {
  console.log('🌱 Seeding post comments...');
  
  const postCommentsData = posts.slice(0, 2).map((post, index) => ({
    postId: post._id,
    commentId: comments[index]?._id,
    userId: users[index]?._id
  }));

  const postComments = await PostComment.insertMany(postCommentsData);
  console.log(`✅ Seeded ${postComments.length} post comments`);
  
  return postComments;
};
