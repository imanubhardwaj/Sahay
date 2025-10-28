import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const projectSchema = new mongoose.Schema({
  ...baseSchema,
  name: { type: String, required: true },
  url: { type: String },
  description: { type: String, required: true },
  skillIds: [
    { type: mongoose.Schema.Types.ObjectId, ref: "Skill", required: true },
  ],
  sourceCodeUrl: { type: String },
});

projectSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
projectSchema.index({ skillIds: 1 });
projectSchema.index({ name: 1 });

export default mongoose.models.Project ||
  mongoose.model("Project", projectSchema);
