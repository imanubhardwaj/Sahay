import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";
import { QUESTION_TYPE } from "../lib/constants";

const userQuizAnswerSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  questionId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Question",
    required: true,
  },
  answer: { type: String, required: true },
  type: {
    type: String,
    enum: QUESTION_TYPE,
    required: true,
  },
  isCorrect: { type: Boolean, default: false },
  pointsEarned: { type: Number, default: 0 },
});

userQuizAnswerSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userQuizAnswerSchema.index({ userId: 1 });
userQuizAnswerSchema.index({ questionId: 1 });
userQuizAnswerSchema.index({ isCorrect: 1 });

// Ensure one answer per user per question
userQuizAnswerSchema.index({ userId: 1, questionId: 1 }, { unique: true });

export default mongoose.models.UserQuizAnswer ||
  mongoose.model("UserQuizAnswer", userQuizAnswerSchema);
