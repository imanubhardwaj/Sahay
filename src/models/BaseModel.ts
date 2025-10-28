import mongoose from "mongoose";

// Base schema with common fields
export const baseSchema = {
  id: {
    type: String,
    unique: true,
    default: () => new mongoose.Types.ObjectId().toString(),
  },
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now },
  deletedAt: { type: Date, default: null },
};

// Pre-save middleware to update updatedAt
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const updateUpdatedAt = function (this: any, next: () => void) {
  this.updatedAt = new Date();
  next();
};

// Soft delete middleware
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export const softDelete = function (this: any, next: () => void) {
  this.deletedAt = new Date();
  next();
};
