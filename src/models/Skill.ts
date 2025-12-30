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
// Note: name already has an index from unique: true, so we don't need to index it again
skillSchema.index({ parentSkillId: 1 });

export default mongoose.models.Skill || mongoose.model('Skill', skillSchema);
