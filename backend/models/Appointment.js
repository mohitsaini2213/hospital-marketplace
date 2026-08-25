const mongoose = require('mongoose');
const crypto = require('crypto');

const STATUS = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];

const appointmentSchema = new mongoose.Schema(
  {
    bookingRef: {
      type: String,
      unique: true,
      index: true,
      default: () => `HM-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`,
    },
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true, index: true },
    doctor: { type: mongoose.Schema.Types.ObjectId, ref: 'Doctor', required: true, index: true },

    patientName: { type: String, required: true, trim: true },
    patientMobile: { type: String, required: true, trim: true },
    patientEmail: { type: String, lowercase: true, trim: true },
    reason: { type: String, trim: true, maxlength: 500 },

    date: { type: String, required: true }, // YYYY-MM-DD, interpreted in facility local time.
    time: { type: String, required: true }, // HH:mm, interpreted in facility local time.

    status: { type: String, enum: STATUS, default: 'PENDING', index: true },
    notes: { type: String, trim: true, maxlength: 1000 },
  },
  { timestamps: true }
);

appointmentSchema.index({ doctor: 1, date: 1, time: 1, status: 1 });
appointmentSchema.index({ facility: 1, date: 1, status: 1 });
appointmentSchema.statics.STATUS = STATUS;

module.exports = mongoose.model('Appointment', appointmentSchema);
