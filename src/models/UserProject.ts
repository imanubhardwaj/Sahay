import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const userProjectSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  projectId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Project",
    required: true,
  },
});

userProjectSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userProjectSchema.index({ userId: 1 });
userProjectSchema.index({ projectId: 1 });

// Ensure one entry per user per project
userProjectSchema.index({ userId: 1, projectId: 1 }, { unique: true });

export default mongoose.models.UserProject ||
  mongoose.model("UserProject", userProjectSchema);
