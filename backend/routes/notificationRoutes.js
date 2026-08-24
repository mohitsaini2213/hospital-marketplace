const express = require('express');
const router = express.Router();
const asyncHandler = require('../middleware/asyncHandler');
const Notification = require('../models/Notification');
const { protectFacility, protectAdmin } = require('../middleware/auth');

// GET /api/notifications  — returns notifications for the logged-in party.
// Requires EITHER a facility session or an admin session (checked manually
// so one endpoint can serve both dashboards without duplicating logic).
const identify = async (req, res, next) => {
  const header = req.headers.authorization || '';
  if (!header) return res.status(401).json({ success: false, message: 'Not authenticated.' });
  protectFacility(req, res, (err) => {
    if (!err) return next();
    protectAdmin()(req, res, (err2) => {
      if (!err2) return next();
      res.status(401).json({ success: false, message: 'Not authenticated.' });
    });
  });
};

router.get(
  '/',
  identify,
  asyncHandler(async (req, res) => {
    const filter = req.admin
      ? { recipientType: 'ADMIN' }
      : { recipientType: 'FACILITY', recipient: req.facility._id };

    const [items, unreadCount] = await Promise.all([
      Notification.find(filter).sort({ createdAt: -1 }).limit(50),
      Notification.countDocuments({ ...filter, isRead: false }),
    ]);

    res.json({ success: true, data: items, unreadCount });
  })
);

router.patch(
  '/:id/read',
  identify,
  asyncHandler(async (req, res) => {
    const filter = req.admin
      ? { _id: req.params.id, recipientType: 'ADMIN' }
      : { _id: req.params.id, recipientType: 'FACILITY', recipient: req.facility._id };
    await Notification.findOneAndUpdate(filter, { isRead: true });
    res.json({ success: true });
  })
);

router.patch(
  '/read-all',
  identify,
  asyncHandler(async (req, res) => {
    const filter = req.admin
      ? { recipientType: 'ADMIN', isRead: false }
      : { recipientType: 'FACILITY', recipient: req.facility._id, isRead: false };
    await Notification.updateMany(filter, { isRead: true });
    res.json({ success: true });
  })
);

module.exports = router;
