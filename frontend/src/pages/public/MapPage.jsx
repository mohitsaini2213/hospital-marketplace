import { useEffect, useState } from 'react';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { FacilityMap } from '@/components/map/FacilityMap';
import { facilityService } from '@/services/facilityService';
import { FACILITY_TYPES } from '@/utils/constants';
import { Spinner } from '@/components/ui/Loading';
import { useSeo } from '@/hooks/useSeo';

export const MapPage = () => {
  useSeo({
    title: 'Facility Map',
    description: 'Browse verified healthcare facilities in Alwar on an interactive map.',
    path: '/map',
  });
  const [facilities, setFacilities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [type, setType] = useState('');
  const [q, setQ] = useState('');

  useEffect(() => {
    setLoading(true);
    facilityService
      .mapFacilities({ type, q })
      .then((res) => setFacilities(res.data))
      .finally(() => setLoading(false));
  }, [type, q]);

  return (
    <div className="container-page py-10">
      <div className="mb-6">
        <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Facility Map</h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
          Browse verified healthcare facilities in Alwar visually — click any pin for details.
        </p>
      </div>

      <div className="mb-5 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5">
          <FaMagnifyingGlass size={14} className="text-[var(--color-ink-soft)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search on map…" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <select value={type} onChange={(e) => setType(e.target.value)} className="input sm:w-56">
          <option value="">All facility types</option>
          {FACILITY_TYPES.filter((t) => t !== 'Other').map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="flex h-[520px] items-center justify-center rounded-xl border border-[var(--color-line)] text-[var(--color-teal-600)]">
          <Spinner size={26} />
        </div>
      ) : (
        <FacilityMap facilities={facilities} height="560px" zoom={12} />
      )}
    </div>
  );
};
