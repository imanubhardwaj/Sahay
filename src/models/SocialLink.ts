import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";
import { SOCIAL_LINK_PLATFORM } from "../lib/constants";

const socialLinkSchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true },
  platform: {
    type: String,
    enum: SOCIAL_LINK_PLATFORM,
  },
  url: { type: String },
});

socialLinkSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
socialLinkSchema.index({ platform: 1 });
socialLinkSchema.index({ name: 1 });

export default mongoose.models.SocialLink ||
  mongoose.model("SocialLink", socialLinkSchema);
