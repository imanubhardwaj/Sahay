import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const companySchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true, unique: true },
  address: { type: String },
  website: { type: String },
  email: { type: String },
});

companySchema.pre("save", updateUpdatedAt);

// Index for efficient queries
// Note: name already has an index from unique: true, so we don't need to index it again
companySchema.index({ email: 1 });

export default mongoose.models.Company ||
  mongoose.model("Company", companySchema);
