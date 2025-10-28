import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const postAttachmentSchema = new mongoose.Schema({
  type: { type: String, required: true },
  attachmentId: { type: mongoose.Schema.Types.ObjectId, ref: 'Attachment' },
  content: { type: String, required: true }
});

const postSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  content: { type: String, required: true },
  communityId: { type: mongoose.Schema.Types.ObjectId, ref: 'Community', required: true },
  skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true }],
  postAttachments: [postAttachmentSchema]
});

postSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
postSchema.index({ userId: 1 });
postSchema.index({ communityId: 1 });
postSchema.index({ skillIds: 1 });

export default mongoose.models.Post || mongoose.model('Post', postSchema);