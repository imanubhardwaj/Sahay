import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";
import { ATTACHMENT_TYPE } from "../lib/constants";

const attachmentSchema = new mongoose.Schema({
  ...baseSchema,
  url: { type: String, required: true },
  type: {
    type: String,
    enum: ATTACHMENT_TYPE,
    required: true,
  },
});

attachmentSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
attachmentSchema.index({ type: 1 });
attachmentSchema.index({ url: 1 });

export default mongoose.models.Attachment ||
  mongoose.model("Attachment", attachmentSchema);
