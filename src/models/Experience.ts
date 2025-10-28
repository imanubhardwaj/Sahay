import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const experienceSchema = new mongoose.Schema({
  ...baseSchema,
  title: { type: String, required: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  startDate: { type: Date, required: true },
  endDate: { type: Date },
  description: { type: String, required: true },
  skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true }],
  isCurrent: { type: Boolean, default: false },
  visibility: { 
    type: String, 
    enum: ['public', 'private', 'connections'], 
    default: 'public' 
  }
});

experienceSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
experienceSchema.index({ companyId: 1 });
experienceSchema.index({ skillIds: 1 });
experienceSchema.index({ isCurrent: 1 });

export default mongoose.models.Experience || mongoose.model('Experience', experienceSchema);