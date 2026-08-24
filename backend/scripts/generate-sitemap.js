/**
 * Generates a sitemap.xml from all APPROVED facilities plus static pages.
 * Intended to run on a schedule (e.g. daily cron on Render) and write the
 * output somewhere your frontend/CDN serves it from.
 *
 * Usage: node scripts/generate-sitemap.js [outputPath]
 * Defaults to writing ./sitemap.xml in the backend folder — copy that into
 * your deployed frontend's public/ directory as part of your deploy step,
 * or point outputPath directly at frontend/public/sitemap.xml in a monorepo.
 */
require('dotenv').config();
const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');
const connectDB = require('../config/db');
const Facility = require('../models/Facility');

const SITE_URL = process.env.CLIENT_URL?.split(',')[0] || 'https://hospitalmarketplace.in';

const STATIC_PAGES = ['/', '/directory', '/hospitals', '/map', '/register', '/contact', '/privacy-policy', '/terms'];

const run = async () => {
  const outputPath = process.argv[2] || path.join(__dirname, '..', 'sitemap.xml');
  await connectDB();

  const facilities = await Facility.find({ status: 'APPROVED' }).select('slug _id updatedAt');

  const urls = [
    ...STATIC_PAGES.map((p) => ({ loc: `${SITE_URL}${p}`, priority: p === '/' ? '1.0' : '0.8' })),
    ...facilities.map((f) => ({
      loc: `${SITE_URL}/facility/${f.slug || f._id}`,
      lastmod: f.updatedAt.toISOString().split('T')[0],
      priority: '0.6',
    })),
  ];

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${urls
  .map(
    (u) => `  <url>
    <loc>${u.loc}</loc>
    ${u.lastmod ? `<lastmod>${u.lastmod}</lastmod>` : ''}
    <priority>${u.priority}</priority>
  </url>`
  )
  .join('\n')}
</urlset>
`;

  fs.writeFileSync(outputPath, xml);
  console.log(`[generate-sitemap] Wrote ${urls.length} URLs to ${outputPath}`);

  await mongoose.disconnect();
};

run().catch((err) => {
  console.error('[generate-sitemap] Failed:', err);
  process.exit(1);
});
