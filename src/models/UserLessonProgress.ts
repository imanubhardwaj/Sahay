import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const userLessonProgressSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson', required: true },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz' },
  status: { 
    type: String, 
    enum: ['not_started', 'in_progress', 'completed', 'locked'], 
    default: 'not_started'
  },
  quizScore: { type: Number, default: 0 }, // Percentage score
  quizPassed: { type: Boolean, default: false }, // True if quiz is completed
  startedAt: { type: Date },
  completedAt: { type: Date },
  lastAccessedAt: { type: Date, default: Date.now }
});

userLessonProgressSchema.pre('save', updateUpdatedAt);

// Compound index for unique user-lesson combination
userLessonProgressSchema.index({ userId: 1, lessonId: 1 }, { unique: true });
userLessonProgressSchema.index({ userId: 1, moduleId: 1 });
userLessonProgressSchema.index({ userId: 1, status: 1 });

export default mongoose.models.UserLessonProgress || mongoose.model('UserLessonProgress', userLessonProgressSchema);


