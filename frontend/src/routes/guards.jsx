import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '@/context/AuthContext';
import { Spinner } from '@/components/ui/Loading';

const FullPageLoader = () => (
  <div className="flex min-h-screen items-center justify-center text-[var(--color-teal-600)]">
    <Spinner size={28} />
  </div>
);

export const ProtectedFacilityRoute = () => {
  const { user, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;
  return <Outlet />;
};

export const ProtectedAdminRoute = ({ roles }) => {
  const { admin, loading } = useAuth();
  const location = useLocation();
  if (loading) return <FullPageLoader />;
  if (!admin) return <Navigate to="/admin/login" state={{ from: location }} replace />;
  if (roles && !roles.includes(admin.role)) return <Navigate to="/admin/dashboard" replace />;
  return <Outlet />;
};
