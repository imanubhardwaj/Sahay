import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const quizSchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true },
  description: { type: String, required: true },
  duration: { type: Number, required: true }, // in minutes
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  lessonOrder: { type: Number },
  numberOfQuestions: { type: Number, required: true, default: 0 },
  points: { type: Number, required: true, default: 0 }
});

quizSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
quizSchema.index({ moduleId: 1 });
quizSchema.index({ lessonId: 1 });
quizSchema.index({ name: 1 });

export default mongoose.models.Quiz || mongoose.model('Quiz', quizSchema);
