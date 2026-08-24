import { useEffect, useState, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { FaMagnifyingGlass, FaEye, FaCheck, FaXmark, FaBan, FaTrash } from 'react-icons/fa6';
import { DataTable } from '@/components/admin/DataTable';
import { StatusBadge } from '@/components/ui/StatusBadge';
import { Pagination } from '@/components/ui/Pagination';
import { Modal, ConfirmDialog } from '@/components/ui/Modal';
import { adminService } from '@/services/adminService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { FACILITY_TYPES } from '@/utils/constants';
import { formatDate } from '@/utils/format';

export const AdminFacilitiesPage = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const [data, setData] = useState({ data: [], page: 1, pages: 1, total: 0 });
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState(searchParams.get('q') || '');
  const [rejectTarget, setRejectTarget] = useState(null);
  const [rejectReason, setRejectReason] = useState('');
  const [confirmAction, setConfirmAction] = useState(null); // { type: 'suspend'|'delete', facility }
  const [actionLoading, setActionLoading] = useState(false);
  const toast = useToast();

  const filters = {
    q: searchParams.get('q') || '',
    status: searchParams.get('status') || '',
    type: searchParams.get('type') || '',
    city: searchParams.get('city') || '',
    page: parseInt(searchParams.get('page') || '1'),
  };

  const load = useCallback(() => {
    setLoading(true);
    adminService
      .listFacilities({ ...filters, limit: 15 })
      .then((res) => setData({ data: res.data, ...res.pagination }))
      .finally(() => setLoading(false));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [searchParams]);

  useEffect(() => {
    load();
  }, [load]);

  const updateParams = (next) => {
    const params = new URLSearchParams();
    Object.entries({ ...filters, ...next }).forEach(([k, v]) => {
      if (v && !(k === 'page' && v === 1)) params.set(k, v);
    });
    setSearchParams(params);
  };

  const approve = async (facility) => {
    try {
      await adminService.approveFacility(facility._id);
      toast.success(`${facility.name} approved.`);
      load();
    } catch (err) {
      toast.error(parseApiError(err).message);
    }
  };

  const submitReject = async () => {
    if (!rejectReason.trim()) return;
    setActionLoading(true);
    try {
      await adminService.rejectFacility(rejectTarget._id, rejectReason);
      toast.success(`${rejectTarget.name} rejected.`);
      setRejectTarget(null);
      setRejectReason('');
      load();
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setActionLoading(false);
    }
  };

  const runConfirmedAction = async () => {
    setActionLoading(true);
    try {
      if (confirmAction.type === 'suspend') {
        await adminService.suspendFacility(confirmAction.facility._id);
        toast.success(`${confirmAction.facility.name} suspended.`);
      } else if (confirmAction.type === 'delete') {
        await adminService.deleteFacility(confirmAction.facility._id);
        toast.success(`${confirmAction.facility.name} deleted.`);
      }
      setConfirmAction(null);
      load();
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setActionLoading(false);
    }
  };

  const columns = [
    { key: 'name', header: 'Facility', render: (f) => (
      <div>
        <p className="font-medium text-[var(--color-ink)]">{f.name}</p>
        <p className="text-xs text-[var(--color-ink-soft)]">{f.email}</p>
      </div>
    ) },
    { key: 'facilityType', header: 'Type' },
    { key: 'city', header: 'City' },
    { key: 'mobile1', header: 'Mobile' },
    { key: 'status', header: 'Status', render: (f) => <StatusBadge status={f.status} /> },
    { key: 'createdAt', header: 'Registered', render: (f) => formatDate(f.createdAt) },
    {
      key: 'actions',
      header: 'Actions',
      render: (f) => (
        <div className="flex items-center gap-1.5">
          <Link to={`/facility/${f.slug || f._id}`} target="_blank" className="rounded-lg p-1.5 text-[var(--color-ink-soft)] hover:bg-[var(--color-paper-dim)]" title="View">
            <FaEye size={14} />
          </Link>
          {f.status !== 'APPROVED' && (
            <button onClick={() => approve(f)} className="rounded-lg p-1.5 text-[var(--color-green-600)] hover:bg-[var(--color-green-100)]" title="Approve">
              <FaCheck size={14} />
            </button>
          )}
          {f.status !== 'REJECTED' && (
            <button onClick={() => setRejectTarget(f)} className="rounded-lg p-1.5 text-[var(--color-red-600)] hover:bg-[var(--color-red-100)]" title="Reject">
              <FaXmark size={14} />
            </button>
          )}
          {f.status !== 'SUSPENDED' && (
            <button onClick={() => setConfirmAction({ type: 'suspend', facility: f })} className="rounded-lg p-1.5 text-[var(--color-amber-600)] hover:bg-[var(--color-amber-100)]" title="Suspend">
              <FaBan size={14} />
            </button>
          )}
          <button onClick={() => setConfirmAction({ type: 'delete', facility: f })} className="rounded-lg p-1.5 text-[var(--color-red-600)] hover:bg-[var(--color-red-100)]" title="Delete">
            <FaTrash size={13} />
          </button>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-semibold text-[var(--color-ink)]">Facilities</h1>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{data.total} total facilities</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        <form onSubmit={(e) => { e.preventDefault(); updateParams({ q, page: 1 }); }} className="flex flex-1 min-w-[220px] items-center gap-2 rounded-xl border border-[var(--color-line)] bg-white px-3.5 py-2.5">
          <FaMagnifyingGlass size={13} className="text-[var(--color-ink-soft)]" />
          <input value={q} onChange={(e) => setQ(e.target.value)} placeholder="Search name, email, mobile…" className="w-full bg-transparent text-sm outline-none" />
        </form>
        <select value={filters.status} onChange={(e) => updateParams({ status: e.target.value, page: 1 })} className="input !w-auto">
          <option value="">All statuses</option>
          {['PENDING', 'APPROVED', 'REJECTED', 'SUSPENDED'].map((s) => <option key={s} value={s}>{s}</option>)}
        </select>
        <select value={filters.type} onChange={(e) => updateParams({ type: e.target.value, page: 1 })} className="input !w-auto">
          <option value="">All types</option>
          {FACILITY_TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
        </select>
        <input
          value={filters.city}
          onChange={(e) => updateParams({ city: e.target.value, page: 1 })}
          placeholder="City"
          className="input !w-32"
        />
      </div>

      <DataTable columns={columns} rows={data.data} loading={loading} emptyTitle="No facilities match these filters" />
      <Pagination page={data.page} pages={data.pages} onChange={(p) => updateParams({ page: p })} />

      <Modal open={!!rejectTarget} onClose={() => setRejectTarget(null)} title={`Reject ${rejectTarget?.name || ''}`}>
        <label className="label">Rejection Reason</label>
        <textarea value={rejectReason} onChange={(e) => setRejectReason(e.target.value)} rows={3} className="input" placeholder="Explain why this listing is being rejected…" />
        <div className="mt-5 flex justify-end gap-3">
          <button className="btn-secondary" onClick={() => setRejectTarget(null)}>Cancel</button>
          <button className="btn bg-[var(--color-red-600)] text-white hover:opacity-90" onClick={submitReject} disabled={actionLoading || !rejectReason.trim()}>
            {actionLoading ? 'Rejecting…' : 'Reject Listing'}
          </button>
        </div>
      </Modal>

      <ConfirmDialog
        open={!!confirmAction}
        onClose={() => setConfirmAction(null)}
        onConfirm={runConfirmedAction}
        loading={actionLoading}
        tone="danger"
        title={confirmAction?.type === 'delete' ? 'Delete Facility' : 'Suspend Facility'}
        description={
          confirmAction?.type === 'delete'
            ? `This will permanently delete "${confirmAction?.facility.name}". This cannot be undone.`
            : `"${confirmAction?.facility.name}" will be hidden from the public directory until reinstated.`
        }
        confirmLabel={confirmAction?.type === 'delete' ? 'Delete' : 'Suspend'}
      />
    </div>
  );
};
