import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const userResumeSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  attachmentUrl: { type: String, required: true },
});

userResumeSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userResumeSchema.index({ userId: 1 });

export default mongoose.models.UserResume ||
  mongoose.model("UserResume", userResumeSchema);
