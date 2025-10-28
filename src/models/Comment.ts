import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const commentSchema = new mongoose.Schema({
  ...baseSchema,
  content: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true }
});

commentSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
commentSchema.index({ userId: 1 });
commentSchema.index({ postId: 1 });

export default mongoose.models.Comment || mongoose.model('Comment', commentSchema);