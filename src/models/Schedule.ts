import mongoose from 'mongoose';

const scheduleSchema = new mongoose.Schema({
  professionalId: { 
    type: mongoose.Schema.Types.ObjectId, 
    ref: 'User', 
    required: true 
  },
  title: { 
    type: String, 
    required: true 
  },
  description: String,
  date: { 
    type: Date, 
    required: true 
  },
  startTime: { 
    type: String, 
    required: true 
  },
  endTime: { 
    type: String, 
    required: true 
  },
  duration: { 
    type: Number, 
    required: true,
    default: 30 // in minutes
  },
  maxBookings: { 
    type: Number, 
    default: 1 
  },
  currentBookings: { 
    type: Number, 
    default: 0 
  },
  price: { 
    type: Number, 
    required: true 
  },
  sessionType: { 
    type: String, 
    enum: ['one-on-one', 'group', 'workshop', 'consultation'],
    default: 'one-on-one'
  },
  isRecurring: { 
    type: Boolean, 
    default: false 
  },
  recurringPattern: {
    type: String,
    enum: ['daily', 'weekly', 'monthly'],
    required: function() { return this.isRecurring; }
  },
  recurringEndDate: {
    type: Date,
    required: function() { return this.isRecurring; }
  },
  isActive: { 
    type: Boolean, 
    default: true 
  },
  location: {
    type: String,
    enum: ['online', 'in-person'],
    default: 'online'
  },
  meetingLink: String,
  address: String,
  requirements: [String], // What students need to prepare
  skills: [String], // Skills this session covers
  createdAt: { type: Date, default: Date.now },
  updatedAt: { type: Date, default: Date.now }
});

// Update the updatedAt field before saving
scheduleSchema.pre('save', function(next) {
  this.updatedAt = new Date();
  next();
});

// Index for efficient queries
scheduleSchema.index({ professionalId: 1, date: 1 });
scheduleSchema.index({ date: 1, startTime: 1 });
scheduleSchema.index({ isActive: 1, date: 1 });

export default mongoose.models.Schedule || mongoose.model('Schedule', scheduleSchema);
