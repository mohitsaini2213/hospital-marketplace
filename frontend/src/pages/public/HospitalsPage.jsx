import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { FaMagnifyingGlass } from 'react-icons/fa6';
import { FacilityGrid } from '@/components/facility/FacilityGrid';
import { Pagination } from '@/components/ui/Pagination';
import { facilityService } from '@/services/facilityService';
import { useSeo } from '@/hooks/useSeo';

export const HospitalsPage = () => {
  useSeo({
    title: 'Hospitals in Alwar',
    description: 'Verified general and multi-specialty hospitals in Alwar, Rajasthan.',
    path: '/hospitals',
  });
  const [searchParams, setSearchParams] = useSearchParams();
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [sort, setSort] = useState(searchParams.get('sort') || 'relevance');
  const page = parseInt(searchParams.get('page') || '1');
  const [data, setData] = useState({ items: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    facilityService
      .list({ type: 'Hospital', q: searchParams.get('q') || '', sort: searchParams.get('sort') || 'relevance', page, limit: 12 })
      .then((res) => setData({ items: res.data, ...res.pagination }))
      .finally(() => setLoading(false));
  }, [searchParams, page]);

  const submit = (e) => {
    e.preventDefault();
    setSearchParams({ q, sort, page: '1' });
  };

  return (
    <div className="container-page py-10">
      <div className="mb-8">
        <h1 className="text-3xl font-semibold text-[var(--color-ink)]">Hospitals in Alwar</h1>
        <p className="mt-1.5 text-sm text-[var(--color-ink-soft)]">Verified general and multi-specialty hospitals.</p>
      </div>

      <form onSubmit={submit} className="mb-8 flex flex-col gap-2 sm:flex-row">
        <div className="flex flex-1 items-center gap-2.5 rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5">
          <FaMagnifyingGlass size={14} className="text-[var(--color-ink-soft)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search hospitals…" className="w-full bg-transparent text-sm outline-none" />
        </div>
        <select
          value={sort}
          onChange={(e) => {
            setSort(e.target.value);
            setSearchParams({ q, sort: e.target.value, page: '1' });
          }}
          className="input sm:w-48"
        >
          <option value="relevance">Relevance</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
        </select>
        <button type="submit" className="btn-primary">Search</button>
      </form>

      <FacilityGrid facilities={data.items} loading={loading} />
      <Pagination page={data.page} pages={data.pages} onChange={(p) => setSearchParams({ q, sort, page: String(p) })} />
    </div>
  );
};
