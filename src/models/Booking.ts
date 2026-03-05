import mongoose from 'mongoose';

const bookingSchema = new mongoose.Schema({
  studentId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  professionalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  scheduleId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'Schedule', 
    required: true 
  },
  status: { 
    type: String, 
    enum: ['pending', 'confirmed', 'cancelled', 'completed', 'no-show'],
    default: 'pending'
  },
  sessionDate: { 
    type: Date, 
    required: true 
  },
  sessionTime: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true 
  },
  price: { 
    type: Number, 
    required: true 
  },
  paymentStatus: { 
    type: String, 
    enum: ['pending', 'paid', 'refunded', 'failed'],
    default: 'pending'
  },
  paymentId: String, // External payment system ID
  studentNotes: String, // What the student wants to discuss
  professionalNotes: String, // Professional's notes about the session
  meetingLink: String,
  location: {
    type: String,
    enum: ['online', 'in-person'],
    default: 'online'
  },
  address: String,
  // Approval System
  approvalToken: String, // Token for mentor to approve/reject
  approvalStatus: {
    type: String,
    enum: ['pending', 'approved', 'rejected'],
    default: 'pending'
  },
  approvedAt: Date,
  rejectedAt: Date,
  rejectionReason: String,
  // Email Tracking
  emailSentToStudent: { type: Boolean, default: false },
  emailSentToMentor: { type: Boolean, default: false },
  reminderSentToStudent: { type: Boolean, default: false },
  reminderSentToMentor: { type: Boolean, default: false },
  approvalEmailSent: { type: Boolean, default: false },
  sessionType: { 
    type: String, 
    enum: ['one-on-one', 'group', 'workshop', 'consultation'],
    default: 'one-on-one'
  },
  skills: [String], // Skills this session will cover
  requirements: [String], // What student needs to prepare
  feedback: {
    studentRating: { type: Number, min: 1, max: 5 },
    studentReview: String,
    professionalRating: { type: Number, min: 1, max: 5 },
    professionalReview: String,
    submittedAt: Date
  },
  cancellationReason: String,
  cancelledAt: Date,
  cancelledBy: {
    type: String,
    enum: ['student', 'professional', 'system']
  },
  // Sahay Economy Fields
  mentorLevel: {
    type: String,
    enum: ['L1', 'L2', 'L3'],
    default: 'L3'
  },
  mentorReceivesPoints: { type: Number }, // Points mentor receives (may differ from price if first call discount)
  isFirstCallDiscount: { type: Boolean, default: false }, // Whether 50% first call discount was applied
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
bookingSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Indexes for efficient queries
bookingSchema.index({ studentId: 1, sessionDate: 1 });
bookingSchema.index({ professionalId: 1, sessionDate: 1 });
bookingSchema.index({ scheduleId: 1 });
bookingSchema.index({ status: 1, sessionDate: 1 });
bookingSchema.index({ paymentStatus: 1 });

export default mongoose.models.Booking || mongoose.model('Booking', bookingSchema);
