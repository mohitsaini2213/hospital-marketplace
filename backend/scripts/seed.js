/**
 * Development-only seed script.
 * Creates sample APPROVED facilities around Alwar, Rajasthan for local testing.
 * All seeded facilities are flagged isSeed: true so they can be cleanly removed.
 *
 * Usage:
 *   npm run seed          — insert seed data
 *   npm run seed:remove   — remove all isSeed: true facilities
 *
 * Do NOT run this against a production database.
 */
require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const connectDB = require('../config/db');
const Facility = require('../models/Facility');
const FacilityCategory = require('../models/FacilityCategory');

// Roughly spread around Alwar city center (27.5530° N, 76.6346° E)
const ALWAR = { lat: 27.553, lng: 76.6346 };
const jitter = () => (Math.random() - 0.5) * 0.06;

const DEFAULT_CATEGORIES = [
  { name: 'Hospital', icon: 'FaHospital', sortOrder: 1 },
  { name: 'Clinic', icon: 'FaStethoscope', sortOrder: 2 },
  { name: 'Medical Store / Pharmacy', icon: 'FaPrescriptionBottleAlt', sortOrder: 3 },
  { name: 'Diagnostic Center', icon: 'FaVials', sortOrder: 4 },
  { name: 'Nursing Home', icon: 'FaBed', sortOrder: 5 },
  { name: 'Dental Clinic', icon: 'FaTooth', sortOrder: 6 },
  { name: 'Physiotherapy Center', icon: 'FaWalking', sortOrder: 7 },
  { name: 'Pathology Lab', icon: 'FaFlask', sortOrder: 8 },
  { name: 'Eye Care Center', icon: 'FaEye', sortOrder: 9 },
  { name: 'Other', icon: 'FaPlusSquare', sortOrder: 10 },
];

const NAME_POOL = {
  Hospital: ['Alwar City Hospital', 'Sunrise Multispeciality Hospital', 'Aravali Hospital', 'Shree Krishna Hospital', 'Alwar General Hospital'],
  Clinic: ['Wellness Family Clinic', 'Care First Clinic', 'Alwar Health Clinic', 'Rajasthan Medical Clinic', 'Prime Care Clinic'],
  'Medical Store / Pharmacy': ['Apollo Medical Store', 'City Pharmacy', 'Alwar Medicos', 'Sanjeevani Pharmacy', 'Health Plus Medical Store'],
  'Diagnostic Center': ['Accurate Diagnostics', 'Alwar Path Lab & Diagnostics', 'Precision Diagnostic Center'],
  'Nursing Home': ['Mother Care Nursing Home', 'New Life Nursing Home'],
};

const makeFacility = (type, name, i) => ({
  facilityType: type,
  name,
  ownerName: `${name.split(' ')[0]} Admin`,
  email: `seed.${name.toLowerCase().replace(/[^a-z0-9]+/g, '.')}${i}@example.com`,
  mobile1: `9${String(100000000 + Math.floor(Math.random() * 899999999)).slice(0, 9)}`,
  address: `${10 + i}, Near Company Bagh Road`,
  locality: ['Company Bagh', 'Moti Dungri', 'Arya Nagar', 'MIA', 'Ashok Nagar'][i % 5],
  city: 'Alwar',
  state: 'Rajasthan',
  pincode: '301001',
  latitude: ALWAR.lat + jitter(),
  longitude: ALWAR.lng + jitter(),
  description: `${name} provides quality ${type.toLowerCase()} services to the Alwar community.`,
  services: ['General Consultation', 'Emergency Care'].slice(0, 1 + (i % 2)),
  status: 'APPROVED',
  verified: true,
  wantsWebsite: i % 3 === 0,
  isSeed: true,
  openingHours: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map((day) => ({ day, open: '09:00', close: '21:00', closed: false })),
});

const seed = async () => {
  await connectDB();

  for (const cat of DEFAULT_CATEGORIES) {
    await FacilityCategory.findOneAndUpdate({ name: cat.name }, cat, { upsert: true, new: true });
  }
  console.log('[seed] Categories ensured.');

  const docs = [];
  let i = 0;
  for (const [type, names] of Object.entries(NAME_POOL)) {
    for (const name of names) {
      const facility = makeFacility(type, name, i++);
      facility.passwordHash = await bcrypt.hash('Seed@12345', 12);
      docs.push(facility);
    }
  }

  await Facility.insertMany(docs, { ordered: false }).catch((err) => {
    console.warn('[seed] Some inserts skipped (likely duplicates):', err.message);
  });

  console.log(`[seed] Inserted ${docs.length} sample facilities (password for all: Seed@12345).`);
  await mongoose.disconnect();
};

const remove = async () => {
  await connectDB();
  const result = await Facility.deleteMany({ isSeed: true });
  console.log(`[seed:remove] Removed ${result.deletedCount} seeded facilities.`);
  await mongoose.disconnect();
};

if (process.argv.includes('--remove')) {
  remove().catch((err) => {
    console.error('[seed:remove] Failed:', err);
    process.exit(1);
  });
} else {
  seed().catch((err) => {
    console.error('[seed] Failed:', err);
    process.exit(1);
  });
}
