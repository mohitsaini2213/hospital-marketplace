import { useEffect, useMemo, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import * as Fa6 from 'react-icons/fa6';
import { facilityService } from '@/services/facilityService';
import { Spinner } from '@/components/ui/Loading';
import { useToast } from '@/context/ToastContext';

const todayIndia = () =>
  new Intl.DateTimeFormat('en-CA', { timeZone: 'Asia/Kolkata' }).format(new Date());

export const BookAppointmentPage = () => {
  const { idOrSlug } = useParams();
  const navigate = useNavigate();
  const toast = useToast();

  const [facility, setFacility] = useState(null);
  const [doctors, setDoctors] = useState([]);
  const [doctorId, setDoctorId] = useState('');
  const [date, setDate] = useState(todayIndia());
  const [slots, setSlots] = useState([]);
  const [time, setTime] = useState('');
  const [form, setForm] = useState({ patientName: '', patientMobile: '', patientEmail: '', reason: '' });
  const [loading, setLoading] = useState(true);
  const [slotsLoading, setSlotsLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState(null);

  useEffect(() => {
    (async () => {
      try {
        const facilityRes = await facilityService.get(idOrSlug);
        setFacility(facilityRes.data);
        const doctorRes = await facilityService.doctors(facilityRes.data._id);
        setDoctors(doctorRes.data || []);
        if (doctorRes.data?.length) setDoctorId(doctorRes.data[0]._id);
      } catch {
        toast.error('Unable to load appointment information.');
      } finally {
        setLoading(false);
      }
    })();
  }, [idOrSlug]);

  useEffect(() => {
    if (!facility?._id || !doctorId || !date) return;
    setSlotsLoading(true);
    setTime('');
    facilityService
      .appointmentSlots(facility._id, { doctorId, date })
      .then((res) => setSlots(res.data || []))
      .catch(() => setSlots([]))
      .finally(() => setSlotsLoading(false));
  }, [facility?._id, doctorId, date]);

  const selectedDoctor = useMemo(() => doctors.find((d) => d._id === doctorId), [doctors, doctorId]);

  const submit = async (e) => {
    e.preventDefault();
    if (!doctorId || !time) {
      toast.error('Please select a doctor and available time.');
      return;
    }
    setSubmitting(true);
    try {
      const res = await facilityService.bookAppointment(facility._id, { doctorId, date, time, ...form });
      setResult(res.data);
    } catch (err) {
      toast.error(err?.response?.data?.message || 'Could not book this appointment.');
      // Refresh slots after a conflict.
      const res = await facilityService.appointmentSlots(facility._id, { doctorId, date }).catch(() => ({ data: [] }));
      setSlots(res.data || []);
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return <div className="flex min-h-[55vh] items-center justify-center text-[var(--color-teal-600)]"><Spinner size={28} /></div>;
  }

  if (!facility) {
    return <div className="container-page py-16 text-center"><h1 className="text-2xl font-semibold">Facility not found</h1><Link to="/directory" className="btn-primary mt-5">Back to Directory</Link></div>;
  }

  if (result) {
    return (
      <div className="container-page flex min-h-[65vh] items-center justify-center py-12">
        <div className="card w-full max-w-lg p-8 text-center">
          <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-[var(--color-teal-050)] text-[var(--color-teal-600)]">
            <Fa6.FaCalendarCheck size={26} />
          </div>
          <h1 className="text-2xl font-semibold">Appointment request submitted</h1>
          <p className="mt-2 text-sm text-[var(--color-ink-soft)]">
            Your request at <b>{facility.name}</b> is pending confirmation.
          </p>
          <div className="mt-5 rounded-xl bg-[var(--color-paper-dim)] p-4 text-left text-sm">
            <p><b>Booking ID:</b> {result.bookingRef}</p>
            <p className="mt-1"><b>Doctor:</b> Dr. {result.doctor?.name}</p>
            <p className="mt-1"><b>Date &amp; time:</b> {result.date} at {result.time}</p>
          </div>
          <button onClick={() => navigate(`/facility/${facility.slug || facility._id}`)} className="btn-primary mt-6 w-full">
            Back to Facility
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container-page max-w-3xl py-10">
      <Link to={`/facility/${facility.slug || facility._id}`} className="mb-5 inline-flex items-center gap-2 text-sm font-medium text-[var(--color-teal-700)] hover:underline">
        <Fa6.FaArrowLeft size={12} /> Back to {facility.name}
      </Link>

      <div className="mb-7">
        <span className="eyebrow"><Fa6.FaCalendarCheck size={11} /> Hospital Appointment System</span>
        <h1 className="mt-2 text-3xl font-semibold">Book an Appointment</h1>
        <p className="mt-1 text-sm text-[var(--color-ink-soft)]">{facility.name} · {facility.city}</p>
      </div>

      {doctors.length === 0 ? (
        <div className="card p-8 text-center">
          <Fa6.FaUserDoctor className="mx-auto text-[var(--color-ink-soft)]" size={30} />
          <h2 className="mt-3 text-lg font-semibold">Online appointments are not available yet</h2>
          <p className="mt-1 text-sm text-[var(--color-ink-soft)]">Please contact the facility directly to book a visit.</p>
          {facility.mobile1 && <a href={`tel:${facility.mobile1}`} className="btn-primary mt-5">Call {facility.mobile1}</a>}
        </div>
      ) : (
        <form onSubmit={submit} className="card space-y-6 p-6 sm:p-8">
          <div>
            <label className="label">Choose Doctor</label>
            <select className="input" value={doctorId} onChange={(e) => setDoctorId(e.target.value)}>
              {doctors.map((doctor) => (
                <option key={doctor._id} value={doctor._id}>
                  Dr. {doctor.name} — {doctor.specialization}
                </option>
              ))}
            </select>
            {selectedDoctor && (
              <p className="mt-2 text-xs text-[var(--color-ink-soft)]">
                {selectedDoctor.qualification || 'Specialist'} {selectedDoctor.consultationFee > 0 ? `· Consultation ₹${selectedDoctor.consultationFee}` : ''}
              </p>
            )}
          </div>

          <div>
            <label className="label">Appointment Date</label>
            <input type="date" min={todayIndia()} className="input" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div>
            <label className="label">Available Time</label>
            {slotsLoading ? (
              <div className="flex h-20 items-center justify-center text-[var(--color-teal-600)]"><Spinner size={22} /></div>
            ) : slots.length ? (
              <div className="grid grid-cols-3 gap-2 sm:grid-cols-5">
                {slots.map((slot) => (
                  <button
                    type="button"
                    key={slot}
                    onClick={() => setTime(slot)}
                    className={`rounded-lg border px-2 py-2.5 text-sm font-medium transition-colors ${time === slot ? 'border-[var(--color-teal-600)] bg-[var(--color-teal-050)] text-[var(--color-teal-700)]' : 'border-[var(--color-line)] text-[var(--color-ink-soft)] hover:border-[var(--color-teal-600)]/50'}`}
                  >
                    {slot}
                  </button>
                ))}
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[var(--color-line)] p-4 text-sm text-[var(--color-ink-soft)]">
                No slots are available for this date. Try another date.
              </div>
            )}
          </div>

          <div className="border-t border-[var(--color-line)] pt-6">
            <h2 className="text-base font-semibold">Patient Details</h2>
            <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div><label className="label">Patient Name *</label><input required className="input" value={form.patientName} onChange={(e) => setForm({ ...form, patientName: e.target.value })} placeholder="Full name" /></div>
              <div><label className="label">Mobile Number *</label><input required inputMode="numeric" className="input" value={form.patientMobile} onChange={(e) => setForm({ ...form, patientMobile: e.target.value })} placeholder="10-digit mobile" /></div>
              <div><label className="label">Email (optional)</label><input type="email" className="input" value={form.patientEmail} onChange={(e) => setForm({ ...form, patientEmail: e.target.value })} placeholder="you@example.com" /></div>
              <div><label className="label">Reason for Visit (optional)</label><input className="input" value={form.reason} onChange={(e) => setForm({ ...form, reason: e.target.value })} placeholder="e.g. Follow-up consultation" /></div>
            </div>
          </div>

          <button type="submit" disabled={submitting || !time} className="btn-primary w-full">
            <Fa6.FaCalendarCheck size={14} /> {submitting ? 'Submitting…' : 'Request Appointment'}
          </button>
          <p className="text-center text-xs text-[var(--color-ink-soft)]">
            Your appointment is requested first. The facility will confirm it before your visit.
          </p>
        </form>
      )}
    </div>
  );
};
