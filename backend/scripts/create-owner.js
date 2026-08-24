/**
 * Creates the first OWNER account from environment variables.
 * There is intentionally NO public admin registration endpoint —
 * this script is the only way to bootstrap the first admin.
 *
 * Usage:  npm run create-owner
 * Requires OWNER_NAME, OWNER_EMAIL, OWNER_PASSWORD in .env
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Admin = require('../models/Admin');

const run = async () => {
  const { OWNER_NAME, OWNER_EMAIL, OWNER_PASSWORD } = process.env;

  if (!OWNER_NAME || !OWNER_EMAIL || !OWNER_PASSWORD) {
    console.error('[create-owner] Missing OWNER_NAME / OWNER_EMAIL / OWNER_PASSWORD in .env');
    process.exit(1);
  }

  const strongPassword = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[^A-Za-z0-9]).{8,}$/;
  if (!strongPassword.test(OWNER_PASSWORD)) {
    console.error(
      '[create-owner] OWNER_PASSWORD must be 8+ chars with upper, lower, number and special character.'
    );
    process.exit(1);
  }

  await connectDB();

  const existing = await Admin.findOne({ email: OWNER_EMAIL.toLowerCase() });
  if (existing) {
    console.log(`[create-owner] An account with email ${OWNER_EMAIL} already exists (role: ${existing.role}). Nothing to do.`);
    await mongoose.disconnect();
    return;
  }

  const passwordHash = await bcrypt.hash(OWNER_PASSWORD, 12);
  const owner = await Admin.create({
    name: OWNER_NAME,
    email: OWNER_EMAIL.toLowerCase(),
    passwordHash,
    role: 'OWNER',
    isActive: true,
  });

  console.log(`[create-owner] OWNER account created successfully: ${owner.email}`);
  console.log('[create-owner] You can now log in at /admin/login. Change the password after first login.');

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('[create-owner] Failed:', err);
  process.exit(1);
});
