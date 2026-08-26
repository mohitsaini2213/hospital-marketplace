import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  FaGauge,
  FaBuilding,
  FaImages,
  FaListCheck,
  FaUserDoctor,
  FaCalendarCheck,
  FaClock,
  FaGlobe,
  FaLocationDot,
  FaGear,
  FaRightFromBracket,
} from 'react-icons/fa6';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import hmLogo from '@/assets/hm-logo.gif';

const LINKS = [
  { to: '/dashboard', label: 'Overview', icon: FaGauge, end: true },
  { to: '/dashboard/listing', label: 'My Listing', icon: FaBuilding },
  { to: '/dashboard/photos', label: 'Photos', icon: FaImages },
  { to: '/dashboard/services', label: 'Services', icon: FaListCheck },
  { to: '/dashboard/doctors', label: 'Doctors', icon: FaUserDoctor },
  {
    to: '/dashboard/appointments',
    label: 'Appointments',
    icon: FaCalendarCheck,
  },
  { to: '/dashboard/hours', label: 'Opening Hours', icon: FaClock },
  { to: '/dashboard/website', label: 'Website', icon: FaGlobe },
  { to: '/dashboard/location', label: 'Location', icon: FaLocationDot },
  { to: '/dashboard/settings', label: 'Account Settings', icon: FaGear },
];

export const DashboardLayout = () => {
  const { logout, user } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/');
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      {/* Desktop Sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-line)] bg-white lg:flex">
        <Link
          to="/"
          className="flex items-center gap-2.5 px-6 py-4 font-display text-base font-semibold text-[var(--color-teal-900)]"
        >
          {/* Animated HM Logo */}
          <span className="flex h-10 w-10 shrink-0 items-center justify-center overflow-hidden rounded-lg">
            <img
              src={hmLogo}
              alt="Hospital Marketplace Logo"
              className="h-full w-full object-cover scale-[1.8]"
            />
          </span>

          <span>Hospital Marketplace</span>
        </Link>

        <nav className="flex-1 space-y-1 px-3 py-2">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive
                    ? 'bg-[var(--color-teal-050)] text-[var(--color-teal-700)]'
                    : 'text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)] hover:text-[var(--color-ink)]'
                }`
              }
            >
              <Icon size={15} />
              {label}
            </NavLink>
          ))}
        </nav>

        {/* Account / Logout */}
        <div className="border-t border-[var(--color-line)] p-3">
          <div className="mb-2 truncate px-3 text-xs text-[var(--color-ink-soft)]">
            {user?.email}
          </div>

          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-[var(--color-red-600)] hover:bg-[var(--color-red-100)]"
          >
            <FaRightFromBracket size={15} />
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <div className="flex-1">
        {/* Mobile Top Bar */}
        <div className="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-4 py-3 lg:hidden">
          <Link
            to="/"
            className="flex items-center gap-2 font-display text-base font-semibold text-[var(--color-teal-900)]"
          >
            {/* Animated HM Logo */}
            <span className="flex h-9 w-9 shrink-0 items-center justify-center overflow-hidden rounded-lg">
              <img
                src={hmLogo}
                alt="Hospital Marketplace Logo"
                className="h-full w-full object-cover scale-[1.8]"
              />
            </span>

            <span>Hospital Marketplace</span>
          </Link>

          <button
            onClick={handleLogout}
            className="text-sm font-medium text-[var(--color-red-600)]"
          >
            Logout
          </button>
        </div>

        {/* Mobile Navigation */}
        <div className="border-b border-[var(--color-line)] bg-white px-4 py-2 lg:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${
                    isActive
                      ? 'bg-[var(--color-teal-050)] text-[var(--color-teal-700)]'
                      : 'text-[var(--color-ink-soft)]'
                  }`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        {/* Page Content */}
        <main className="container-page py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};      </div>
    </div>
  );
};
