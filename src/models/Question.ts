import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';
import { QUESTION_TYPE } from '../lib/constants';

const optionSchema = new mongoose.Schema({
  id: { type: String, required: true },
  type: { 
    type: String, 
    enum: QUESTION_TYPE, 
    required: true 
  },
  content: { type: String, required: true }
});

const questionSchema = new mongoose.Schema({
  ...baseSchema,
  questionText: { type: String, required: true }, // The actual question text
  type: { 
    type: String, 
    enum: QUESTION_TYPE, 
    required: true 
  },
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: 'Quiz', required: true },
  lessonId: { type: mongoose.Schema.Types.ObjectId, ref: 'Lesson' },
  moduleId: { type: mongoose.Schema.Types.ObjectId, ref: 'Module', required: true },
  points: { type: Number, default: 10 },
  order: { type: Number, default: 1 },
  evaluationCriteria: { type: String }, // For subjective questions
  explanation: { type: String }, // Explanation for the answer
  options: [optionSchema],
  answer: {
    type: { 
      type: String, 
      enum: QUESTION_TYPE, 
      required: true 
    },
    content: { type: String, required: true },
    optionId: { type: String } // For MCQ questions
  }
});

questionSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
questionSchema.index({ quizId: 1 });
questionSchema.index({ lessonId: 1 });
questionSchema.index({ moduleId: 1 });
questionSchema.index({ type: 1 });

export default mongoose.models.Question || mongoose.model('Question', questionSchema);