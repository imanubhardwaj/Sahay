import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const userSocialLinkSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  linkId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "SocialLink",
    required: true,
  },
});

userSocialLinkSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userSocialLinkSchema.index({ userId: 1 });
userSocialLinkSchema.index({ linkId: 1 });

export default mongoose.models.UserSocialLink ||
  mongoose.model("UserSocialLink", userSocialLinkSchema);
