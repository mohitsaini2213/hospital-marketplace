import { useEffect, useState } from 'react';
import { DataTable } from '@/components/admin/DataTable';
import { Pagination } from '@/components/ui/Pagination';
import { adminService } from '@/services/adminService';
import { formatDateTime } from '@/utils/format';

export const AdminActivityPage = () => {
  const [data, setData] = useState({ data: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);

  useEffect(() => {
    setLoading(true);
    adminService.listActivity({ page, limit: 25 }).then((res) => setData({ data: res.data, ...res.pagination })).finally(() => setLoading(false));
  }, [page]);

  const columns = [
    { key: 'actorName', header: 'Actor', render: (a) => (
      <div>
        <p className="font-medium text-[var(--color-ink)]">{a.actorName || '—'}</p>
        <p className="text-xs text-[var(--color-ink-soft)]">{a.actorType}</p>
      </div>
    ) },
    { key: 'action', header: 'Action', render: (a) => (
      <span className="rounded-full bg-[var(--color-paper-dim)] px-2.5 py-1 text-xs font-medium text-[var(--color-ink)]">
        {a.action.replaceAll('_', ' ')}
      </span>
    ) },
    { key: 'targetType', header: 'Target', render: (a) => a.targetType || '—' },
    { key: 'ipAddress', header: 'IP', render: (a) => <span className="font-mono text-xs">{a.ipAddress || '—'}</span> },
    { key: 'createdAt', header: 'Timestamp', render: (a) => formatDateTime(a.createdAt) },
  ];

  return (
    <div className="space-y-5">
      <div>
        <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Activity Logs</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Full audit trail of admin and facility actions.</p>
      </div>
      <DataTable columns={columns} rows={data.data} loading={loading} emptyTitle="No activity recorded yet" />
      <Pagination page={data.page} pages={data.pages} onChange={setPage} />
    </div>
  );
};
