import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const userCompanySchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  companyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Company",
    required: true,
  },
  startDate: { type: Date },
  endDate: { type: Date },
  position: { type: String },
  isCurrent: { type: Boolean, default: false },
});

userCompanySchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userCompanySchema.index({ userId: 1 });
userCompanySchema.index({ companyId: 1 });
userCompanySchema.index({ isCurrent: 1 });

export default mongoose.models.UserCompany ||
  mongoose.model("UserCompany", userCompanySchema);
