const mongoose = require('mongoose');
const slugify = require('slugify');

const FACILITY_TYPES = [
  'Hospital',
  'Clinic',
  'Medical Store / Pharmacy',
  'Diagnostic Center',
  'Nursing Home',
  'Dental Clinic',
  'Physiotherapy Center',
  'Pathology Lab',
  'Eye Care Center',
  'Other',
];

const STATUS = ['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'];

const openingHourSchema = new mongoose.Schema(
  {
    day: { type: String, enum: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'], required: true },
    open: { type: String }, // "09:00"
    close: { type: String }, // "21:00"
    closed: { type: Boolean, default: false },
  },
  { _id: false }
);

const imageSchema = new mongoose.Schema(
  {
    url: { type: String, required: true },
    publicId: { type: String },
    type: { type: String, enum: ['logo', 'cover', 'gallery'], default: 'gallery' },
  },
  { _id: false }
);

const facilitySchema = new mongoose.Schema(
  {
    facilityType: { type: String, enum: FACILITY_TYPES, required: true },
    customFacilityType: { type: String, trim: true },

    name: { type: String, required: true, trim: true },
    slug: { type: String, unique: true },
    ownerName: { type: String, required: true, trim: true },

    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    passwordHash: { type: String, required: true, select: false },

    mobile1: { type: String, required: true },
    mobile2: { type: String },

    address: { type: String, required: true },
    locality: { type: String },
    city: { type: String, default: 'Alwar' },
    state: { type: String, default: 'Rajasthan' },
    pincode: { type: String, required: true },

    latitude: { type: Number, required: true },
    longitude: { type: Number, required: true },

    websiteUrl: { type: String },
    wantsWebsite: { type: Boolean, default: false },

    description: { type: String, maxlength: 2000 },
    services: [{ type: String }],
    openingHours: [openingHourSchema],
    images: [imageSchema],

    status: { type: String, enum: STATUS, default: 'PENDING' },
    rejectionReason: { type: String },
    verified: { type: Boolean, default: false },
    featured: { type: Boolean, default: false },

    ratingAverage: { type: Number, default: 0 },
    ratingCount: { type: Number, default: 0 },

    isSeed: { type: Boolean, default: false },

    lastLoginAt: { type: Date },
  },
  { timestamps: true }
);

facilitySchema.index({ name: 'text', description: 'text', services: 'text' });
facilitySchema.index({ city: 1, facilityType: 1, status: 1 });
facilitySchema.index({ latitude: 1, longitude: 1 });
facilitySchema.index({ status: 1, createdAt: -1 });

facilitySchema.pre('save', async function (next) {
  if (this.isModified('name') || !this.slug) {
    const base = slugify(`${this.name}-${this.city || 'alwar'}`, { lower: true, strict: true });
    let slug = base;
    let count = 1;
    while (await mongoose.models.Facility.findOne({ slug, _id: { $ne: this._id } })) {
      slug = `${base}-${count++}`;
    }
    this.slug = slug;
  }
  next();
});

facilitySchema.methods.toPublicJSON = function () {
  const obj = this.toObject();
  delete obj.passwordHash;
  return obj;
};

facilitySchema.statics.FACILITY_TYPES = FACILITY_TYPES;
facilitySchema.statics.STATUS = STATUS;

module.exports = mongoose.model('Facility', facilitySchema);
