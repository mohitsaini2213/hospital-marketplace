import { useEffect, useState } from 'react';
import * as Fa6 from 'react-icons/fa6';
import { adminService } from '@/services/adminService';
import { Spinner } from '@/components/ui/Loading';
import { useToast } from '@/context/ToastContext';

const STATUSES = ['PENDING', 'CONFIRMED', 'CANCELLED', 'COMPLETED', 'NO_SHOW'];

export const AdminAppointmentsPage = () => {
  const toast = useToast();
  const [items, setItems] = useState([]);
  const [status, setStatus] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(true);

  const load = () => {
    setLoading(true);
    adminService.listAppointments({ status: status || undefined, date: date || undefined }).then((res) => setItems(res.data || [])).catch(() => setItems([])).finally(() => setLoading(false));
  };
  useEffect(() => { load(); }, [status, date]);

  const update = async (id, nextStatus) => {
    try {
      await adminService.updateAppointmentStatus(id, { status: nextStatus });
      toast.success('Appointment updated.');
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not update appointment.');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Appointments</h1><p className="mt-1 text-sm text-[var(--color-ink-soft)]">Platform-wide appointment monitoring.</p></div>
        <div className="flex gap-2"><select className="input !w-auto" value={status} onChange={(e) => setStatus(e.target.value)}><option value="">All statuses</option>{STATUSES.map((s) => <option key={s}>{s}</option>)}</select><input type="date" className="input !w-auto" value={date} onChange={(e) => setDate(e.target.value)} /></div>
      </div>

      {loading ? <div className="flex h-64 items-center justify-center text-[var(--color-teal-600)]"><Spinner size={24} /></div> : (
        <div className="card overflow-x-auto">
          <table className="w-full min-w-[1000px] text-left text-sm">
            <thead><tr className="border-b border-[var(--color-line)] bg-[var(--color-paper-dim)]/50 text-xs uppercase tracking-wide text-[var(--color-ink-soft)]"><th className="px-4 py-3">Booking</th><th className="px-4 py-3">Facility</th><th className="px-4 py-3">Doctor</th><th className="px-4 py-3">Patient</th><th className="px-4 py-3">Date &amp; Time</th><th className="px-4 py-3">Status</th><th className="px-4 py-3">Action</th></tr></thead>
            <tbody>
              {items.map((a) => (
                <tr key={a._id} className="border-b border-[var(--color-line)] last:border-0">
                  <td className="px-4 py-3 font-mono text-xs">{a.bookingRef}</td>
                  <td className="px-4 py-3"><b>{a.facility?.name}</b><div className="text-xs text-[var(--color-ink-soft)]">{a.facility?.city}</div></td>
                  <td className="px-4 py-3">Dr. {a.doctor?.name}<div className="text-xs text-[var(--color-ink-soft)]">{a.doctor?.specialization}</div></td>
                  <td className="px-4 py-3">{a.patientName}<div className="text-xs text-[var(--color-ink-soft)]">{a.patientMobile}</div></td>
                  <td className="px-4 py-3">{a.date}<div className="text-xs text-[var(--color-ink-soft)]">{a.time}</div></td>
                  <td className="px-4 py-3"><span className="badge-pending">{a.status}</span></td>
                  <td className="px-4 py-3">
                    {a.status === 'PENDING' && <div className="flex gap-1"><button className="btn-primary !px-3 !py-1.5 text-xs" onClick={() => update(a._id, 'CONFIRMED')}>Confirm</button><button className="btn-ghost !px-2 !py-1.5 text-xs text-[var(--color-red-600)]" onClick={() => update(a._id, 'CANCELLED')}><Fa6.FaXmark /></button></div>}
                    {a.status === 'CONFIRMED' && <button className="btn-secondary !px-3 !py-1.5 text-xs" onClick={() => update(a._id, 'COMPLETED')}>Complete</button>}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {items.length === 0 && <div className="p-10 text-center text-sm text-[var(--color-ink-soft)]">No appointments found.</div>}
        </div>
      )}
    </div>
  );
};
