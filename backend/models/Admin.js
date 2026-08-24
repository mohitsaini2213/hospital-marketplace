const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const ROLES = ['OWNER', 'ADMIN', 'MODERATOR'];

const adminSchema = new mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },
    role: { type: String, enum: ROLES, default: 'ADMIN' },
    isActive: { type: Boolean, default: true },
    lastLoginAt: { type: Date },
    failedLoginAttempts: { type: Number, default: 0 },
    lockUntil: { type: Date },
  },
  { timestamps: true }
);

adminSchema.methods.comparePassword = function (candidate) {
  return bcrypt.compare(candidate, this.passwordHash);
};

adminSchema.methods.isLocked = function () {
  return !!(this.lockUntil && this.lockUntil > Date.now());
};

adminSchema.statics.ROLES = ROLES;

module.exports = mongoose.model('Admin', adminSchema);
