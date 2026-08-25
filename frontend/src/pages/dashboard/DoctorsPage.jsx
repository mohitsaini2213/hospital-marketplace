import { useEffect, useState } from 'react';
import * as Fa6 from 'react-icons/fa6';
import { facilityService } from '@/services/facilityService';
import { Spinner } from '@/components/ui/Loading';
import { Modal } from '@/components/ui/Modal';
import { useToast } from '@/context/ToastContext';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
const defaultAvailability = () => DAYS.map((day) => ({ day, enabled: !['Sat', 'Sun'].includes(day), start: '09:00', end: day === 'Sat' ? '13:00' : '17:00' }));

export const DoctorsPage = () => {
  const toast = useToast();
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [open, setOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({ name: '', specialization: '', qualification: '', consultationFee: '', slotDuration: 30, availability: defaultAvailability() });

  const load = () => facilityService.doctorsMine().then((res) => setDoctors(res.data || [])).finally(() => setLoading(false));
  useEffect(() => { load(); }, []);

  const openForm = (doctor = null) => {
    setEditing(doctor);
    setForm(doctor ? {
      name: doctor.name,
      specialization: doctor.specialization,
      qualification: doctor.qualification || '',
      consultationFee: doctor.consultationFee || '',
      slotDuration: doctor.slotDuration || 30,
      availability: doctor.availability?.length ? doctor.availability : defaultAvailability(),
    } : { name: '', specialization: '', qualification: '', consultationFee: '', slotDuration: 30, availability: defaultAvailability() });
    setOpen(true);
  };

  const save = async (e) => {
    e.preventDefault();
    if (!form.name.trim() || !form.specialization.trim()) return toast.error('Doctor name and specialization are required.');
    setSaving(true);
    try {
      const payload = { ...form, consultationFee: Number(form.consultationFee) || 0, slotDuration: Number(form.slotDuration) };
      if (editing) await facilityService.updateDoctor(editing._id, payload);
      else await facilityService.createDoctor(payload);
      toast.success(editing ? 'Doctor updated.' : 'Doctor added.');
      setOpen(false);
      load();
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not save doctor.');
    } finally {
      setSaving(false);
    }
  };

  const deactivate = async (doctor) => {
    if (!window.confirm(`Deactivate Dr. ${doctor.name}?`)) return;
    try {
      await facilityService.deleteDoctor(doctor._id);
      toast.success('Doctor deactivated.');
      load();
    } catch {
      toast.error('Could not deactivate doctor.');
    }
  };

  if (loading) return <div className="flex h-64 items-center justify-center text-[var(--color-teal-600)]"><Spinner size={24} /></div>;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div><h1 className="text-2xl font-semibold">Doctors</h1><p className="mt-1 text-sm text-[var(--color-ink-soft)]">Manage doctors and their online appointment schedules.</p></div>
        <button className="btn-primary" onClick={() => openForm()}><Fa6.FaUserDoctor size={14} /> Add Doctor</button>
      </div>

      {doctors.length === 0 ? (
        <div className="card p-10 text-center">
          <Fa6.FaUserDoctor className="mx-auto text-[var(--color-ink-soft)]" size={30} />
          <h2 className="mt-3 text-lg font-semibold">No doctors added yet</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Add your doctors so patients can book appointments online.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          {doctors.map((doctor) => (
            <div key={doctor._id} className="card p-5">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">Dr. {doctor.name}</h2>
                  <p className="mt-1 text-sm text-[var(--color-teal-700)]">{doctor.specialization}</p>
                  {doctor.qualification && <p className="mt-1 text-xs text-[var(--color-ink-soft)]">{doctor.qualification}</p>}
                </div>
                <span className={doctor.isActive ? 'badge-approved' : 'badge-suspended'}>{doctor.isActive ? 'Active' : 'Inactive'}</span>
              </div>
              <div className="mt-4 grid grid-cols-2 gap-2 text-xs text-[var(--color-ink-soft)]">
                <div className="rounded-lg bg-[var(--color-paper-dim)] p-2.5">Fee: <b className="text-[var(--color-ink)]">₹{doctor.consultationFee || 0}</b></div>
                <div className="rounded-lg bg-[var(--color-paper-dim)] p-2.5">Slot: <b className="text-[var(--color-ink)]">{doctor.slotDuration} min</b></div>
              </div>
              <div className="mt-4 flex gap-2">
                <button className="btn-secondary flex-1 !py-2 text-xs" onClick={() => openForm(doctor)}><Fa6.FaPen size={11} /> Edit</button>
                {doctor.isActive && <button className="btn-ghost !py-2 text-xs text-[var(--color-red-600)]" onClick={() => deactivate(doctor)}>Deactivate</button>}
              </div>
            </div>
          ))}
        </div>
      )}

      <Modal open={open} onClose={() => setOpen(false)} title={editing ? 'Edit Doctor' : 'Add Doctor'}>
        <form onSubmit={save} className="space-y-4">
          <div><label className="label">Doctor Name *</label><input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="e.g. Anjali Sharma" /></div>
          <div><label className="label">Specialization *</label><input className="input" value={form.specialization} onChange={(e) => setForm({ ...form, specialization: e.target.value })} placeholder="e.g. Cardiologist" /></div>
          <div><label className="label">Qualification</label><input className="input" value={form.qualification} onChange={(e) => setForm({ ...form, qualification: e.target.value })} placeholder="MBBS, MD" /></div>
          <div className="grid grid-cols-2 gap-3">
            <div><label className="label">Consultation Fee (₹)</label><input type="number" min="0" className="input" value={form.consultationFee} onChange={(e) => setForm({ ...form, consultationFee: e.target.value })} /></div>
            <div><label className="label">Slot Duration</label><select className="input" value={form.slotDuration} onChange={(e) => setForm({ ...form, slotDuration: e.target.value })}>{[15,20,30,45,60].map((n) => <option key={n} value={n}>{n} minutes</option>)}</select></div>
          </div>

          <div>
            <label className="label">Weekly Availability</label>
            <div className="space-y-2">
              {form.availability.map((entry, index) => (
                <div key={entry.day} className="grid grid-cols-[70px_1fr_1fr_34px] items-center gap-2 text-xs">
                  <label className="flex items-center gap-1.5 font-medium"><input type="checkbox" checked={entry.enabled} onChange={(e) => { const a = [...form.availability]; a[index] = { ...entry, enabled: e.target.checked }; setForm({ ...form, availability: a }); }} /> {entry.day}</label>
                  <input type="time" disabled={!entry.enabled} className="input !py-2" value={entry.start} onChange={(e) => { const a = [...form.availability]; a[index] = { ...entry, start: e.target.value }; setForm({ ...form, availability: a }); }} />
                  <input type="time" disabled={!entry.enabled} className="input !py-2" value={entry.end} onChange={(e) => { const a = [...form.availability]; a[index] = { ...entry, end: e.target.value }; setForm({ ...form, availability: a }); }} />
                  <span className="text-center text-[var(--color-ink-soft)]">→</span>
                </div>
              ))}
            </div>
          </div>

          <button disabled={saving} className="btn-primary w-full">{saving ? 'Saving…' : editing ? 'Save Changes' : 'Add Doctor'}</button>
        </form>
      </Modal>
    </div>
  );
};
