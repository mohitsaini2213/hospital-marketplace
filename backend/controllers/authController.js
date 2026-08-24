const bcrypt = require('bcryptjs');
const crypto = require('crypto');
const Facility = require('../models/Facility');
const Admin = require('../models/Admin');
const WebsiteLead = require('../models/WebsiteLead');
const Notification = require('../models/Notification');
const PasswordResetToken = require('../models/PasswordResetToken');
const { ApiError } = require('../middleware/errorHandler');
const asyncHandler = require('../middleware/asyncHandler');
const { logActivity } = require('../utils/activityLogger');
const { sendEmail, templates } = require('../utils/email');
const {
  signAccessToken,
  signRefreshToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
} = require('../utils/jwt');

const issueTokens = (res, id, type) => {
  const accessToken = signAccessToken({ id, type });
  const refreshToken = signRefreshToken({ id, type });
  res.cookie(REFRESH_COOKIE_NAME, refreshToken, refreshCookieOptions());
  return accessToken;
};

// ---------- FACILITY (business owner) AUTH ----------

// POST /api/auth/register
const registerFacility = asyncHandler(async (req, res) => {
  const {
    facilityType,
    customFacilityType,
    name,
    ownerName,
    email,
    password,
    mobile1,
    mobile2,
    address,
    locality,
    city,
    state,
    pincode,
    latitude,
    longitude,
    websiteUrl,
    wantsWebsite,
    description,
    services,
  } = req.body;

  const existing = await Facility.findOne({ $or: [{ email }, { mobile1 }] });
  if (existing) {
    throw new ApiError(409, 'An account with this email already exists.');
  }

  const passwordHash = await bcrypt.hash(password, 12);

  const facility = await Facility.create({
    facilityType,
    customFacilityType: facilityType === 'Other' ? customFacilityType : undefined,
    name,
    ownerName,
    email,
    passwordHash,
    mobile1,
    mobile2,
    address,
    locality,
    city: city || 'Alwar',
    state: state || 'Rajasthan',
    pincode,
    latitude,
    longitude,
    websiteUrl: wantsWebsite ? undefined : websiteUrl,
    wantsWebsite: !!wantsWebsite,
    description,
    services: services || [],
    status: 'PENDING',
  });

  if (facility.wantsWebsite) {
    await WebsiteLead.create({
      facility: facility._id,
      facilityName: facility.name,
      ownerName: facility.ownerName,
      email: facility.email,
      mobile1: facility.mobile1,
      facilityType: facility.facilityType,
      city: facility.city,
    });
  }

  await Notification.create({
    recipientType: 'ADMIN',
    title: 'New Registration',
    message: `${facility.name} registered as a ${facility.facilityType}.`,
    type: 'NEW_REGISTRATION',
    relatedFacility: facility._id,
  });

  const io = req.app.get('io');
  if (io) io.to('admins').emit('new_registration', { facilityId: facility._id, name: facility.name });

  const tpl = templates.registrationReceived(facility.ownerName);
  sendEmail({ to: facility.email, ...tpl });

  await logActivity({
    actorType: 'FACILITY',
    actor: facility._id,
    actorName: facility.name,
    action: 'REGISTER',
    targetType: 'Facility',
    target: facility._id,
    req,
  });

  res.status(201).json({
    success: true,
    message: 'Registration submitted successfully. Your listing is under verification.',
    data: { id: facility._id, status: facility.status },
  });
});

// POST /api/auth/login
const loginFacility = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const facility = await Facility.findOne({ email }).select('+passwordHash');
  if (!facility) throw new ApiError(401, 'Invalid email or password.');

  const match = await bcrypt.compare(password, facility.passwordHash);
  if (!match) throw new ApiError(401, 'Invalid email or password.');

  facility.lastLoginAt = new Date();
  await facility.save();

  const accessToken = issueTokens(res, facility._id, 'facility');

  await logActivity({
    actorType: 'FACILITY',
    actor: facility._id,
    actorName: facility.name,
    action: 'LOGIN',
    req,
  });

  res.json({
    success: true,
    accessToken,
    data: facility.toPublicJSON(),
  });
});

// ---------- ADMIN AUTH ----------

// POST /api/auth/admin/login
const loginAdmin = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const admin = await Admin.findOne({ email }).select('+passwordHash');
  if (!admin) throw new ApiError(401, 'Invalid credentials.');

  if (admin.isLocked()) {
    throw new ApiError(423, 'Account temporarily locked due to multiple failed attempts. Try again later.');
  }

  const match = await admin.comparePassword(password);
  if (!match) {
    admin.failedLoginAttempts += 1;
    if (admin.failedLoginAttempts >= 5) {
      admin.lockUntil = new Date(Date.now() + 15 * 60 * 1000);
      admin.failedLoginAttempts = 0;
    }
    await admin.save();
    throw new ApiError(401, 'Invalid credentials.');
  }

  admin.failedLoginAttempts = 0;
  admin.lockUntil = undefined;
  admin.lastLoginAt = new Date();
  await admin.save();

  const accessToken = issueTokens(res, admin._id, 'admin');

  await logActivity({ actorType: 'ADMIN', actor: admin._id, actorName: admin.name, action: 'LOGIN', req });

  res.json({
    success: true,
    accessToken,
    data: { id: admin._id, name: admin.name, email: admin.email, role: admin.role },
  });
});

// ---------- SHARED ----------

// POST /api/auth/refresh
const refresh = asyncHandler(async (req, res) => {
  const token = req.cookies[REFRESH_COOKIE_NAME];
  if (!token) throw new ApiError(401, 'No refresh token provided.');

  let decoded;
  try {
    decoded = verifyRefreshToken(token);
  } catch {
    throw new ApiError(401, 'Session expired. Please log in again.');
  }

  const Model = decoded.type === 'admin' ? Admin : Facility;
  const account = await Model.findById(decoded.id);
  if (!account) throw new ApiError(401, 'Account not found.');

  const accessToken = issueTokens(res, account._id, decoded.type);
  res.json({ success: true, accessToken });
});

// POST /api/auth/logout
const logout = asyncHandler(async (req, res) => {
  res.clearCookie(REFRESH_COOKIE_NAME, { path: '/api/auth' });
  res.json({ success: true, message: 'Logged out successfully.' });
});

// GET /api/auth/me
const getMe = asyncHandler(async (req, res) => {
  if (req.facility) return res.json({ success: true, data: req.facility.toPublicJSON(), type: 'facility' });
  if (req.admin)
    return res.json({
      success: true,
      data: { id: req.admin._id, name: req.admin.name, email: req.admin.email, role: req.admin.role },
      type: 'admin',
    });
  throw new ApiError(401, 'Not authenticated.');
});

// POST /api/auth/forgot-password
const forgotPassword = asyncHandler(async (req, res) => {
  const { email, accountType } = req.body; // accountType: 'FACILITY' | 'ADMIN'
  const Model = accountType === 'ADMIN' ? Admin : Facility;
  const account = await Model.findOne({ email });

  // Always respond the same way to avoid leaking which emails are registered
  const genericMsg = 'If an account with that email exists, a reset link has been sent.';
  if (!account) return res.json({ success: true, message: genericMsg });

  const rawToken = crypto.randomBytes(32).toString('hex');
  const tokenHash = crypto.createHash('sha256').update(rawToken).digest('hex');

  await PasswordResetToken.create({
    accountType: accountType === 'ADMIN' ? 'ADMIN' : 'FACILITY',
    account: account._id,
    tokenHash,
    expiresAt: new Date(Date.now() + 30 * 60 * 1000),
  });

  const link = `${process.env.CLIENT_URL}/reset-password/${rawToken}?type=${accountType === 'ADMIN' ? 'ADMIN' : 'FACILITY'}`;
  const tpl = templates.passwordReset(link);
  sendEmail({ to: account.email, ...tpl });

  res.json({ success: true, message: genericMsg });
});

// POST /api/auth/reset-password
const resetPassword = asyncHandler(async (req, res) => {
  const { token, accountType, password } = req.body;
  const tokenHash = crypto.createHash('sha256').update(token).digest('hex');

  const resetRecord = await PasswordResetToken.findOne({
    tokenHash,
    accountType: accountType === 'ADMIN' ? 'ADMIN' : 'FACILITY',
    used: false,
    expiresAt: { $gt: new Date() },
  });
  if (!resetRecord) throw new ApiError(400, 'This reset link is invalid or has expired.');

  const Model = resetRecord.accountType === 'ADMIN' ? Admin : Facility;
  const account = await Model.findById(resetRecord.account);
  if (!account) throw new ApiError(400, 'Account not found.');

  account.passwordHash = await bcrypt.hash(password, 12);
  await account.save();

  resetRecord.used = true;
  await resetRecord.save();

  res.json({ success: true, message: 'Password updated successfully. You can now log in.' });
});

// PATCH /api/auth/change-password  (facility or admin, authenticated)
const changePassword = asyncHandler(async (req, res) => {
  const { currentPassword, newPassword } = req.body;

  const account = req.facility || req.admin;
  if (!account) throw new ApiError(401, 'Not authenticated.');

  const Model = req.admin ? Admin : Facility;
  const withHash = await Model.findById(account._id).select('+passwordHash');

  const match = req.admin ? await withHash.comparePassword(currentPassword) : await bcrypt.compare(currentPassword, withHash.passwordHash);
  if (!match) throw new ApiError(401, 'Current password is incorrect.');

  withHash.passwordHash = await bcrypt.hash(newPassword, 12);
  await withHash.save();

  await logActivity({
    actorType: req.admin ? 'ADMIN' : 'FACILITY',
    actor: account._id,
    actorName: req.admin ? req.admin.name : req.facility.name,
    action: 'PASSWORD_CHANGE',
    req,
  });

  res.json({ success: true, message: 'Password updated successfully.' });
});

module.exports = {
  registerFacility,
  loginFacility,
  loginAdmin,
  refresh,
  logout,
  getMe,
  forgotPassword,
  resetPassword,
  changePassword,
};
