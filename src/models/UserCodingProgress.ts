import mongoose, { Schema, Document } from "mongoose";

export interface IUserCodingProgress extends Document {
  userId: mongoose.Types.ObjectId;
  problemId: mongoose.Types.ObjectId;
  status: "attempted" | "solved";
  submissions: {
    code: string;
    language: string;
    passed: boolean;
    testsPassed: number;
    totalTests: number;
    submittedAt: Date;
  }[];
  bestSubmission?: {
    code: string;
    language: string;
    submittedAt: Date;
  };
  solvedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
}

const UserCodingProgressSchema = new Schema<IUserCodingProgress>(
  {
    userId: { type: Schema.Types.ObjectId, ref: "User", required: true },
    problemId: {
      type: Schema.Types.ObjectId,
      ref: "CodingProblem",
      required: true,
    },
    status: {
      type: String,
      enum: ["attempted", "solved"],
      default: "attempted",
    },
    submissions: [
      {
        code: { type: String, required: true },
        language: { type: String, required: true },
        passed: { type: Boolean, default: false },
        testsPassed: { type: Number, default: 0 },
        totalTests: { type: Number, default: 0 },
        submittedAt: { type: Date, default: Date.now },
      },
    ],
    bestSubmission: {
      code: { type: String },
      language: { type: String },
      submittedAt: { type: Date },
    },
    solvedAt: { type: Date },
  },
  {
    timestamps: true,
  }
);

// Compound index for efficient queries
UserCodingProgressSchema.index({ userId: 1, problemId: 1 }, { unique: true });

export default mongoose.models.UserCodingProgress ||
  mongoose.model<IUserCodingProgress>(
    "UserCodingProgress",
    UserCodingProgressSchema
  );

