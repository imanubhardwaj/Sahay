import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const userCollegeSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "College",
    required: true,
  },
  startDate: { type: Date },
  endDate: { type: Date },
  degree: { type: String },
  fieldOfStudy: { type: String },
  gpa: { type: Number },
  isCurrent: { type: Boolean, default: false },
});

userCollegeSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userCollegeSchema.index({ userId: 1 });
userCollegeSchema.index({ collegeId: 1 });
userCollegeSchema.index({ isCurrent: 1 });

export default mongoose.models.UserCollege ||
  mongoose.model("UserCollege", userCollegeSchema);
