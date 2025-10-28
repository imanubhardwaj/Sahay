import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const postReactionSchema = new mongoose.Schema({
  ...baseSchema,
  postId: { type: mongoose.Schema.Types.ObjectId, ref: 'Post', required: true },
  reaction: { 
    type: String, 
    enum: ['Like', 'Heart'], 
    required: true 
  },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true }
});

postReactionSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
postReactionSchema.index({ postId: 1 });
postReactionSchema.index({ userId: 1 });
postReactionSchema.index({ reaction: 1 });

export default mongoose.models.PostReaction || mongoose.model('PostReaction', postReactionSchema);