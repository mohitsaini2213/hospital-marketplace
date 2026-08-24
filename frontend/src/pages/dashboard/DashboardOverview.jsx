import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import * as Fa6 from 'react-icons/fa6';
import { facilityService } from '@/services/facilityService';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Spinner } from '@/components/ui/Loading';
import { useAuth } from '@/context/AuthContext';

const CHECKLIST = [
  { key: 'hasPhotos', label: 'Add facility photos', to: '/dashboard/photos' },
  { key: 'hasServices', label: 'List your services', to: '/dashboard/services' },
  { key: 'hasHours', label: 'Set opening hours', to: '/dashboard/hours' },
  { key: 'hasDescription', label: 'Write a facility description', to: '/dashboard/listing' },
];

export const DashboardOverview = () => {
  const { user } = useAuth();
  const [listing, setListing] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    facilityService.myListing().then((res) => setListing(res.data)).finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-teal-600)]">
        <Spinner size={24} />
      </div>
    );
  }

  const checks = {
    hasPhotos: listing?.images?.length > 0,
    hasServices: listing?.services?.length > 0,
    hasHours: listing?.openingHours?.length > 0,
    hasDescription: !!listing?.description,
  };
  const completed = Object.values(checks).filter(Boolean).length;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Welcome, {user?.ownerName || 'there'}</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Here's how your listing is doing.</p>
        </div>
        <StatusBadge status={listing?.status} />
      </div>

      {listing?.status === 'PENDING' && (
        <div className="card flex items-start gap-3 border-[var(--color-amber-600)]/30 bg-[var(--color-amber-100)]/40 p-4">
          <Fa6.FaClock className="mt-0.5 shrink-0 text-[var(--color-amber-600)]" size={16} />
          <p className="text-sm text-[var(--color-ink)]">
            Your listing is under verification. Our team typically reviews new registrations within 1–2 business days.
          </p>
        </div>
      )}

      {listing?.status === 'REJECTED' && (
        <div className="card flex items-start gap-3 border-[var(--color-red-600)]/30 bg-[var(--color-red-100)]/40 p-4">
          <Fa6.FaTriangleExclamation className="mt-0.5 shrink-0 text-[var(--color-red-600)]" size={16} />
          <div>
            <p className="text-sm font-medium text-[var(--color-ink)]">Your listing was rejected.</p>
            {listing.rejectionReason && <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Reason: {listing.rejectionReason}</p>}
            <Link to="/dashboard/listing" className="mt-2 inline-block text-sm font-semibold text-[var(--color-teal-700)] hover:underline">
              Update your listing →
            </Link>
          </div>
        </div>
      )}

      {listing?.status === 'SUSPENDED' && (
        <div className="card flex items-start gap-3 border-[var(--color-red-600)]/30 bg-[var(--color-red-100)]/40 p-4">
          <Fa6.FaBan className="mt-0.5 shrink-0 text-[var(--color-red-600)]" size={16} />
          <p className="text-sm text-[var(--color-ink)]">Your listing has been suspended. Contact support for details.</p>
        </div>
      )}

      <div className="grid grid-cols-1 gap-5 sm:grid-cols-3">
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-soft)]">Profile Complete</p>
          <p className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)]">{completed}/4</p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-soft)]">Average Rating</p>
          <p className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)]">
            {listing?.ratingCount ? listing.ratingAverage.toFixed(1) : '—'}
          </p>
        </div>
        <div className="card p-5">
          <p className="text-xs font-medium uppercase tracking-wide text-[var(--color-ink-soft)]">Reviews</p>
          <p className="mt-2 font-display text-3xl font-semibold text-[var(--color-ink)]">{listing?.ratingCount || 0}</p>
        </div>
      </div>

      <div className="card p-5">
        <h3 className="mb-4 text-sm font-semibold text-[var(--color-ink)]">Complete your profile</h3>
        <ul className="space-y-2">
          {CHECKLIST.map((item) => (
            <li key={item.key}>
              <Link to={item.to} className="flex items-center justify-between rounded-lg px-3 py-2.5 hover:bg-[var(--color-paper-dim)]">
                <span className="flex items-center gap-2.5 text-sm text-[var(--color-ink)]">
                  {checks[item.key] ? (
                    <Fa6.FaCircleCheck className="text-[var(--color-green-600)]" size={16} />
                  ) : (
                    <Fa6.FaRegCircle className="text-[var(--color-ink-soft)]" size={16} />
                  )}
                  {item.label}
                </span>
                <Fa6.FaChevronRight size={11} className="text-[var(--color-ink-soft)]" />
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};
