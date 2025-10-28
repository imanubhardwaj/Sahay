import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const lessonSchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true },
  contentArray: [{ type: String, required: true }],
  type: { 
    type: String, 
    enum: ['Text', 'Code'], 
    required: true 
  },
  content: { type: String, required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  skillId: { type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true },
  duration: { type: Number, required: true }, // in minutes
  points: { type: Number, required: true, default: 0 },
  order: { type: Number, required: true, default: 0 }
});

lessonSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
lessonSchema.index({ name: 1 });
lessonSchema.index({ moduleId: 1 });
lessonSchema.index({ skillId: 1 });
lessonSchema.index({ type: 1 });

export default mongoose.models.Lesson || mongoose.model('Lesson', lessonSchema);