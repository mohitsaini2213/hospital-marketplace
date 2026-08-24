const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/facilityController');
const validate = require('../middleware/validate');
const { protectFacility } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiters');

// Facility owner (self-service) — registered BEFORE the generic :idOrSlug
// route so "/me/listing" is never swallowed as an id/slug lookup.
router.get('/me/listing', protectFacility, ctrl.getMyListing);
router.put('/me/listing', protectFacility, ctrl.updateMyListing);
router.post('/me/images', protectFacility, ctrl.uploadImage);
router.delete('/me/images/:publicId', protectFacility, ctrl.deleteImage);

// Public
router.get('/', ctrl.listFacilities);
router.post(
  '/:id/reviews',
  generalLimiter,
  [
    body('reviewerName').trim().notEmpty().withMessage('Name is required.'),
    body('rating').isInt({ min: 1, max: 5 }).withMessage('Rating must be 1-5.'),
    body('review').optional().isLength({ max: 1000 }),
  ],
  validate,
  ctrl.submitReview
);
router.post(
  '/:id/report',
  generalLimiter,
  [body('reason').trim().notEmpty().withMessage('Please tell us what is incorrect.')],
  validate,
  ctrl.reportFacility
);
router.get('/:idOrSlug', ctrl.getFacility);

module.exports = router;
