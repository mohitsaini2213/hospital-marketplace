import { useEffect, useState } from 'react';
import * as Fa6 from 'react-icons/fa6';
import { facilityService } from '@/services/facilityService';
import { Spinner } from '@/components/ui/Loading';
import { useToast } from '@/context/ToastContext';

const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];

const badgeClass = (status) => ({
  PENDING: 'badge-pending',
  CONFIRMED: 'badge-approved',
  CANCELLED: 'badge-rejected',
  COMPLETED: 'badge-approved',
  NO_SHOW: 'badge-suspended',
}[status] || 'badge-suspended');

export const AppointmentsPage = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    facilityService.appointmentsMine({ status: status || undefined, date: date || undefined }).then((res) => setItems(res.data || [])).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [status, date]);

  const update = async (id, nextStatus) => {
    try {
      await facilityService.updateAppointmentStatus(id, { status: nextStatus });
      toast.success(`Appointment marked ${nextStatus.toLowerCase()}.`);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update appointment.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Appointments</h1><p className="mt-1 text-sm text-[var(--color-ink-soft)]">Review and manage patient appointment requests.</p></div>
        <div className="flex gap-2">
          <select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}</select>
          <input type="date" className="input !w-auto" value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
      </div>

      {loading ? <div className="flex h-64 items-center justify-center text-[var(--color-teal-600)]"><Spinner size={24} /></div> : items.length === 0 ? (
        <div className="card p-10 text-center"><Fa6.FaCalendarXmark className="mx-auto text-[var(--color-ink-soft)]" size={28} /><h2 className="mt-3 font-semibold">No appointments found</h2><p className="mt-1 text-sm text-[var(--color-ink-soft)]">New online appointment requests will appear here.</p></div>
      ) : (
        <div className="space-y-3">
          {items.map((a) => (
            <div key={a._id} className="card p-5">
              <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2"><span className={badgeClass(a.status)}>{a.status}</span><span className="font-mono text-xs text-[var(--color-ink-soft)]">{a.bookingRef}</span></div>
                  <h2 className="mt-2 font-semibold">{a.patientName}</h2>
                  <p className="mt-1 text-sm text-[var(--color-teal-700)]">Dr. {a.doctor?.name} · {a.doctor?.specialization}</p>
                  <p className="mt-1 text-sm text-[var(--color-ink-soft)]"><Fa6.FaCalendarDay className="mr-1 inline" size={12} /> {a.date} at {a.time} · {a.patientMobile}{a.patientEmail ? ` · ${a.patientEmail}` : ''}</p>
                  {a.reason && <p className="mt-2 text-xs text-[var(--color-ink-soft)]">Reason: {a.reason}</p>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {a.status === 'PENDING' && <><button className="btn-primary !py-2 text-xs" onClick={() => update(a._id, 'CONFIRMED')}>Confirm</button><button className="btn-secondary !py-2 text-xs" onClick={() => update(a._id, 'CANCELLED')}>Decline</button></>}
                  {a.status === 'CONFIRMED' && <><button className="btn-primary !py-2 text-xs" onClick={() => update(a._id, 'COMPLETED')}>Completed</button><button className="btn-ghost !py-2 text-xs text-[var(--color-red-600)]" onClick={() => update(a._id, 'CANCELLED')}>Cancel</button></>}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
