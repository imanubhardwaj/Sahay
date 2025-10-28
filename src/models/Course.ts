import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const courseSchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true },
  description: { type: String, required: true },
  skillIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill', required: true }],
  duration: { type: Number, required: true }, // in minutes
  level: { 
    type: String, 
    enum: ['Beginner', 'Intermediate', 'Advanced'], 
    required: true 
  },
  subModuleIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Module' }],
  tags: [{ type: String }]
});

courseSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
courseSchema.index({ name: 1 });
courseSchema.index({ skillIds: 1 });
courseSchema.index({ level: 1 });
courseSchema.index({ tags: 1 });

export default mongoose.models.Course || mongoose.model('Course', courseSchema);