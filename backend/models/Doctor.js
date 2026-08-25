const mongoose = require('mongoose');

const availabilitySchema = new mongoose.Schema(
  {
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], required: true },
    enabled: { type: Boolean, default: true },
    start: { type: String, default: '09:00' },
    end: { type: String, default: '17:00' },
  },
  { _id: false }
);

const doctorSchema = new mongoose.Schema(
  {
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    name: { type: String, required: true, trim: true },
    specialization: { type: String, required: true, trim: true },
    qualification: { type: String, trim: true },
    consultationFee: { type: Number, min: 0, default: 0 },
    slotDuration: { type: Number, enum: [15, 20, 30, 45, 60], default: 30 },
    availability: {
      type: [availabilitySchema],
      default: [
        { day: 'Mon', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Tue', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Wed', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Thu', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Fri', enabled: true, start: '09:00', end: '17:00' },
        { day: 'Sat', enabled: true, start: '09:00', end: '13:00' },
        { day: 'Sun', enabled: false, start: '09:00', end: '13:00' },
      ],
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

doctorSchema.index({ facility: 1, isActive: 1, name: 1 });

module.exports = mongoose.model('Doctor', doctorSchema);
