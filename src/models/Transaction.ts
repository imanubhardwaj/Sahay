import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";
import { TRANSACTION_SOURCE, TRANSACTION_TYPE } from "../lib/constants";

const transactionSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  walletId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Wallet",
    required: true,
  },
  type: {
    type: String,
    enum: TRANSACTION_TYPE,
    required: true,
  },
  points: { type: Number, required: true },
  source: {
    type: String,
    enum: TRANSACTION_SOURCE,
    required: true,
  },
  description: { type: String },
  referenceId: { type: String }, // ID of the source (quiz, lesson, etc.)
});

transactionSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
transactionSchema.index({ userId: 1 });
transactionSchema.index({ walletId: 1 });
transactionSchema.index({ type: 1 });
transactionSchema.index({ source: 1 });

export default mongoose.models.Transaction ||
  mongoose.model("Transaction", transactionSchema);
