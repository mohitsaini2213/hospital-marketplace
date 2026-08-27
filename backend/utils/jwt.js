const jwt = require('jsonwebtoken');

const signAccessToken = (payload) =>
  jwt.sign(
    payload,
    process.env.JWT_SECRET,
    {
      expiresIn:
        process.env.JWT_EXPIRES_IN || '15m',
    }
  );

const signRefreshToken = (payload) =>
  jwt.sign(
    payload,
    process.env.JWT_REFRESH_SECRET,
    {
      expiresIn:
        process.env.JWT_REFRESH_EXPIRES_IN || '30d',
    }
  );

const verifyAccessToken = (token) =>
  jwt.verify(
    token,
    process.env.JWT_SECRET
  );

const verifyRefreshToken = (token) =>
  jwt.verify(
    token,
    process.env.JWT_REFRESH_SECRET
  );

// Name of the HTTP-only refresh token cookie
const REFRESH_COOKIE_NAME =
  'hm_refresh_token';

// Cookie options for Vercel frontend + Render backend
const refreshCookieOptions = () => ({
  httpOnly: true,

  // Render runs over HTTPS in production
  secure:
    process.env.NODE_ENV === 'production',

  // Required for cross-site Vercel -> Render requests
  sameSite:
    process.env.NODE_ENV === 'production'
      ? 'none'
      : 'lax',

  // Refresh endpoint is /api/auth/refresh
  path: '/api/auth',

  // 30 days
  maxAge:
    30 * 24 * 60 * 60 * 1000,
});

module.exports = {
  signAccessToken,
  signRefreshToken,
  verifyAccessToken,
  verifyRefreshToken,
  REFRESH_COOKIE_NAME,
  refreshCookieOptions,
};
