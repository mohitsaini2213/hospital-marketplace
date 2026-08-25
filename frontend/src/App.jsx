import { Suspense, lazy } from 'react';
import { Routes, Route } from 'react-router-dom';
import { ErrorBoundary } from '@/components/layout/ErrorBoundary';
import { PublicLayout } from '@/layouts/PublicLayout';
import { DashboardLayout } from '@/layouts/DashboardLayout';
import { AdminLayout } from '@/layouts/AdminLayout';
import { ProtectedFacilityRoute, ProtectedAdminRoute } from '@/routes/guards';
import { Spinner } from '@/components/ui/Loading';

import { HomePage } from '@/pages/public/HomePage';
import { DirectoryPage } from '@/pages/public/DirectoryPage';
import { HospitalsPage } from '@/pages/public/HospitalsPage';
import { FacilityDetailsPage } from '@/pages/public/FacilityDetailsPage';
import { ContactPage } from '@/pages/public/ContactPage';
import { PrivacyPolicyPage } from '@/pages/public/PrivacyPolicyPage';
import { TermsPage } from '@/pages/public/TermsPage';
import { NotFoundPage } from '@/pages/public/NotFoundPage';
import { BookAppointmentPage } from '@/pages/public/BookAppointmentPage';

import { LoginPage } from '@/pages/auth/LoginPage';
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage';
import { ResetPasswordPage } from '@/pages/auth/ResetPasswordPage';

// Heavier, less-frequently-hit route groups are lazy-loaded so the initial
// bundle (home/directory/login) stays small — map (Leaflet) and admin
// (Recharts) pull in the biggest dependencies.
const MapPage = lazy(() => import('@/pages/public/MapPage').then((m) => ({ default: m.MapPage })));
const RegisterPage = lazy(() => import('@/pages/auth/RegisterPage').then((m) => ({ default: m.RegisterPage })));

const DashboardOverview = lazy(() => import('@/pages/dashboard/DashboardOverview').then((m) => ({ default: m.DashboardOverview })));
const EditListingPage = lazy(() => import('@/pages/dashboard/EditListingPage').then((m) => ({ default: m.EditListingPage })));
const PhotosPage = lazy(() => import('@/pages/dashboard/PhotosPage').then((m) => ({ default: m.PhotosPage })));
const ServicesPage = lazy(() => import('@/pages/dashboard/ServicesPage').then((m) => ({ default: m.ServicesPage })));
const DoctorsPage = lazy(() => import('@/pages/dashboard/DoctorsPage').then((m) => ({ default: m.DoctorsPage })));
const AppointmentsPage = lazy(() => import('@/pages/dashboard/AppointmentsPage').then((m) => ({ default: m.AppointmentsPage })));
const HoursPage = lazy(() => import('@/pages/dashboard/HoursPage').then((m) => ({ default: m.HoursPage })));
const WebsitePage = lazy(() => import('@/pages/dashboard/WebsitePage').then((m) => ({ default: m.WebsitePage })));
const LocationPage = lazy(() => import('@/pages/dashboard/LocationPage').then((m) => ({ default: m.LocationPage })));
const SettingsPage = lazy(() => import('@/pages/dashboard/SettingsPage').then((m) => ({ default: m.SettingsPage })));

const AdminLoginPage = lazy(() => import('@/pages/admin/AdminLoginPage').then((m) => ({ default: m.AdminLoginPage })));
const AdminDashboardPage = lazy(() => import('@/pages/admin/AdminDashboardPage').then((m) => ({ default: m.AdminDashboardPage })));
const AdminFacilitiesPage = lazy(() => import('@/pages/admin/AdminFacilitiesPage').then((m) => ({ default: m.AdminFacilitiesPage })));
const AdminCategoriesPage = lazy(() => import('@/pages/admin/AdminCategoriesPage').then((m) => ({ default: m.AdminCategoriesPage })));
const AdminWebsiteLeadsPage = lazy(() => import('@/pages/admin/AdminWebsiteLeadsPage').then((m) => ({ default: m.AdminWebsiteLeadsPage })));
const AdminReviewsPage = lazy(() => import('@/pages/admin/AdminReviewsPage').then((m) => ({ default: m.AdminReviewsPage })));
const AdminUsersPage = lazy(() => import('@/pages/admin/AdminUsersPage').then((m) => ({ default: m.AdminUsersPage })));
const AdminActivityPage = lazy(() => import('@/pages/admin/AdminActivityPage').then((m) => ({ default: m.AdminActivityPage })));
const AdminAppointmentsPage = lazy(() => import('@/pages/admin/AdminAppointmentsPage').then((m) => ({ default: m.AdminAppointmentsPage })));

const PageLoader = () => (
  <div className="flex min-h-[60vh] items-center justify-center text-[var(--color-teal-600)]">
    <Spinner size={26} />
  </div>
);

function App() {
  return (
    <ErrorBoundary>
      <Suspense fallback={<PageLoader />}>
        <Routes>
          {/* Public site */}
          <Route element={<PublicLayout />}>
            <Route path="/" element={<HomePage />} />
            <Route path="/directory" element={<DirectoryPage />} />
            <Route path="/hospitals" element={<HospitalsPage />} />
            <Route path="/facility/:idOrSlug" element={<FacilityDetailsPage />} />
            <Route path="/facility/:idOrSlug/appointment" element={<BookAppointmentPage />} />
            <Route path="/map" element={<MapPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy-policy" element={<PrivacyPolicyPage />} />
            <Route path="/terms" element={<TermsPage />} />

            <Route path="/register" element={<RegisterPage />} />
            <Route path="/login" element={<LoginPage />} />
            <Route path="/forgot-password" element={<ForgotPasswordPage />} />
            <Route path="/reset-password/:token" element={<ResetPasswordPage />} />
          </Route>

          {/* Facility owner dashboard */}
          <Route element={<ProtectedFacilityRoute />}>
            <Route element={<DashboardLayout />}>
              <Route path="/dashboard" element={<DashboardOverview />} />
              <Route path="/dashboard/listing" element={<EditListingPage />} />
              <Route path="/dashboard/photos" element={<PhotosPage />} />
              <Route path="/dashboard/services" element={<ServicesPage />} />
              <Route path="/dashboard/doctors" element={<DoctorsPage />} />
              <Route path="/dashboard/appointments" element={<AppointmentsPage />} />
              <Route path="/dashboard/hours" element={<HoursPage />} />
              <Route path="/dashboard/website" element={<WebsitePage />} />
              <Route path="/dashboard/location" element={<LocationPage />} />
              <Route path="/dashboard/settings" element={<SettingsPage />} />
            </Route>
          </Route>

          {/* Admin */}
          <Route path="/admin/login" element={<AdminLoginPage />} />
          <Route element={<ProtectedAdminRoute />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/dashboard" element={<AdminDashboardPage />} />
              <Route path="/admin/facilities" element={<AdminFacilitiesPage />} />
              <Route path="/admin/categories" element={<AdminCategoriesPage />} />
              <Route path="/admin/website-leads" element={<AdminWebsiteLeadsPage />} />
              <Route path="/admin/reviews" element={<AdminReviewsPage />} />
              <Route path="/admin/activity" element={<AdminActivityPage />} />
              <Route path="/admin/appointments" element={<AdminAppointmentsPage />} />
            </Route>
          </Route>
          <Route element={<ProtectedAdminRoute roles={['OWNER']} />}>
            <Route element={<AdminLayout />}>
              <Route path="/admin/admins" element={<AdminUsersPage />} />
            </Route>
          </Route>

          <Route path="*" element={<PublicLayout />}>
            <Route path="*" element={<NotFoundPage />} />
          </Route>
        </Routes>
      </Suspense>
    </ErrorBoundary>
  );
}

export default App;
