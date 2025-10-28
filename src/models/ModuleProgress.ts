import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const moduleProgressSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  currentLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  completedLessons: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
  totalLessons: { type: Number, default: 0 },
  completionPercentage: { type: Number, default: 0 }, // 0-100
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed'], 
    default: 'not_started'
  },
  pointsEarned: { type: Number, default: 0 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now },
  nextLessonOrder: { type: Number, default: 1 }, // Start from lesson 1, increments when lesson is completed
  completedLessonCount: { type: Number, default: 0 } // Count of completed lessons
});

moduleProgressSchema.pre('save', updateUpdatedAt);

// Compound index for unique user-module combination
moduleProgressSchema.index({ userId: 1, moduleId: 1 }, { unique: true });
moduleProgressSchema.index({ userId: 1, status: 1 });
moduleProgressSchema.index({ userId: 1, completionPercentage: 1 });

export default mongoose.models.ModuleProgress || mongoose.model('ModuleProgress', moduleProgressSchema);


