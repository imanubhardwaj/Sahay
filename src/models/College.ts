import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const collegeSchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true, unique: true },
  address: { type: String },
  website: { type: String },
  email: { type: String },
});

collegeSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
// Note: name already has an index from unique: true, so we don't need to index it again
collegeSchema.index({ email: 1 });

export default mongoose.models.College ||
  mongoose.model("College", collegeSchema);
