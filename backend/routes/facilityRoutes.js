const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/facilityController');
const appointmentCtrl = require('../controllers/appointmentController');
const validate = require('../middleware/validate');
const { protectFacility } = require('../middleware/auth');
const { generalLimiter } = require('../middleware/rateLimiters');

// Facility owner (self-service) — registered BEFORE the generic :idOrSlug
// route so "/me/listing" is never swallowed as an id/slug lookup.
router.get('/me/listing', protectFacility, ctrl.getMyListing);
router.put('/me/listing', protectFacility, ctrl.updateMyListing);
router.post('/me/images', protectFacility, ctrl.uploadImage);
router.delete('/me/images/:publicId', protectFacility, ctrl.deleteImage);

// Appointment system — facility owner management
router.get('/me/doctors', protectFacility, appointmentCtrl.listFacilityDoctors);
router.post(
  '/me/doctors',
  protectFacility,
  [
    body('name').trim().notEmpty().withMessage('Doctor name is required.'),
    body('specialization').trim().notEmpty().withMessage('Specialization is required.'),
    body('consultationFee').optional().isFloat({ min: 0 }),
    body('slotDuration').optional().isIn([15, 20, 30, 45, 60]),
  ],
  validate,
  appointmentCtrl.createDoctor
);
router.put('/me/doctors/:id', protectFacility, appointmentCtrl.updateDoctor);
router.delete('/me/doctors/:id', protectFacility, appointmentCtrl.deleteDoctor);
router.get('/me/appointments', protectFacility, appointmentCtrl.listFacilityAppointments);
router.patch('/me/appointments/:id/status', protectFacility, appointmentCtrl.updateFacilityAppointmentStatus);

// Public appointment booking
router.get('/:facilityId/doctors', appointmentCtrl.listPublicDoctors);
router.get('/:facilityId/appointments/slots', appointmentCtrl.availableSlots);
router.post(
  '/:facilityId/appointments',
  generalLimiter,
  [
    body('doctorId').isMongoId().withMessage('Please select a doctor.'),
    body('patientName').trim().isLength({ min: 2, max: 100 }).withMessage('Enter the patient name.'),
    body('patientMobile').matches(/^(\+91)?[6-9][0-9]{9}$/).withMessage('Enter a valid Indian mobile number.'),
    body('patientEmail').optional({ checkFalsy: true }).isEmail().withMessage('Enter a valid email address.'),
    body('date').matches(/^\d{4}-\d{2}-\d{2}$/).withMessage('Select a valid date.'),
    body('time').matches(/^\d{2}:\d{2}$/).withMessage('Select a valid time slot.'),
    body('reason').optional().isLength({ max: 500 }),
  ],
  validate,
  appointmentCtrl.createAppointment
);

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
