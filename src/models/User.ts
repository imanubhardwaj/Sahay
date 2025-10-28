import mongoose from "mongoose";
import { MODULE_STATUS, USER_ROLE } from "../lib/constants";
import { baseSchema } from "./BaseModel";

const userSchema = new mongoose.Schema({
  ...baseSchema,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  status: { type: String, enum: ["active", "inactive", "suspended"], default: "active" },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  bio: { type: String, default: "" },
  resume: { type: String }, // URL or file path to resume
  yoe: { type: Number, default: 0 }, // Years of Experience
  title: { type: String, default: "" }, // e.g., "Senior Frontend Engineer"
  profilePictureAttachmentId: { type: mongoose.Schema.Types.ObjectId, ref: "Attachment" },
  location: { type: String, default: "" },
  walletId: { type: mongoose.Schema.Types.ObjectId, ref: "Wallet", unique: true, sparse: true },
  visibility: { type: String, enum: ["public", "private", "connections"], default: "public" },
  workosId: { type: String, required: true, unique: true },
  role: { type: String, enum: USER_ROLE, default: "student" },
  userType: {
    type: String,
    enum: ["student_fresher", "working_professional_2_3_yr", "experienced_professional_4_6_yr", "industry_expert_8_plus_yr", "company"],
    required: true,
  },
  // Student-specific fields
  college: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  year: { type: Number, min: 1, max: 4 }, // Academic year
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: "Skill" }],
  portfolio: [{ type: mongoose.Schema.Types.ObjectId, ref: "Project" }],
  mentors: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  progress: {
    currentGoal: { type: String, default: "" },
    completionRate: { type: Number, default: 0 },
  },
  completionRate: { type: Number, default: 0 },
  avatar: String,
  isOnboardingComplete: { type: Boolean, default: false },
  selectedModules: [
    {
      moduleId: { type: mongoose.Schema.Types.ObjectId, ref: "Module" },
      status: {
        type: String,
        enum: MODULE_STATUS,
        default: MODULE_STATUS.NotStarted,
      },
      startedAt: Date,
      completedAt: Date,
      progress: { type: Number, default: 0 },
    },
  ],
});

// Custom validation to require userType only after onboarding is complete
userSchema.pre("save", async function (next) {
  this.updatedAt = new Date();

  // If onboarding is complete, userType is required
  if (this.isOnboardingComplete && !this.userType) {
    const error = new Error("userType is required when onboarding is complete");
    return next(error);
  }

  // Create wallet if it doesn't exist
  if (this.isNew && !this.walletId) {
    try {
      const { createUserWallet } = await import("../lib/wallet");
      const wallet = await createUserWallet(this._id);
      this.walletId = wallet._id;
    } catch (error) {
      console.error("Error creating wallet for user:", error);
      // Don't fail user creation if wallet creation fails
    }
  }

  next();
});

// Clear the model cache to ensure the updated schema is used
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model("User", userSchema);
