import { useEffect, useState } from 'react';
import { NavLink, Outlet, useNavigate, Link } from 'react-router-dom';
import {
  FaGauge,
  FaBuilding,
  FaClipboardCheck,
  FaLayerGroup,
  FaGlobe,
  FaStar,
  FaBell,
  FaClockRotateLeft,
  FaRightFromBracket,
  FaHospital,
  FaUserShield,
} from 'react-icons/fa6';
import { useAuth } from '@/context/AuthContext';
import { useToast } from '@/context/ToastContext';
import { notificationService } from '@/services/adminService';

const LINKS = [
  { to: '/admin/dashboard', label: 'Dashboard', icon: FaGauge, end: true },
  { to: '/admin/facilities', label: 'Facilities', icon: FaBuilding },
  { to: '/admin/facilities?status=PENDING', label: 'Pending Approvals', icon: FaClipboardCheck },
  { to: '/admin/categories', label: 'Categories', icon: FaLayerGroup },
  { to: '/admin/website-leads', label: 'Website Leads', icon: FaGlobe },
  { to: '/admin/reviews', label: 'Reviews', icon: FaStar },
  { to: '/admin/admins', label: 'Users', icon: FaUserShield },
  { to: '/admin/activity', label: 'Activity Logs', icon: FaClockRotateLeft },
];

export const AdminLayout = () => {
  const { admin, logout } = useAuth();
  const navigate = useNavigate();
  const toast = useToast();
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    notificationService
      .list()
      .then((res) => setUnread(res.unreadCount || 0))
      .catch(() => {});
  }, []);

  const handleLogout = async () => {
    await logout();
    toast.success('Logged out successfully.');
    navigate('/admin/login');
  };

  return (
    <div className="flex min-h-screen bg-[var(--color-paper)]">
      <aside className="hidden w-64 shrink-0 flex-col border-r border-[var(--color-line)] bg-[var(--color-teal-900)] text-white lg:flex">
        <Link to="/admin/dashboard" className="flex items-center gap-2 px-6 py-5 font-display text-base font-semibold">
          <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10">
            <FaHospital size={14} />
          </span>
          HM Admin
        </Link>
        <nav className="flex-1 space-y-1 px-3 py-2">
          {LINKS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition-colors ${
                  isActive ? 'bg-white/12 text-white' : 'text-white/65 hover:bg-white/8 hover:text-white'
                }`
              }
            >
              <Icon size={15} /> {label}
            </NavLink>
          ))}
        </nav>
        <div className="border-t border-white/10 p-3">
          <div className="mb-2 truncate px-3 text-xs text-white/50">
            {admin?.name} · {admin?.role}
          </div>
          <button
            onClick={handleLogout}
            className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium text-white/85 hover:bg-white/8"
          >
            <FaRightFromBracket size={15} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1">
        <header className="flex items-center justify-between border-b border-[var(--color-line)] bg-white px-4 py-3 lg:px-6">
          <Link to="/admin/dashboard" className="font-display text-base font-semibold text-[var(--color-teal-900)] lg:hidden">
            HM Admin
          </Link>
          <div className="hidden max-w-sm flex-1 lg:block">
            <input placeholder="Search facilities, leads, admins…" className="input" />
          </div>
          <div className="flex items-center gap-4">
            <button className="relative rounded-full p-2 text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]" aria-label="Notifications">
              <FaBell size={17} />
              {unread > 0 && (
                <span className="absolute right-1 top-1 flex h-4 min-w-4 items-center justify-center rounded-full bg-[var(--color-red-600)] px-1 text-[10px] font-bold text-white">
                  {unread > 9 ? '9+' : unread}
                </span>
              )}
            </button>
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-[var(--color-teal-600)] text-xs font-semibold text-white">
              {admin?.name?.[0]?.toUpperCase() || 'A'}
            </div>
          </div>
        </header>

        <div className="border-b border-[var(--color-line)] bg-white px-4 py-2 lg:hidden">
          <div className="flex gap-1 overflow-x-auto">
            {LINKS.map(({ to, label, end }) => (
              <NavLink
                key={to}
                to={to}
                end={end}
                className={({ isActive }) =>
                  `whitespace-nowrap rounded-full px-3 py-1.5 text-xs font-medium ${isActive ? 'bg-[var(--color-teal-050)] text-[var(--color-teal-700)]' : 'text-[var(--color-ink-soft)]'}`
                }
              >
                {label}
              </NavLink>
            ))}
          </div>
        </div>

        <main className="container-page py-8">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
