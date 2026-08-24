const Facility = require('../models/Facility');
const FacilityCategory = require('../models/FacilityCategory');
const Review = require('../models/Review');
const cloudinary = require('../config/cloudinary');
const asyncHandler = require('../middleware/asyncHandler');
const { ApiError } = require('../middleware/errorHandler');
const { logActivity } = require('../utils/activityLogger');

const haversineKm = (lat1, lon1, lat2, lon2) => {
  const R = 6371;
  const dLat = ((lat2 - lat1) * Math.PI) / 180;
  const dLon = ((lon2 - lon1) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((lat1 * Math.PI) / 180) * Math.cos((lat2 * Math.PI) / 180) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
};

// GET /api/facilities  (public directory — only APPROVED)
const listFacilities = asyncHandler(async (req, res) => {
  const {
    q,
    type,
    city,
    locality,
    lat,
    lng,
    radiusKm,
    sort = 'relevance',
    page = 1,
    limit = 12,
    featured,
  } = req.query;

  const filter = { status: 'APPROVED' };
  if (type) filter.facilityType = type;
  if (city) filter.city = new RegExp(`^${city}$`, 'i');
  if (locality) filter.locality = new RegExp(locality, 'i');
  if (featured === 'true') filter.featured = true;
  if (q) filter.$text = { $search: q };

  let query = Facility.find(filter).select('-passwordHash');

  if (sort === 'rating') query = query.sort({ ratingAverage: -1, ratingCount: -1 });
  else if (sort === 'newest') query = query.sort({ createdAt: -1 });
  else if (q) query = query.sort({ score: { $meta: 'textScore' } });
  else query = query.sort({ featured: -1, verified: -1, createdAt: -1 });

  const pageNum = Math.max(1, parseInt(page));
  const limitNum = Math.min(50, Math.max(1, parseInt(limit)));

  const [items, total] = await Promise.all([
    query.skip((pageNum - 1) * limitNum).limit(limitNum).lean(),
    Facility.countDocuments(filter),
  ]);

  let results = items;
  if (lat && lng) {
    results = items
      .map((f) => ({ ...f, distanceKm: haversineKm(parseFloat(lat), parseFloat(lng), f.latitude, f.longitude) }))
      .filter((f) => (radiusKm ? f.distanceKm <= parseFloat(radiusKm) : true))
      .sort((a, b) => a.distanceKm - b.distanceKm);
  }

  res.json({
    success: true,
    data: results,
    pagination: { page: pageNum, limit: limitNum, total, pages: Math.ceil(total / limitNum) },
  });
});

// GET /api/facilities/:idOrSlug
const getFacility = asyncHandler(async (req, res) => {
  const { idOrSlug } = req.params;
  const query = idOrSlug.match(/^[0-9a-fA-F]{24}$/) ? { _id: idOrSlug } : { slug: idOrSlug };
  const facility = await Facility.findOne({ ...query, status: 'APPROVED' }).select('-passwordHash').lean();
  if (!facility) throw new ApiError(404, 'Facility not found.');

  const reviews = await Review.find({ facility: facility._id, status: 'APPROVED' })
    .sort({ createdAt: -1 })
    .limit(20)
    .lean();

  res.json({ success: true, data: { ...facility, reviews } });
});

// GET /api/map/facilities
const mapFacilities = asyncHandler(async (req, res) => {
  const { type, city } = req.query;
  const filter = { status: 'APPROVED' };
  if (type) filter.facilityType = type;
  if (city) filter.city = new RegExp(`^${city}$`, 'i');

  const facilities = await Facility.find(filter)
    .select('name facilityType address city phone mobile1 latitude longitude verified slug')
    .lean();

  res.json({ success: true, data: facilities });
});

// GET /api/categories
const listCategories = asyncHandler(async (req, res) => {
  const categories = await FacilityCategory.find({ isActive: true }).sort({ sortOrder: 1, name: 1 });
  res.json({ success: true, data: categories });
});

// ---------- FACILITY OWNER (self-service) ----------

// GET /api/facilities/me/listing
const getMyListing = asyncHandler(async (req, res) => {
  res.json({ success: true, data: req.facility.toPublicJSON() });
});

// PUT /api/facilities/me/listing
const updateMyListing = asyncHandler(async (req, res) => {
  const allowed = [
    'name',
    'ownerName',
    'mobile1',
    'mobile2',
    'address',
    'locality',
    'city',
    'state',
    'pincode',
    'latitude',
    'longitude',
    'websiteUrl',
    'wantsWebsite',
    'description',
    'services',
    'openingHours',
  ];
  allowed.forEach((key) => {
    if (req.body[key] !== undefined) req.facility[key] = req.body[key];
  });

  // Edits to a live listing go back to PENDING for re-verification unless trivial
  await req.facility.save();

  await logActivity({
    actorType: 'FACILITY',
    actor: req.facility._id,
    actorName: req.facility.name,
    action: 'UPDATE_LISTING',
    targetType: 'Facility',
    target: req.facility._id,
    req,
  });

  res.json({ success: true, message: 'Listing updated successfully.', data: req.facility.toPublicJSON() });
});

// POST /api/facilities/me/images
const uploadImage = asyncHandler(async (req, res) => {
  const { imageBase64, type = 'gallery' } = req.body;
  if (!imageBase64) throw new ApiError(400, 'No image provided.');

  const upload = await cloudinary.uploader.upload(imageBase64, {
    folder: `hospital-marketplace/${req.facility._id}`,
    transformation: [{ width: 1600, crop: 'limit', quality: 'auto:good' }],
  });

  if (type === 'logo' || type === 'cover') {
    const old = req.facility.images.find((img) => img.type === type);
    if (old?.publicId) await cloudinary.uploader.destroy(old.publicId).catch(() => {});
    req.facility.images = req.facility.images.filter((img) => img.type !== type);
  }

  req.facility.images.push({ url: upload.secure_url, publicId: upload.public_id, type });
  await req.facility.save();

  res.json({ success: true, data: req.facility.images });
});

// DELETE /api/facilities/me/images/:publicId
const deleteImage = asyncHandler(async (req, res) => {
  const publicId = decodeURIComponent(req.params.publicId);
  await cloudinary.uploader.destroy(publicId).catch(() => {});
  req.facility.images = req.facility.images.filter((img) => img.publicId !== publicId);
  await req.facility.save();
  res.json({ success: true, data: req.facility.images });
});

// POST /api/facilities/:id/reviews  (public — goes to PENDING, moderated by admin)
const submitReview = asyncHandler(async (req, res) => {
  const { reviewerName, reviewerEmail, rating, review } = req.body;
  const facility = await Facility.findOne({ _id: req.params.id, status: 'APPROVED' });
  if (!facility) throw new ApiError(404, 'Facility not found.');
  if (!rating || rating < 1 || rating > 5) throw new ApiError(400, 'Rating must be between 1 and 5.');

  await Review.create({
    facility: facility._id,
    reviewerName,
    reviewerEmail,
    rating,
    review,
    status: 'PENDING',
    ipAddress: req.ip,
  });

  res.status(201).json({ success: true, message: 'Thank you! Your review has been submitted for moderation.' });
});

// POST /api/facilities/:id/report  (public — "Report Incorrect Information")
const reportFacility = asyncHandler(async (req, res) => {
  const { reason, details } = req.body;
  const facility = await Facility.findOne({ _id: req.params.id, status: 'APPROVED' });
  if (!facility) throw new ApiError(404, 'Facility not found.');

  const Notification = require('../models/Notification');
  await Notification.create({
    recipientType: 'ADMIN',
    title: 'Facility Report',
    message: `A visitor reported "${facility.name}": ${reason || 'Incorrect information'}${details ? ' — ' + details : ''}`,
    type: 'VERIFICATION_REQUEST',
    relatedFacility: facility._id,
  });

  const io = req.app.get('io');
  if (io) io.to('admins').emit('facility_reported', { facilityId: facility._id, name: facility.name, reason });

  res.status(201).json({ success: true, message: 'Thanks for letting us know. Our team will review this shortly.' });
});

module.exports = {
  listFacilities,
  getFacility,
  mapFacilities,
  listCategories,
  getMyListing,
  updateMyListing,
  uploadImage,
  deleteImage,
  submitReview,
  reportFacility,
};
