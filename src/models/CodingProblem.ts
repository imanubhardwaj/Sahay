import mongoose, { Schema, Document } from "mongoose";

export interface ICodingProblem extends Document {
  title: string;
  description: string;
  difficulty: "easy" | "medium" | "hard";
  category: string;
  tags: string[];
  starterCode: {
    javascript?: string;
    python?: string;
    typescript?: string;
  };
  testCases: {
    input: string;
    expectedOutput: string;
    isHidden: boolean;
  }[];
  hints: string[];
  solution?: string;
  points: number;
  solvedCount: number;
  attemptCount: number;
  createdAt: Date;
  updatedAt: Date;
}

const CodingProblemSchema = new Schema<ICodingProblem>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    difficulty: {
      type: String,
      enum: ["easy", "medium", "hard"],
      default: "easy",
    },
    category: { type: String, required: true },
    tags: [{ type: String }],
    starterCode: {
      javascript: { type: String },
      python: { type: String },
      typescript: { type: String },
    },
    testCases: [
      {
        input: { type: String, required: true },
        expectedOutput: { type: String, required: true },
        isHidden: { type: Boolean, default: false },
      },
    ],
    hints: [{ type: String }],
    solution: { type: String },
    points: { type: Number, default: 10 },
    solvedCount: { type: Number, default: 0 },
    attemptCount: { type: Number, default: 0 },
  },
  {
    timestamps: true,
  }
);

export default mongoose.models.CodingProblem ||
  mongoose.model<ICodingProblem>("CodingProblem", CodingProblemSchema);

