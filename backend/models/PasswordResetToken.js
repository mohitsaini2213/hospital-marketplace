const mongoose = require('mongoose');

const passwordResetTokenSchema = new mongoose.Schema(
  {
    accountType: { type: String, enum: ['FACILITY', 'ADMIN'], required: true },
    account: { type: mongoose.Schema.Types.ObjectId, refPath: 'accountType', required: true },
    tokenHash: { type: String, required: true },
    expiresAt: { type: Date, required: true },
    used: { type: Boolean, default: false },
  },
  { timestamps: true }
);

passwordResetTokenSchema.index({ expiresAt: 1 }, { expireAfterSeconds: 0 });

module.exports = mongoose.model('PasswordResetToken', passwordResetTokenSchema);
