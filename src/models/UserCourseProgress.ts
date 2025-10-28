import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const userCourseProgressSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  completedCourses: [{
    courseId: { type: mongoose.Schema.Types.ObjectId, ref: 'Course', required: false },
    moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
    currentLessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
    completedLessonIds: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' }],
    pointsEarned: { type: Number, default: 0 },
    progress: { type: Number, default: 0 }, // Progress percentage (0-100)
    status: { 
      type: String, 
      enum: ['not_started', 'in_progress', 'completed'], 
      default: 'not_started'
    },
    startedAt: { type: Date },
    completedAt: { type: Date },
    lastAccessedAt: { type: Date, default: Date.now }
  }],
  totalPointsEarned: { type: Number, default: 0 }
});

userCourseProgressSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
userCourseProgressSchema.index({ userId: 1 });
userCourseProgressSchema.index({ 'completedCourses.courseId': 1 });
userCourseProgressSchema.index({ 'completedCourses.status': 1 });

// Clear the model cache to ensure the updated schema is used
if (mongoose.models.UserCourseProgress) {
  delete mongoose.models.UserCourseProgress;
}

export default mongoose.model('UserCourseProgress', userCourseProgressSchema);

