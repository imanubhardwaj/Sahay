import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const skillSchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true, unique: true },
  description: { type: String, required: true },
  parentSkillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', default: null }
});

skillSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
skillSchema.index({ name: 1 });
skillSchema.index({ parentSkillId: 1 });

export default mongoose.models.Skill || mongoose.model('Skill', skillSchema);
