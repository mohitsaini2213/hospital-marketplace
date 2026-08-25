const express = require('express');
const { body } = require('express-validator');
const router = express.Router();
const ctrl = require('../controllers/adminController');
const validate = require('../middleware/validate');
const { protectAdmin } = require('../middleware/auth');

// Every route below requires a valid admin session.
// Role is always re-verified server-side (see middleware/auth.js) — the
// frontend's claimed role is never trusted.
router.use(protectAdmin());

router.get('/dashboard/summary', ctrl.dashboardSummary);

router.get('/facilities', ctrl.listFacilitiesAdmin);
router.put('/facilities/:id', ctrl.updateFacilityAdmin);
router.patch('/facilities/:id/approve', protectAdmin('OWNER', 'ADMIN', 'MODERATOR'), ctrl.approveFacility);
router.patch(
  '/facilities/:id/reject',
  protectAdmin('OWNER', 'ADMIN', 'MODERATOR'),
  [body('reason').trim().notEmpty().withMessage('Rejection reason is required.')],
  validate,
  ctrl.rejectFacility
);
router.patch('/facilities/:id/suspend', protectAdmin('OWNER', 'ADMIN'), ctrl.suspendFacility);
router.delete('/facilities/:id', protectAdmin('OWNER', 'ADMIN'), ctrl.deleteFacility);

router.get('/website-leads', ctrl.listWebsiteLeads);
router.patch('/website-leads/:id', ctrl.updateWebsiteLead);

router.get('/activity', ctrl.listActivity);

router.get('/appointments', ctrl.listAppointmentsAdmin);
router.patch('/appointments/:id/status', ctrl.updateAppointmentAdmin);

// Categories — OWNER/ADMIN only
router.post('/categories', protectAdmin('OWNER', 'ADMIN'), ctrl.createCategory);
router.put('/categories/:id', protectAdmin('OWNER', 'ADMIN'), ctrl.updateCategory);
router.delete('/categories/:id', protectAdmin('OWNER', 'ADMIN'), ctrl.deleteCategory);

// Review moderation
router.get('/reviews', ctrl.listReviewsAdmin);
router.patch('/reviews/:id', ctrl.moderateReview);

// Admin/staff user management — OWNER only
router.get('/admins', protectAdmin('OWNER'), ctrl.listAdmins);
router.post(
  '/admins',
  protectAdmin('OWNER'),
  [
    body('name').trim().notEmpty(),
    body('email').isEmail().normalizeEmail(),
    body('password').isLength({ min: 8 }),
    body('role').optional().isIn(['OWNER', 'ADMIN', 'MODERATOR']),
  ],
  validate,
  ctrl.createAdmin
);
router.patch('/admins/:id', protectAdmin('OWNER'), ctrl.updateAdminStatus);

module.exports = router;
