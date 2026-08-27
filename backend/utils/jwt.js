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

// Name of the HTTP-only refresh token cookie
const REFRESH_COOKIE_NAME = 'hm_refresh_token';

// Cookie options used when creating the refresh-token cookie.
// These options must match the cookie being cleared during logout.
const refreshCookieOptions = () => ({
  httpOnly: true,

  // Render backend runs over HTTPS in production.
  secure: process.env.NODE_ENV === 'production',

  // Required for Vercel frontend -> Render backend.
  sameSite:
    process.env.NODE_ENV === 'production'
      ? 'none'
      : 'lax',

  // Cookie is only available to authentication endpoints.
  path: '/api/auth',

  // Refresh token lifetime: 30 days.
  maxAge: 30 * 24 * 60 * 60 * 1000,
});

// Separate options specifically for clearing the cookie.
// Do NOT include maxAge here. The important thing is that
// path/security/sameSite match the cookie that was originally created.
const clearRefreshCookieOptions = () => ({
  httpOnly: true,

  secure: process.env.NODE_ENV === 'production',

  sameSite:
    process.env.NODE_ENV === 'production'
      ? 'none'
      : 'lax',

  path: '/api/auth',
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
