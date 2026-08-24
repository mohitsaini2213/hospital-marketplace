/**
 * Securely resets an admin's password (typically the OWNER's) from the CLI.
 * Never exposed as an HTTP endpoint — must be run directly on the server
 * with access to the database, by someone who already has infra access.
 *
 * Usage:
 *   node scripts/reset-owner-password.js <email> <newPassword>
 *   (falls back to OWNER_EMAIL from .env if no email is passed)
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

const run = async () => {
  const [, , emailArg, passwordArg] = process.argv;
  const email = (emailArg || process.env.OWNER_EMAIL || '').toLowerCase();
  const newPassword = passwordArg;

  if (!email || !newPassword) {
    console.error('Usage: node scripts/reset-owner-password.js <email> <newPassword>');
    process.exit(1);
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!strongPassword.test(newPassword)) {
    console.error('New password must be 8+ chars with upper, lower, number and special character.');
    process.exit(1);
  }

  await connectDB();

  const admin = await Admin.findOne({ email });
  if (!admin) {
    console.error(`[reset-owner-password] No admin account found for ${email}`);
    await mongoose.disconnect();
    process.exit(1);
  }

  admin.passwordHash = await bcrypt.hash(newPassword, 12);
  admin.failedLoginAttempts = 0;
  admin.lockUntil = undefined;
  await admin.save();

  console.log(`[reset-owner-password] Password updated for ${admin.email} (role: ${admin.role}).`);
  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('[reset-owner-password] Failed:', err);
  process.exit(1);
});
