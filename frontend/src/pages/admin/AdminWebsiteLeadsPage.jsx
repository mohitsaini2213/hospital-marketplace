import { useEffect, useState, useCallback } from 'react';
import { useSearchParams } from 'react-router-dom';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { adminService } from '@/services/adminService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { LEAD_STATUS } from '@/utils/constants';
import { formatDate } from '@/utils/format';

const STATUS_STYLES = {
  New: 'bg-[var(--color-teal-050)] text-[var(--color-teal-700)]',
  Contacted: 'bg-[var(--color-amber-100)] text-[var(--color-amber-600)]',
  'In Discussion': 'bg-[var(--color-sand-100)] text-[var(--color-sand-700)]',
  Converted: 'bg-[var(--color-green-100)] text-[var(--color-green-600)]',
  Closed: 'bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]',
};

export const AdminWebsiteLeadsPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ data: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const toast = useToast();

  const status = searchParams.get('status') || '';
  const page = parseInt(searchParams.get('page') || '1');

  const load = useCallback(() => {
    setLoading(true);
    adminService.listWebsiteLeads({ status, page, limit: 15 }).then((res) => setData({ data: res.data, ...res.pagination })).finally(() => setLoading(false));
  }, [status, page]);

  useEffect(() => { load(); }, [load]);

  const updateStatus = async (lead, newStatus) => {
    try {
      await adminService.updateWebsiteLead(lead._id, { status: newStatus });
      toast.success('Lead status updated.');
      load();
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const columns = [
    { key: 'facilityName', header: 'Facility', render: (l) => (
      <div>
        <p className="font-medium text-[var(--color-ink)]">{l.facilityName}</p>
        <p className="text-xs text-[var(--color-ink-soft)]">{l.ownerName}</p>
      </div>
    ) },
    { key: 'email', header: 'Contact', render: (l) => (
      <div className="text-xs">
        <p>{l.email}</p>
        <p className="text-[var(--color-ink-soft)]">{l.mobile1}</p>
      </div>
    ) },
    { key: 'facilityType', header: 'Type' },
    { key: 'city', header: 'City' },
    { key: 'createdAt', header: 'Registered', render: (l) => formatDate(l.createdAt) },
    { key: 'status', header: 'Lead Status', render: (l) => (
      <select
        value={l.status}
        onChange={(e) => updateStatus(l, e.target.value)}
        className={`rounded-full border-0 px-2.5 py-1 text-xs font-semibold outline-none ${STATUS_STYLES[l.status]}`}
      >
        {LEAD_STATUS.map((s) => <option key={s} value={s}>{s}</option>)}
      </select>
    ) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Website Leads</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Facilities that requested a new website — follow up via apimohit0@gmail.com.</p>
      </div>

      <div className="flex flex-wrap gap-2">
        <button onClick={() => setSearchParams({})} className={`rounded-full px-3 py-1.5 text-xs font-medium ${!status ? 'bg-[var(--color-teal-600)] text-white' : 'bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]'}`}>
          All
        </button>
        {LEAD_STATUS.map((s) => (
          <button key={s} onClick={() => setSearchParams({ status: s })} className={`rounded-full px-3 py-1.5 text-xs font-medium ${status === s ? 'bg-[var(--color-teal-600)] text-white' : 'bg-[var(--color-paper-dim)] text-[var(--color-ink-soft)]'}`}>
            {s}
          </button>
        ))}
      </div>

      <DataTable columns={columns} rows={data.data} loading={loading} emptyTitle="No website leads yet" />
      <Pagination page={data.page} pages={data.pages} onChange={(p) => setSearchParams({ status, page: String(p) })} />
    </div>
  );
};
