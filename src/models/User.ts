import mongoose from "mongoose";
import { MODULE_STATUS, USER_ROLE } from "../lib/constants";
import { baseSchema } from "./BaseModel";

const userSchema = new mongoose.Schema({
  ...baseSchema,
  firstName: { type: String, required: true },
  lastName: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  username: { type: String, required: true, unique: true },
  status: {
    type: String,
    enum: ["active", "inactive", "suspended"],
    default: "active",
  },
  collegeId: { type: mongoose.Schema.Types.ObjectId, ref: "College" },
  bio: { type: String, default: "" },
  resume: { type: String }, // URL or file path to resume
  yoe: { type: Number, default: 0 }, // Years of Experience
  title: { type: String, default: "" }, // e.g., "Senior Frontend Engineer"
  profilePictureAttachmentId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Attachment",
  },
  location: { type: String, default: "" },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    unique: true,
    sparse: true,
  },
  visibility: {
    type: String,
    enum: ["public", "private", "connections"],
    default: "public",
  },
  workosId: { type: String, required: true, unique: true },
  role: { type: String, enum: USER_ROLE, default: "student" },
  userType: {
    type: String,
    enum: ["student_fresher", "working_professional"],
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
  // Profile completion tracking
  profileCompletionPercentage: { type: Number, default: 0 },
  profileCompletionBonusAwarded: { type: Boolean, default: false },
  // Economy tracking
  hasStartedFirstCourse: { type: Boolean, default: false }, // For free first course
  hasCompletedFirstMentorship: { type: Boolean, default: false }, // For 50% first call discount
  signupBonusAwarded: { type: Boolean, default: false }, // Track if signup bonus was given
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

// Pre-save hook: validation and calculations
userSchema.pre("save", async function (next) {
  this.updatedAt = new Date();

  // If onboarding is complete, userType is required
  if (this.isOnboardingComplete && !this.userType) {
    const error = new Error("userType is required when onboarding is complete");
    return next(error);
  }

  // Calculate profile completion percentage
  const { calculateProfileCompletionPercentage } = await import(
    "../lib/points-economy"
  );
  this.profileCompletionPercentage = calculateProfileCompletionPercentage({
    firstName: this.firstName,
    lastName: this.lastName,
    email: this.email,
    bio: this.bio,
    title: this.title,
    location: this.location,
    profilePictureAttachmentId: this.profilePictureAttachmentId?.toString(),
    skills: this.skills?.map((s: { toString: () => string }) => s.toString()),
    userType: this.userType,
  });

  next();
});

// Post-save hook: create wallet and award bonuses (after user has _id)
userSchema.post("save", async function (doc) {
  try {
    // Create wallet with signup bonus if it doesn't exist (new user)
    if (!doc.walletId) {
      try {
        const { createUserWallet } = await import("../lib/wallet");
        // Create wallet with signup bonus (100 points)
        const wallet = await createUserWallet(doc._id.toString(), true);
        // Update user with wallet reference
        const User = mongoose.model("User");
        await User.findByIdAndUpdate(doc._id, {
          walletId: wallet._id,
          signupBonusAwarded: true,
        });
      } catch (error) {
        console.error("Error creating wallet for user:", error);
        // Don't fail user creation if wallet creation fails
      }
    }

    // Award profile completion bonus if profile is 100% complete and not yet awarded
    if (
      doc.profileCompletionPercentage >= 100 &&
      !doc.profileCompletionBonusAwarded
    ) {
      try {
        const { awardProfileCompletionBonus } = await import("../lib/wallet");
        await awardProfileCompletionBonus(doc._id.toString());
        const User = mongoose.model("User");
        await User.findByIdAndUpdate(doc._id, {
          profileCompletionBonusAwarded: true,
        });
      } catch (error) {
        console.error("Error awarding profile completion bonus:", error);
      }
    }
  } catch (error) {
    console.error("Error in post-save hook:", error);
    // Don't throw - user is already saved
  }
});

// Clear the model cache to ensure the updated schema is used
if (mongoose.models.User) {
  delete mongoose.models.User;
}

export default mongoose.model("User", userSchema);
