# Hospital Marketplace — Frontend

React + Vite + Tailwind CSS v4 frontend for Hospital Marketplace (Alwar, Rajasthan).

## Stack

React 19 · React Router · Axios · Tailwind CSS v4 · React Icons · Recharts ·
React-Leaflet (OpenStreetMap — no map API key required)

## 1. Setup

```bash
cd frontend
npm install
cp .env.example .env
# point VITE_API_URL at your running backend, e.g. http://localhost:5000/api
```

## 2. Run

```bash
npm run dev      # http://localhost:5173
npm run build    # production build to dist/
npm run lint     # oxlint
```

The dev server expects the backend (see `../backend/README.md`) running and
reachable at `VITE_API_URL`.

## Project structure

```
src/
  components/   ui / layout / facility / map / admin — reusable pieces
  pages/        public / auth / dashboard / admin — route-level screens
  layouts/      PublicLayout, DashboardLayout, AdminLayout
  context/      AuthContext (session), ToastContext (notifications)
  services/     axios instance + one file per API resource
  routes/       ProtectedFacilityRoute / ProtectedAdminRoute guards
  hooks/        useSeo — lightweight per-page meta tag helper
  utils/        constants, validators, formatters
```

## Notable implementation choices

- **Auth**: the access token lives in memory only (never `localStorage`), and
  is silently restored on page load via `/api/auth/refresh`, which relies on
  the backend's HTTP-only refresh cookie. A 401 anywhere triggers exactly one
  refresh attempt before failing over to a logged-out state.
- **Maps**: registration's location picker and the public map page use
  Leaflet + OpenStreetMap tiles, so there's no Google Maps/Mapbox API key to
  provision before the app works. If you'd rather use Google Maps, swap
  `src/components/map/LocationPicker.jsx` and `FacilityMap.jsx` — everything
  else (lat/lng shape, validation) is map-provider-agnostic.
- **Role checks are cosmetic only on the frontend** — `ProtectedAdminRoute`
  hides UI, but every admin action is re-checked server-side. Don't rely on
  frontend route guards for security.
- **Code-splitting**: the map page, registration flow, facility dashboard,
  and admin dashboard are all lazy-loaded (`React.lazy`), so the initial
  bundle (home/login/directory) stays lean.
- **SEO**: `useSeo()` sets per-page title/description/OG tags and canonical
  URL client-side. Facility detail pages also inject `MedicalBusiness`
  JSON-LD structured data. `public/sitemap.xml` is a static placeholder —
  regenerate it from live data with `backend/scripts/generate-sitemap.js`
  and copy the output here as part of your deploy pipeline.

## Deployment (Vercel)

1. Import the repo into Vercel, set the project root to `frontend/`.
2. Framework preset: Vite. Build command: `npm run build`. Output: `dist`.
3. Add environment variables from `.env.example` in the Vercel dashboard —
   `VITE_API_URL` should point at your deployed Render backend
   (e.g. `https://your-backend.onrender.com/api`).
4. Because this is a single-page app with client-side routing, add a rewrite
   so deep links (e.g. `/facility/xyz`) don't 404 on refresh:

   ```json
   // vercel.json
   {
     "rewrites": [{ "source": "/(.*)", "destination": "/index.html" }]
   }
   ```
5. On the backend, set `CLIENT_URL` to your Vercel domain so CORS and cookie
   scoping work correctly.
