import { Link } from 'react-router-dom';
import * as Fa6 from 'react-icons/fa6';
import { VerifiedBadge } from '@/components/ui/StatusBadge';
import { FACILITY_TYPE_ICON } from '@/utils/constants';
import { openStatus } from '@/utils/format';

export const FacilityCard = ({ facility }) => {
  const Icon = Fa6[FACILITY_TYPE_ICON[facility.facilityType]] || Fa6.FaHospital;
  const status = openStatus(facility.openingHours);
  const cover = facility.images?.find((i) => i.type === 'cover') || facility.images?.[0];

  return (
    <div className="card group flex flex-col overflow-hidden transition-shadow hover:shadow-lg">
      <div className="relative h-40 overflow-hidden bg-[var(--color-teal-050)]">
        {cover ? (
          <img src={cover.url} alt={facility.name} className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105" />
        ) : (
          <div className="flex h-full w-full items-center justify-center text-[var(--color-teal-600)]">
            <Icon size={34} />
          </div>
        )}
        {facility.featured && (
          <span className="absolute left-3 top-3 rounded-full bg-[var(--color-sand-600)] px-2.5 py-1 text-[11px] font-semibold text-white">
            Featured
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1 flex items-center justify-between gap-2">
          <span className="eyebrow">
            <Icon size={11} /> {facility.facilityType}
          </span>
          {facility.verified && <VerifiedBadge />}
        </div>

        <h3 className="text-base font-semibold leading-snug text-[var(--color-ink)]">
          <Link to={`/facility/${facility.slug || facility._id}`} className="hover:text-[var(--color-teal-700)]">
            {facility.name}
          </Link>
        </h3>

        <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
          <Fa6.FaLocationDot size={11} /> {facility.locality ? `${facility.locality}, ` : ''}{facility.city}
        </p>

        {facility.mobile1 && (
          <p className="mt-1 flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
            <Fa6.FaPhone size={11} /> {facility.mobile1}
          </p>
        )}

        <div className="mt-2 flex items-center gap-3 text-xs">
          {facility.ratingCount > 0 && (
            <span className="flex items-center gap-1 font-medium text-[var(--color-sand-700)]">
              <Fa6.FaStar size={11} /> {facility.ratingAverage.toFixed(1)}
              <span className="text-[var(--color-ink-soft)]">({facility.ratingCount})</span>
            </span>
          )}
          {status && (
            <span className={status.isOpen ? 'text-[var(--color-green-600)]' : 'text-[var(--color-ink-soft)]'}>
              {status.label}
            </span>
          )}
        </div>

        <div className="mt-4 flex items-center gap-2 border-t border-[var(--color-line)] pt-3">
          <Link to={`/facility/${facility.slug || facility._id}`} className="btn-secondary flex-1 !py-2 text-xs">
            View Details
          </Link>
          <Link to={`/facility/${facility.slug || facility._id}/appointment`} className="btn-primary !px-3 !py-2" aria-label="Book appointment">
            <Fa6.FaCalendarCheck size={13} />
          </Link>
          {facility.mobile1 && (
            <a href={`tel:${facility.mobile1}`} className="btn-ghost !p-2" aria-label="Call facility">
              <Fa6.FaPhone size={13} />
            </a>
          )}
          <a
            href={`https://www.google.com/maps/dir/?api=1&destination=${facility.latitude},${facility.longitude}`}
            target="_blank"
            rel="noreferrer"
            className="btn-ghost !p-2"
            aria-label="Get directions"
          >
            <Fa6.FaDiamondTurnRight size={13} />
          </a>
        </div>
      </div>
    </div>
  );
};
