import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";
import { USER_SKILL_PROFICIENCY } from "../lib/constants";

const userSkillSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  skillId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Skill",
    required: true,
  },
  proficiency: {
    type: String,
    enum: USER_SKILL_PROFICIENCY,
    default: USER_SKILL_PROFICIENCY.Beginner,
  },
  experience: { type: Number, default: 0 }, // in months
});



userSkillSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userSkillSchema.index({ userId: 1 });
userSkillSchema.index({ skillId: 1 });
userSkillSchema.index({ proficiency: 1 });

// Ensure one entry per user per skill
userSkillSchema.index({ userId: 1, skillId: 1 }, { unique: true });

export default mongoose.models.UserSkill ||
  mongoose.model("UserSkill", userSkillSchema);
