const mongoose = require('mongoose');

const otpSchema = new mongoose.Schema(
  {
    mobile: { type: String, required: true, index: true },
    purpose: { type: String, enum: ['MOBILE_VERIFICATION', 'LOGIN', 'PASSWORD_RESET'], required: true },
    otpHash: { type: String, required: true },
    attempts: { type: Number, default: 0 },
    verified: { type: Boolean, default: false },
    expiresAt: { type: Date, required: true },
  },
  { timestamps: true }
);

otpSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('OTP', otpSchema);
