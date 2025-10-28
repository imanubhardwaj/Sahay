import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const lessonProgressSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'failed'], 
    default: 'not_started'
  },
  pointsEarned: { type: Number, default: 0 },
  attempts: { type: Number, default: 0 },
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastAttemptAt: { type: Date },
  timeSpent: { type: Number, default: 0 }, // in seconds
  quizScore: { type: Number }, // percentage
  notes: { type: String }
});

lessonProgressSchema.pre('save', updateUpdatedAt);

// Compound index for unique user-lesson combination
lessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
lessonProgressSchema.index({ userId: 1, moduleId: 1 });
lessonProgressSchema.index({ userId: 1, status: 1 });

export default mongoose.models.LessonProgress || mongoose.model('LessonProgress', lessonProgressSchema);

