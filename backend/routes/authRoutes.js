const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/authController');
const validate = require('../middleware/validate');
const { authLimiter } = require('../middleware/rateLimiters');
const { protectFacility, protectAdmin } = require('../middleware/auth');
const Facility = require('../models/Facility');

const passwordRule = body('password')
  .isLength({ min: 8 })
  .withMessage('Password must be at least 8 characters.')
  .matches(/[A-Z]/)
  .withMessage('Password must contain an uppercase letter.')
  .matches(/[a-z]/)
  .withMessage('Password must contain a lowercase letter.')
  .matches(/[0-9]/)
  .withMessage('Password must contain a number.')
  .matches(/[^A-Za-z0-9]/)
  .withMessage('Password must contain a special character.');

const indianMobile = (field) =>
  body(field)
    .matches(/^(\+91)?[6-9][0-9]{9}$/)
    .withMessage('Enter a valid Indian mobile number (e.g. +91XXXXXXXXXX).');

router.post(
  '/register',
  authLimiter,
  [
    body('facilityType').isIn(Facility.FACILITY_TYPES).withMessage('Select a valid facility type.'),
    body('name').trim().notEmpty().withMessage('Facility name is required.'),
    body('ownerName').trim().notEmpty().withMessage('Owner/contact person name is required.'),
    body('email').isEmail().withMessage('Enter a valid email.').normalizeEmail(),
    passwordRule,
    body('confirmPassword').custom((val, { req }) => val === req.body.password).withMessage('Passwords do not match.'),
    indianMobile('mobile1'),
    body('mobile2')
      .optional({ checkFalsy: true })
      .matches(/^(\+91)?[6-9][0-9]{9}$/)
      .withMessage('Enter a valid Indian mobile number.'),
    body('address').trim().notEmpty().withMessage('Address is required.'),
    body('pincode').matches(/^[1-9][0-9]{5}$/).withMessage('Enter a valid 6-digit pincode.'),
    body('latitude').isFloat({ min: -90, max: 90 }).withMessage('Select a location on the map.'),
    body('longitude').isFloat({ min: -180, max: 180 }).withMessage('Select a location on the map.'),
    body('wantsWebsite').isBoolean().withMessage('Website preference is required.'),
    body('websiteUrl')
      .if(body('wantsWebsite').equals('false'))
      .optional({ checkFalsy: true })
      .isURL()
      .withMessage('Enter a valid website URL.'),
    body('agreeTerms').equals('true').withMessage('You must accept the Terms & Conditions.'),
  ],
  validate,
  ctrl.registerFacility
);

router.post(
  '/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  ctrl.loginFacility
);

router.post(
  '/admin/login',
  authLimiter,
  [body('email').isEmail().normalizeEmail(), body('password').notEmpty()],
  validate,
  ctrl.loginAdmin
);

router.post('/refresh', ctrl.refresh);
router.post('/logout', ctrl.logout);

router.get('/me', (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header) return next(); // will fail via getMe
  // Try facility first, then admin — getMe checks req.facility/req.admin
  protectFacility(req, res, (err) => {
    if (!err) return ctrl.getMe(req, res, next);
    protectAdmin()(req, res, (err2) => {
      if (!err2) return ctrl.getMe(req, res, next);
      next(err2);
    });
  });
});

router.post(
  '/forgot-password',
  authLimiter,
  [body('email').isEmail().normalizeEmail()],
  validate,
  ctrl.forgotPassword
);

router.post(
  '/reset-password',
  authLimiter,
  [body('token').notEmpty(), passwordRule],
  validate,
  ctrl.resetPassword
);

// Authenticated password change (facility or admin) — identifies caller the
// same way GET /me does, since either session type may call this.
router.patch(
  '/change-password',
  authLimiter,
  [
    body('currentPassword').notEmpty().withMessage('Current password is required.'),
    body('newPassword')
      .isLength({ min: 8 })
      .matches(/[A-Z]/)
      .matches(/[a-z]/)
      .matches(/[0-9]/)
      .matches(/[^A-Za-z0-9]/)
      .withMessage('New password must be 8+ characters with upper, lower, number and special character.'),
  ],
  validate,
  (req, res, next) => {
    protectFacility(req, res, (err) => {
      if (!err) return ctrl.changePassword(req, res, next);
      protectAdmin()(req, res, (err2) => {
        if (!err2) return ctrl.changePassword(req, res, next);
        next(err2);
      });
    });
  }
);

module.exports = router;
