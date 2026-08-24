# Hospital Marketplace — Backend API

Node.js / Express / MongoDB backend for Hospital Marketplace (Alwar, Rajasthan).

## Stack
Express · Mongoose · JWT (access token + HTTP-only refresh cookie) · bcrypt · Helmet ·
express-rate-limit · express-mongo-sanitize · xss-clean · Cloudinary · Nodemailer · Socket.IO

## 1. Setup

```bash
cd backend
npm install
cp .env.example .env
# fill in .env: MONGO_URI (Atlas), JWT secrets, OWNER_*, Cloudinary, SMTP, MSG91
```

## 2. Create the first admin (OWNER)

There is **no public admin registration route** by design. The only way to create
the first admin is this script, run with server/infra access:

```bash
npm run create-owner
```

Reads `OWNER_NAME`, `OWNER_EMAIL`, `OWNER_PASSWORD` from `.env`. Log in at
`/admin/login` on the frontend, then change the password.

To reset any admin's password later (e.g. if locked out):

```bash
node scripts/reset-owner-password.js owner@example.com 'NewStrong@Pass1'
```

## 3. (Optional) Seed sample data for local development

```bash
npm run seed          # inserts ~15 sample APPROVED facilities around Alwar
npm run seed:remove   # removes everything the seed script created
```

Seeded facilities are flagged `isSeed: true` — never run `seed` against production.

## 4. Run

```bash
npm run dev     # nodemon, local development
npm start       # production
```

Health check: `GET /api/health`

## API overview

| Area | Base path |
|---|---|
| Auth (facility + admin) | `/api/auth/*` |
| Public facility directory & details | `/api/facilities` |
| Facility owner self-service | `/api/facilities/me/*` (Bearer token) |
| Categories | `/api/categories` |
| Map data | `/api/map/facilities` |
| Admin | `/api/admin/*` (Bearer token, role-checked server-side) |
| In-app notifications | `/api/notifications` |

Full route list is in `PROJECT SPEC section 40` from the original brief — every
endpoint listed there is implemented in `routes/`.

## Security notes

- Passwords are **only** ever stored as `passwordHash` (bcrypt, 12 rounds). Never
  returned in any API response (`select: false` on the schema field).
- Refresh tokens are HTTP-only, `secure` in production, scoped to `/api/auth`, and
  never touch `localStorage`.
- Admin role is **always re-verified against the database** on every request in
  `middleware/auth.js` — a forged/edited JWT claiming `role: OWNER` is useless
  unless the DB record actually has that role.
- Rejected/pending/suspended facilities never appear in any public endpoint —
  every public query filters `status: 'APPROVED'` at the database level, not in
  the frontend.
- Rate limiting on all `/api/auth/*` routes (20 req / 15 min) plus a general
  limiter on the whole API.
- `express-mongo-sanitize` + `xss-clean` + `helmet` on every request.

## Deployment (Render)

1. New Web Service → point at this `backend/` folder (root directory `backend`).
2. Build command: `npm install`. Start command: `npm start`.
3. Add all variables from `.env.example` in Render's Environment tab. Set
   `CLIENT_URL` to your deployed Vercel frontend URL (comma-separate if you need
   both a preview and production domain — the server splits on `,`).
4. After first deploy, run `npm run create-owner` via Render's Shell tab (or a
   one-off Job) to bootstrap the OWNER account.
5. MongoDB Atlas → add Render's outbound IPs (or `0.0.0.0/0` for simplicity, with
   a strong DB user password) to the Atlas Network Access list.
