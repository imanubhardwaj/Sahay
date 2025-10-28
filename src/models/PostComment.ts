import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const postCommentSchema = new mongoose.Schema({
  ...baseSchema,
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  commentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Comment', required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

postCommentSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
postCommentSchema.index({ postId: 1 });
postCommentSchema.index({ commentId: 1 });
postCommentSchema.index({ userId: 1 });

export default mongoose.models.PostComment || mongoose.model('PostComment', postCommentSchema);