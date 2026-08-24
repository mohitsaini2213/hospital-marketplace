const mongoose = require('mongoose');

// Thin reference model kept for future multi-user-per-facility support.
// Today, the Facility document itself holds auth credentials for the
// FACILITY_USER role (see Facility.passwordHash). This model lets the
// architecture grow to support staff accounts under one facility later.
const userSchema = new mongoose.Schema(
  {
    facility: { type: mongoose.Schema.Types.ObjectId, ref: 'Facility', required: true },
    name: { type: String, required: true },
    email: { type: String, required: true, lowercase: true },
    role: { type: String, enum: ['FACILITY_USER'], default: 'FACILITY_USER' },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

module.exports = mongoose.model('User', userSchema);
