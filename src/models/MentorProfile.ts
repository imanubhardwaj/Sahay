import mongoose from "mongoose";
import { baseSchema, updateUpdatedAt } from "./BaseModel";
import { MENTOR_LEVEL } from "@/lib/constants";

const mentorProfileSchema = new mongoose.Schema({
  ...baseSchema,
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "User",
    required: false, // Made optional to handle existing mentors without userId
    unique: true,
    sparse: true, // Allow multiple null values
  },
  // Mentor Status
  isMentor: {
    type: Boolean,
    default: false,
  },
  isApproved: {
    type: Boolean,
    default: false,
  },
  // Admin-managed fields (not exposed to frontend)
  level: {
    type: String,
    enum: [MENTOR_LEVEL.L1, MENTOR_LEVEL.L2, MENTOR_LEVEL.L3],
    default: MENTOR_LEVEL.L3, // New mentors default to L3
    select: false, // Don't include in queries by default (admin only)
  },
  customPointRate: {
    type: Number,
    default: null, // null means use default rate based on level
    select: false, // Admin only
  },
  // Profile Information
  // Name fields (denormalized from User for display purposes)
  firstName: {
    type: String,
    maxlength: 100,
  },
  lastName: {
    type: String,
    maxlength: 100,
  },
  email: {
    type: String,
    maxlength: 255,
  },
  avatar: {
    type: String,
  },
  bio: {
    type: String,
    maxlength: 1000,
  },
  headline: {
    type: String,
    maxlength: 200,
  },
  expertise: [
    {
      type: String,
    },
  ],
  languages: [
    {
      type: String,
    },
  ],
  // Experience
  yearsOfExperience: {
    type: Number,
    default: 0,
  },
  currentRole: {
    type: String,
  },
  currentCompany: {
    type: String,
  },
  // Past Companies (work experience)
  pastCompanies: [
    {
      company: { type: String, required: true },
      role: { type: String, required: true },
      startDate: { type: String }, // Format: "YYYY-MM" or "YYYY"
      endDate: { type: String }, // Format: "YYYY-MM" or "YYYY", null for current
      isCurrent: { type: Boolean, default: false },
      description: { type: String }, // Optional description of role
    },
  ],
  // Pricing
  hourlyRate: {
    type: Number,
    default: 100, // in points
    required: true,
  },
  currency: {
    type: String,
    default: "points",
  },
  // Session Settings
  sessionTypes: [
    {
      name: { type: String, required: true },
      duration: { type: Number, required: true }, // in minutes
      price: { type: Number, required: true }, // in points
      description: String,
    },
  ],
  // Availability
  defaultAvailability: {
    monday: [{ start: String, end: String }],
    tuesday: [{ start: String, end: String }],
    wednesday: [{ start: String, end: String }],
    thursday: [{ start: String, end: String }],
    friday: [{ start: String, end: String }],
    saturday: [{ start: String, end: String }],
    sunday: [{ start: String, end: String }],
  },
  timezone: {
    type: String,
    default: "Asia/Kolkata",
  },
  // Google Calendar Integration (for Google Meet links)
  googleConnected: {
    type: Boolean,
    default: false,
  },
  googleAccessToken: {
    type: String,
    select: false,
  },
  googleRefreshToken: {
    type: String,
    select: false,
  },
  googleTokenExpiry: {
    type: Date,
    select: false,
  },
  // Stats
  totalSessions: {
    type: Number,
    default: 0,
  },
  completedSessions: {
    type: Number,
    default: 0,
  },
  cancelledSessions: {
    type: Number,
    default: 0,
  },
  totalEarnings: {
    type: Number,
    default: 0,
  },
  averageRating: {
    type: Number,
    default: 0,
  },
  totalReviews: {
    type: Number,
    default: 0,
  },
  // Additional Settings
  maxBookingsPerWeek: {
    type: Number,
    default: 10,
  },
  advanceBookingDays: {
    type: Number,
    default: 30,
  },
  cancellationPolicy: {
    type: String,
    default:
      "Cancellations must be made at least 24 hours in advance for a full refund.",
  },
  // Social Links
  linkedIn: String,
  twitter: String,
  github: String,
  website: String,
});

mentorProfileSchema.pre("save", updateUpdatedAt);

// Index for efficient queries
// Note: userId already has an index from unique: true, so we don't need to index it again
mentorProfileSchema.index({ isMentor: 1, isApproved: 1 });
mentorProfileSchema.index({ expertise: 1 });
mentorProfileSchema.index({ averageRating: -1 });

export default mongoose.models.MentorProfile ||
  mongoose.model("MentorProfile", mentorProfileSchema);
