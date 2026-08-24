const Facility = require('../models/Facility');
const WebsiteLead = require('../models/WebsiteLead');
const ActivityLog = require('../models/ActivityLog');
const Notification = require('../models/Notification');
const Review = require('../models/Review');
const FacilityCategory = require('../models/FacilityCategory');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/activityLogger');
const { sendEmail, templates } = require('../utils/email');

// GET /api/admin/dashboard/summary
const dashboardSummary = asyncHandler(async (req, res) => {
  const [
    total,
    pending,
    approved,
    rejected,
    suspended,
    byType,
    leadsCount,
    recentRegistrations,
    recentActivity,
  ] = await Promise.all([
    Facility.countDocuments(),
    Facility.countDocuments({ status: 'PENDING' }),
    Facility.countDocuments({ status: 'APPROVED' }),
    Facility.countDocuments({ status: 'REJECTED' }),
    Facility.countDocuments({ status: 'SUSPENDED' }),
    Facility.aggregate([{ $group: { _id: '$facilityType', count: { $sum: 1 } } }]),
    WebsiteLead.countDocuments({ status: { $ne: 'Closed' } }),
    Facility.find().sort({ createdAt: -1 }).limit(8).select('name facilityType status createdAt city'),
    ActivityLog.find().sort({ createdAt: -1 }).limit(15),
  ]);

  // Registrations over last 30 days for chart
  const thirtyDaysAgo = new Date(Date.now() - 30 * 24 * 60 * 60 * 1000);
  const trend = await Facility.aggregate([
    { $match: { createdAt: { $gte: thirtyDaysAgo } } },
    {
      $group: {
        _id: { $dateToString: { format: '%Y-%m-%d', date: '$createdAt' } },
        count: { $sum: 1 },
      },
    },
    { $sort: { _id: 1 } },
  ]);

  res.json({
    success: true,
    data: {
      totals: { total, pending, approved, rejected, suspended, leads: leadsCount },
      byType: byType.map((t) => ({ type: t._id, count: t.count })),
      trend: trend.map((t) => ({ date: t._id, count: t.count })),
      recentRegistrations,
      recentActivity,
    },
  });
});

// GET /api/admin/facilities
const listFacilitiesAdmin = asyncHandler(async (req, res) => {
  const { q, status, type, city, locality, wantsWebsite, from, to, page = 1, limit = 20, sort = 'newest' } = req.query;
  const filter = {};
  if (status) filter.status = status;
  if (type) filter.facilityType = type;
  if (city) filter.city = new RegExp(city, 'i');
  if (locality) filter.locality = new RegExp(locality, 'i');
  if (wantsWebsite) filter.wantsWebsite = wantsWebsite === 'true';
  if (from || to) {
    filter.createdAt = {};
    if (from) filter.createdAt.$gte = new Date(from);
    if (to) filter.createdAt.$lte = new Date(to);
  }
  if (q) {
    filter.$or = [
      { name: new RegExp(q, 'i') },
      { email: new RegExp(q, 'i') },
      { mobile1: new RegExp(q, 'i') },
    ];
  }

  const sortMap = { newest: { createdAt: -1 }, oldest: { createdAt: 1 }, name: { name: 1 } };
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const [items, total] = await Promise.all([
    Facility.find(filter).sort(sortMap[sort] || sortMap.newest).skip((pageNum - 1) * limitNum).limit(limitNum),
    Facility.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
});

const notifyFacilityUser = async (facility, type, title, message) => {
  await Notification.create({ recipientType: 'FACILITY', recipient: facility._id, title, message, type, relatedFacility: facility._id });
};

// PATCH /api/admin/facilities/:id/approve
const approveFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findById(req.params.id);
  if (!facility) throw new ApiError(404, 'Facility not found.');

  facility.status = 'APPROVED';
  facility.verified = true;
  facility.rejectionReason = undefined;
  await facility.save();

  await notifyFacilityUser(facility, 'REGISTRATION_APPROVED', 'Listing Approved', 'Your facility listing has been approved and is now live.');
  const tpl = templates.registrationApproved(facility.ownerName);
  sendEmail({ to: facility.email, ...tpl });

  await logActivity({ actorType: 'ADMIN', actor: req.admin._id, actorName: req.admin.name, action: 'APPROVE_FACILITY', targetType: 'Facility', target: facility._id, req });

  const io = req.app.get('io');
  if (io) io.to(`facility_${facility._id}`).emit('listing_status_changed', { status: 'APPROVED' });

  res.json({ success: true, message: 'Facility approved.', data: facility });
});

// PATCH /api/admin/facilities/:id/reject
const rejectFacility = asyncHandler(async (req, res) => {
  const { reason } = req.body;
  if (!reason) throw new ApiError(400, 'Rejection reason is required.');

  const facility = await Facility.findById(req.params.id);
  if (!facility) throw new ApiError(404, 'Facility not found.');

  facility.status = 'REJECTED';
  facility.verified = false;
  facility.rejectionReason = reason;
  await facility.save();

  await notifyFacilityUser(facility, 'REGISTRATION_REJECTED', 'Listing Rejected', reason);
  const tpl = templates.registrationRejected(facility.ownerName, reason);
  sendEmail({ to: facility.email, ...tpl });

  await logActivity({ actorType: 'ADMIN', actor: req.admin._id, actorName: req.admin.name, action: 'REJECT_FACILITY', targetType: 'Facility', target: facility._id, req, metadata: { reason } });

  res.json({ success: true, message: 'Facility rejected.', data: facility });
});

// PATCH /api/admin/facilities/:id/suspend
const suspendFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findById(req.params.id);
  if (!facility) throw new ApiError(404, 'Facility not found.');

  facility.status = 'SUSPENDED';
  await facility.save();

  await notifyFacilityUser(facility, 'LISTING_SUSPENDED', 'Listing Suspended', 'Your listing has been suspended. Contact support for details.');
  await logActivity({ actorType: 'ADMIN', actor: req.admin._id, actorName: req.admin.name, action: 'SUSPEND_FACILITY', targetType: 'Facility', target: facility._id, req });

  res.json({ success: true, message: 'Facility suspended.', data: facility });
});

// PUT /api/admin/facilities/:id
const updateFacilityAdmin = asyncHandler(async (req, res) => {
  const facility = await Facility.findById(req.params.id);
  if (!facility) throw new ApiError(404, 'Facility not found.');

  const allowed = [
    'name', 'ownerName', 'mobile1', 'mobile2', 'address', 'locality', 'city', 'state', 'pincode',
    'latitude', 'longitude', 'websiteUrl', 'wantsWebsite', 'description', 'services', 'openingHours',
    'featured', 'facilityType', 'customFacilityType',
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) facility[key] = req.body[key];
  });
  await facility.save();

  await logActivity({ actorType: 'ADMIN', actor: req.admin._id, actorName: req.admin.name, action: 'EDIT_FACILITY', targetType: 'Facility', target: facility._id, req });

  res.json({ success: true, message: 'Facility updated.', data: facility });
});

// DELETE /api/admin/facilities/:id
const deleteFacility = asyncHandler(async (req, res) => {
  const facility = await Facility.findByIdAndDelete(req.params.id);
  if (!facility) throw new ApiError(404, 'Facility not found.');

  await logActivity({ actorType: 'ADMIN', actor: req.admin._id, actorName: req.admin.name, action: 'DELETE_FACILITY', targetType: 'Facility', target: facility._id, req, metadata: { name: facility.name } });

  res.json({ success: true, message: 'Facility deleted.' });
});

// ---------- WEBSITE LEADS ----------

// GET /api/admin/website-leads
const listWebsiteLeads = asyncHandler(async (req, res) => {
  const { status, page = 1, limit = 20 } = req.query;
  const filter = {};
  if (status) filter.status = status;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const [items, total] = await Promise.all([
    WebsiteLead.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum).populate('facility', 'city'),
    WebsiteLead.countDocuments(filter),
  ]);

  res.json({ success: true, data: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
});

// PATCH /api/admin/website-leads/:id
const updateWebsiteLead = asyncHandler(async (req, res) => {
  const { status, notes } = req.body;
  const lead = await WebsiteLead.findById(req.params.id);
  if (!lead) throw new ApiError(404, 'Lead not found.');

  if (status) lead.status = status;
  if (notes !== undefined) lead.notes = notes;
  await lead.save();

  await logActivity({ actorType: 'ADMIN', actor: req.admin._id, actorName: req.admin.name, action: 'UPDATE_WEBSITE_LEAD', targetType: 'WebsiteLead', target: lead._id, req, metadata: { status } });

  res.json({ success: true, data: lead });
});

// ---------- ACTIVITY LOGS ----------

const listActivity = asyncHandler(async (req, res) => {
  const { page = 1, limit = 30, action } = req.query;
  const filter = {};
  if (action) filter.action = action;
  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(100, Math.max(1, parseInt(limit)));

  const [items, total] = await Promise.all([
    ActivityLog.find(filter).sort({ createdAt: -1 }).skip((pageNum - 1) * limitNum).limit(limitNum),
    ActivityLog.countDocuments(filter),
  ]);
  res.json({ success: true, data: items, pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) } });
});

// ---------- CATEGORIES ----------

const createCategory = asyncHandler(async (req, res) => {
  const category = await FacilityCategory.create(req.body);
  res.status(201).json({ success: true, data: category });
});

const updateCategory = asyncHandler(async (req, res) => {
  const category = await FacilityCategory.findByIdAndUpdate(req.params.id, req.body, { new: true });
  if (!category) throw new ApiError(404, 'Category not found.');
  res.json({ success: true, data: category });
});

const deleteCategory = asyncHandler(async (req, res) => {
  await FacilityCategory.findByIdAndDelete(req.params.id);
  res.json({ success: true, message: 'Category deleted.' });
});

// ---------- REVIEWS MODERATION ----------

const listReviewsAdmin = asyncHandler(async (req, res) => {
  const { status = 'PENDING' } = req.query;
  const reviews = await Review.find({ status }).sort({ createdAt: -1 }).populate('facility', 'name');
  res.json({ success: true, data: reviews });
});

const moderateReview = asyncHandler(async (req, res) => {
  const { status } = req.body; // APPROVED | REJECTED | SPAM
  const review = await Review.findById(req.params.id);
  if (!review) throw new ApiError(404, 'Review not found.');
  review.status = status;
  await review.save();

  if (status === 'APPROVED') {
    const stats = await Review.aggregate([
      { $match: { facility: review.facility, status: 'APPROVED' } },
      { $group: { _id: null, avg: { $avg: '$rating' }, count: { $sum: 1 } } },
    ]);
    if (stats[0]) {
      await Facility.findByIdAndUpdate(review.facility, {
        ratingAverage: Math.round(stats[0].avg * 10) / 10,
        ratingCount: stats[0].count,
      });
    }
  }

  res.json({ success: true, data: review });
});

// ---------- ADMIN USERS (OWNER only) ----------
const Admin = require('../models/Admin');
const bcrypt = require('bcryptjs');

const listAdmins = asyncHandler(async (req, res) => {
  const admins = await Admin.find().sort({ createdAt: -1 });
  res.json({ success: true, data: admins });
});

const createAdmin = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const existing = await Admin.findOne({ email });
  if (existing) throw new ApiError(409, 'An account with this email already exists.');
  const passwordHash = await bcrypt.hash(password, 12);
  const admin = await Admin.create({ name, email, passwordHash, role: role || 'MODERATOR' });
  await logActivity({ actorType: 'ADMIN', actor: req.admin._id, actorName: req.admin.name, action: 'CREATE_ADMIN', targetType: 'Admin', target: admin._id, req });
  res.status(201).json({ success: true, data: { id: admin._id, name: admin.name, email: admin.email, role: admin.role } });
});

const updateAdminStatus = asyncHandler(async (req, res) => {
  const { isActive, role } = req.body;
  const admin = await Admin.findById(req.params.id);
  if (!admin) throw new ApiError(404, 'Admin not found.');
  if (isActive !== undefined) admin.isActive = isActive;
  if (role) admin.role = role;
  await admin.save();
  res.json({ success: true, data: admin });
});

module.exports = {
  dashboardSummary,
  listFacilitiesAdmin,
  approveFacility,
  rejectFacility,
  suspendFacility,
  updateFacilityAdmin,
  deleteFacility,
  listWebsiteLeads,
  updateWebsiteLead,
  listActivity,
  createCategory,
  updateCategory,
  deleteCategory,
  listReviewsAdmin,
  moderateReview,
  listAdmins,
  createAdmin,
  updateAdminStatus,
};
