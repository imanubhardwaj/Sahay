import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";
import { DAYS_OF_WEEK } from "../lib/constants";

const userScheduleSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  day: {
    type: String,
    enum: DAYS_OF_WEEK,
    required: true,
  },
  startTime: { type: String, required: true }, // Format: "HH:MM"
  endTime: { type: String, required: true }, // Format: "HH:MM"
  timezone: { type: String, required: true, default: "UTC" },
});

userScheduleSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
userScheduleSchema.index({ userId: 1 });
userScheduleSchema.index({ day: 1 });

export default mongoose.models.UserSchedule ||
  mongoose.model("UserSchedule", userScheduleSchema);
