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
collegeSchema.index({ name: 1 });
collegeSchema.index({ email: 1 });

export default mongoose.models.College ||
  mongoose.model("College", collegeSchema);
