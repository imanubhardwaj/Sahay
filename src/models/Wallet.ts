import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";

const walletSchema = new mongoose.Schema({
  ...baseSchema,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: true,
    unique: true,
  },
  balance: { type: Number, required: true, default: 0 },
  totalEarned: { type: Number, required: true, default: 0 },
  totalSpent: { type: Number, required: true, default: 0 },
});

walletSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
// Note: userId already has an index from unique: true, so we don't need to index it again
walletSchema.index({ balance: -1 }); // For leaderboards

export default mongoose.models.Wallet || mongoose.model("Wallet", walletSchema);
