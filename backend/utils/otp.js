const bcrypt = require('bcryptjs');
const OTP = require('../models/OTP');

const generateNumericOTP = (length = 6) =>
  Array.from({ length }, () => Math.floor(Math.random() * 10)).join('');

const createOTP = async (mobile, purpose) => {
  const code = generateNumericOTP(6);
  const otpHash = await bcrypt.hash(code, 10);
  await OTP.deleteMany({ mobile, purpose, verified: false });
  await OTP.create({
    mobile,
    purpose,
    otpHash,
    expiresAt: new Date(Date.now() + 5 * 60 * 1000),
  });
  return code;
};

const verifyOTP = async (mobile, purpose, code) => {
  const record = await OTP.findOne({ mobile, purpose, verified: false }).sort({ createdAt: -1 });
  if (!record) return { ok: false, reason: 'OTP not found or expired' };
  if (record.expiresAt < new Date()) return { ok: false, reason: 'OTP expired' };
  if (record.attempts >= 5) return { ok: false, reason: 'Too many attempts' };

  const match = await bcrypt.compare(code, record.otpHash);
  record.attempts += 1;
  if (!match) {
    await record.save();
    return { ok: false, reason: 'Incorrect OTP' };
  }
  record.verified = true;
  await record.save();
  return { ok: true };
};

module.exports = { createOTP, verifyOTP, generateNumericOTP };
