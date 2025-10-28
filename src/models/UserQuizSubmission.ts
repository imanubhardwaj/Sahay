import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const userQuizSubmissionSchema = new mongoose.Schema({
  ...baseSchema,
  quizId: { type: mongoose.Schema.Types.ObjectId, ref: "Quiz", required: true },
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  score: { type: Number, required: true, default: 0 },
  maxScore: { type: Number, required: true },
  percentage: { type: Number, required: true, default: 0 },
  report: { type: String }, // Detailed report of the quiz attempt
  timeSpent: { type: Number, default: 0 }, // in minutes
  completedAt: { type: Date },
  isPassed: { type: Boolean, default: false },
  passingPercentage: { type: Number, default: 70 },
});

userQuizSubmissionSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userQuizSubmissionSchema.index({ quizId: 1 });
userQuizSubmissionSchema.index({ userId: 1 });
userQuizSubmissionSchema.index({ score: -1 });
userQuizSubmissionSchema.index({ isPassed: 1 });

// Ensure one submission per user per quiz
userQuizSubmissionSchema.index({ quizId: 1, userId: 1 }, { unique: true });

export default mongoose.models.UserQuizSubmission ||
  mongoose.model("UserQuizSubmission", userQuizSubmissionSchema);
