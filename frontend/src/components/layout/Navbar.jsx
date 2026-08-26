import { useState } from 'react';
import { Link, NavLink, useNavigate } from 'react-router-dom';
import { FaBars, FaXmark, FaHospitalUser } from 'react-icons/fa6';
import { useAuth } from '@/context/AuthContext';
import hmLogo from '@/assets/hm-logo.gif';

const NAV_LINKS = [
  { to: '/directory', label: 'Directory' },
  { to: '/hospitals', label: 'Hospitals' },
  { to: '/map', label: 'Map' },
  { to: '/register', label: 'Register Facility' },
];

export const Navbar = () => {
  const [open, setOpen] = useState(false);
  const { user, admin } = useAuth();
  const navigate = useNavigate();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--color-line)] bg-[var(--color-paper)]/90 backdrop-blur-md">
      <div className="container-page flex h-16 items-center justify-between">
        <Link
          to="/"
          className="flex items-center gap-2.5 font-display text-lg font-semibold text-[var(--color-teal-900)]"
        >
          {/* Box size same rahega, lekin andar ki GIF zoom (scale-175) karke center wale HM ko bada kar diya gaya hai */}
          <span className="flex h-9 w-9 items-center justify-center overflow-hidden rounded-lg">
            <img
              src={hmLogo}
              alt="HM Logo"
              className="h-full w-full object-cover scale-[1.85]"
            />
          </span>
          <span>Hospital Marketplace</span>
        </Link>

        <nav className="hidden items-center gap-7 lg:flex">
          {NAV_LINKS.map((link) => (
            <NavLink
              key={link.to}
              to={link.to}
              className={({ isActive }) =>
                `text-sm font-medium transition-colors ${
                  isActive
                    ? 'text-[var(--color-teal-700)]'
                    : 'text-[var(--color-ink-soft)] hover:text-[var(--color-ink)]'
                }`
              }
            >
              {link.label}
            </NavLink>
          ))}
        </nav>

        <div className="hidden items-center gap-3 lg:flex">
          {user || admin ? (
            <button
              className="btn-secondary"
              onClick={() =>
                navigate(admin ? '/admin/dashboard' : '/dashboard')
              }
            >
              {admin ? 'Admin Dashboard' : 'My Dashboard'}
            </button>
          ) : (
            <>
              <Link
                to="/login"
                className="text-sm font-medium text-[var(--color-ink)] hover:text-[var(--color-teal-700)]"
              >
                Login
              </Link>

              <Link to="/register" className="btn-primary">
                <FaHospitalUser size={13} /> Register Your Facility
              </Link>
            </>
          )}
        </div>

        <button
          className="rounded-lg p-2 text-[var(--color-ink)] lg:hidden"
          onClick={() => setOpen((o) => !o)}
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
        >
          {open ? <FaXmark size={20} /> : <FaBars size={20} />}
        </button>
      </div>

      {open && (
        <div className="border-t border-[var(--color-line)] bg-[var(--color-paper)] px-5 py-4 lg:hidden">
          <nav className="flex flex-col gap-1">
            {NAV_LINKS.map((link) => (
              <NavLink
                key={link.to}
                to={link.to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `rounded-lg px-3 py-2.5 text-sm font-medium ${
                    isActive
                      ? 'bg-[var(--color-teal-050)] text-[var(--color-teal-700)]'
                      : 'text-[var(--color-ink)]'
                  }`
                }
              >
                {link.label}
              </NavLink>
            ))}

            <div className="my-2 h-px bg-[var(--color-line)]" />

            {user || admin ? (
              <button
                className="btn-primary w-full"
                onClick={() => {
                  setOpen(false);
                  navigate(admin ? '/admin/dashboard' : '/dashboard');
                }}
              >
                {admin ? 'Admin Dashboard' : 'My Dashboard'}
              </button>
            ) : (
              <div className="flex flex-col gap-2">
                <Link
                  to="/login"
                  onClick={() => setOpen(false)}
                  className="btn-secondary w-full"
                >
                  Login
                </Link>

                <Link
                  to="/register"
                  onClick={() => setOpen(false)}
                  className="btn-primary w-full"
                >
                  Register Your Facility
                </Link>
              </div>
            )}
          </nav>
        </div>
      )}
    </header>
  );
};