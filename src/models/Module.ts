import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const moduleSchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true },
  description: { type: String, required: true },
  level: { type: String, enum: ['Beginner', 'Intermediate', 'Advanced'], required: true, default: 'Beginner' },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  duration: { type: Number, required: true }, // in minutes
  points: { type: Number, required: true, default: 0 },
  lessonsCount: { type: Number, default: 0 },
  icon: { type: String }, // Icon URL or emoji
  image: { type: String } // Image URL
});

moduleSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
moduleSchema.index({ skillId: 1 });
moduleSchema.index({ name: 1 });

export default mongoose.models.Module || mongoose.model('Module', moduleSchema);
