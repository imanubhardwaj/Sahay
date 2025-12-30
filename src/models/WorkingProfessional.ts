import mongoose from 'mongoose';
import { baseSchema, updateUpdatedAt } from './BaseModel';

const workingProfessionalSchema = new mongoose.Schema({
  ...baseSchema,
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User', required: true, unique: true },
  companyId: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: true },
  title: { type: String, required: true },
  department: { type: String },
  startDate: { type: Date, required: true },
  isCurrent: { type: Boolean, default: true },
  skills: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Skill' }],
  experience: [{ type: mongoose.Schema.Types.ObjectId, ref: 'Experience' }],
  availability: {
    isAvailable: { type: Boolean, default: true },
    maxMentees: { type: Number, default: 5 },
    hourlyRate: { type: Number, default: 0 }
  }
});

workingProfessionalSchema.pre('save', updateUpdatedAt);

// Index for efficient queries
// Note: userId already has an index from unique: true, so we don't need to index it again
workingProfessionalSchema.index({ companyId: 1 });
workingProfessionalSchema.index({ 'availability.isAvailable': 1 });

export default mongoose.models.WorkingProfessional || mongoose.model('WorkingProfessional', workingProfessionalSchema);