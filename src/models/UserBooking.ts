import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";
import { BOOKING_STATUS } from "../lib/constants";

const userBookingSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  participants: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
  bookingDateTime: { type: Date, required: true },
  duration: { type: Number, required: true }, // in minutes
  status: {
    type: String,
    enum: BOOKING_STATUS,
    default: BOOKING_STATUS.Pending,
  },
});

userBookingSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userBookingSchema.index({ userId: 1 });
userBookingSchema.index({ bookingDateTime: 1 });
userBookingSchema.index({ status: 1 });

export default mongoose.models.UserBooking ||
  mongoose.model("UserBooking", userBookingSchema);
