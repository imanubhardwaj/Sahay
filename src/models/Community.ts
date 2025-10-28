import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const communitySchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true },
  description: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true }
});

communitySchema.pre('save', updateUpdatedAt);

// Index for efficient queries
communitySchema.index({ name: 1 });
communitySchema.index({ userId: 1 });
communitySchema.index({ skillId: 1 });

export default mongoose.models.Community || mongoose.model('Community', communitySchema);