import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const answerSchema = new mongoose.Schema({
  text: { type: String, required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

const communityQuestionSchema = new mongoose.Schema({
  ...baseSchema,
  title: { type: String, required: true },
  body: { type: String, required: true },
  tags: [{ type: String }],
  askedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  answers: [answerSchema],
  upvotes: { type: Number, default: 0 },
  downvotes: { type: Number, default: 0 },
  views: { type: Number, default: 0 },
  isResolved: { type: Boolean, default: false },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }
});

communityQuestionSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
communityQuestionSchema.index({ title: 1 });
communityQuestionSchema.index({ tags: 1 });
communityQuestionSchema.index({ askedBy: 1 });
communityQuestionSchema.index({ skillId: 1 });
communityQuestionSchema.index({ createdAt: -1 });

export default mongoose.models.CommunityQuestion || mongoose.model('CommunityQuestion', communityQuestionSchema);
