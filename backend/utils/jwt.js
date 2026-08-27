const jwt = require('jsonwebtoken');

const signAccessToken = (payload) =>
  jwt.sign(payload, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN || '15m',
  });

const signRefreshToken = (payload) =>
  jwt.sign(payload, process.env.JWT_REFRESH_SECRET, {
    expiresIn: process.env.JWT_REFRESH_EXPIRES_IN || '30d',
  });

const verifyAccessToken = (token) =>
  jwt.verify(token, process.env.JWT_SECRET);

const verifyRefreshToken = (token) =>
  jwt.verify(token, process.env.JWT_REFRESH_SECRET);

const REFRESH_COOKIE_NAME = 'hm_refresh_token';

/*
 * IMPORTANT:
 * The cookie options used here must stay identical to the
 * options used when clearing the cookie during logout.
 */

const refreshCookieOptions = () => ({
  httpOnly: true,

  secure: process.env.NODE_ENV === 'production',

  sameSite:
    process.env.NODE_ENV === 'production'
      ? 'none'
      : 'lax',

  path: '/api/auth',

  maxAge: 30 * 24 * 60 * 60 * 1000,
});

const clearRefreshCookieOptions = () => ({
  httpOnly: true,

  secure: process.env.NODE_ENV === 'production',

  sameSite:
    process.env.NODE_ENV === 'production'
      ? 'none'
      : 'lax',

  path: '/api/auth',

  // Explicitly expire the cookie immediately.
  maxAge: 0,

  expires: new Date(0),
});

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
  clearRefreshCookieOptions,
};
