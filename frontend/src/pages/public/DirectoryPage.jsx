import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaMagnifyingGlass, FaFilter, FaXmark } from 'react-icons/fa6';
import { FacilityGrid } from '@/components/facility/FacilityGrid';
import { FacilityFilters } from '@/components/facility/FacilityFilters';
import { Pagination } from '@/components/ui/Pagination';
import { facilityService } from '@/services/facilityService';
import { useSeo } from '@/hooks/useSeo';

export const DirectoryPage = () => {
  useSeo({
    title: 'Healthcare Directory',
    description: 'Browse verified hospitals, clinics, pharmacies, diagnostic centers and more in Alwar, Rajasthan.',
    path: '/directory',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [mobileFiltersOpen, setMobileFiltersOpen] = useState(false);
  const [qInput, setQInput] = useState(searchParams.get('q') || '');

  const filters = {
    q: searchParams.get('q') || '',
    type: searchParams.get('type') || '',
    locality: searchParams.get('locality') || '',
    sort: searchParams.get('sort') || 'relevance',
    page: parseInt(searchParams.get('page') || '1'),
  };

  const updateParams = useCallback(
    (next) => {
      const params = new URLSearchParams();
      Object.entries({ ...filters, ...next }).forEach(([k, v]) => {
        if (v && !(k === 'page' && v === 1)) params.set(k, v);
      });
      setSearchParams(params);
    },
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [searchParams]
  );

  useEffect(() => {
    setLoading(true);
    facilityService
      .list({ ...filters, limit: 12 })
      .then((res) => setData({ items: res.data, ...res.pagination }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  const onSearchSubmit = (e) => {
    e.preventDefault();
    updateParams({ q: qInput, page: 1 });
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Healthcare Directory</h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">
          Browse verified hospitals, clinics, pharmacies and more in Alwar, Rajasthan.
        </p>
      </div>

      <form onSubmit={onSearchSubmit} className="mb-6 flex gap-2">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5">
          <FaMagnifyingGlass size={14} className="text-[var(--color-ink-soft)]" />
          <input
            value={qInput}
            onChange={(e) => setQInput(e.target.value)}
            placeholder="Search by name or service…"
            className="w-full bg-transparent text-sm outline-none"
          />
        </div>
        <button type="submit" className="btn-primary">Search</button>
        <button
          type="button"
          onClick={() => setMobileFiltersOpen(true)}
          className="btn-secondary lg:hidden"
          aria-label="Open filters"
        >
          <FaFilter size={14} />
        </button>
      </form>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-[260px_1fr]">
        <aside className="hidden lg:block">
          <FacilityFilters filters={filters} onChange={(f) => updateParams({ ...f, page: 1 })} resultCount={data.total} />
        </aside>

        {mobileFiltersOpen && (
          <div className="fixed inset-0 z-[80] lg:hidden">
            <div className="absolute inset-0 bg-black/40" onClick={() => setMobileFiltersOpen(false)} />
            <div className="absolute inset-y-0 left-0 w-[85%] max-w-xs overflow-y-auto bg-[var(--color-paper)] p-5">
              <div className="mb-4 flex items-center justify-between">
                <h3 className="text-base font-semibold">Filters</h3>
                <button onClick={() => setMobileFiltersOpen(false)} aria-label="Close filters">
                  <FaXmark size={18} />
                </button>
              </div>
              <FacilityFilters
                filters={filters}
                onChange={(f) => {
                  updateParams({ ...f, page: 1 });
                }}
                resultCount={data.total}
              />
            </div>
          </div>
        )}

        <div>
          <FacilityGrid
            facilities={data.items}
            loading={loading}
            emptyAction={
              <Link to="/register" className="btn-primary">
                Register Your Facility
              </Link>
            }
          />
          <Pagination page={data.page} pages={data.pages} onChange={(p) => updateParams({ page: p })} />
        </div>
      </div>
    </div>
  );
};
