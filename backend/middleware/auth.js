const { verifyAccessToken } = require('../utils/jwt');
const { ApiError } = require('./errorHandler');
const Admin = require('../models/Admin');
const Facility = require('../models/Facility');

// Requires a valid facility (business owner) access token
const protectFacility = async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) throw new ApiError(401, 'Not authenticated.');

    const decoded = verifyAccessToken(token);
    if (decoded.type !== 'facility') throw new ApiError(401, 'Invalid session.');

    const facility = await Facility.findById(decoded.id);
    if (!facility) throw new ApiError(401, 'Account not found.');

    req.facility = facility;
    next();
  } catch (err) {
    next(err.statusCode ? err : new ApiError(401, 'Not authenticated.'));
  }
};

// Requires a valid admin access token. Role never trusted from frontend —
// always re-verified against the DB record here.
const protectAdmin = (...allowedRoles) => async (req, res, next) => {
  try {
    const header = req.headers.authorization || '';
    const token = header.startsWith('Bearer ') ? header.split(' ')[1] : null;
    if (!token) throw new ApiError(401, 'Not authenticated.');

    const decoded = verifyAccessToken(token);
    if (decoded.type !== 'admin') throw new ApiError(401, 'Invalid session.');

    const admin = await Admin.findById(decoded.id);
    if (!admin || !admin.isActive) throw new ApiError(401, 'Account not found or disabled.');

    if (allowedRoles.length && !allowedRoles.includes(admin.role)) {
      throw new ApiError(403, 'You do not have permission to perform this action.');
    }

    req.admin = admin;
    next();
  } catch (err) {
    next(err.statusCode ? err : new ApiError(401, 'Not authenticated.'));
  }
};

module.exports = { protectFacility, protectAdmin };
