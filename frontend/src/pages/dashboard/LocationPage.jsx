import { useEffect, useState } from 'react';
import { facilityService } from '@/services/facilityService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Spinner } from '@/components/ui/Loading';
import { LocationPicker } from '@/components/map/LocationPicker';
import { isValidPincode } from '@/utils/validators';

export const LocationPage = () => {
  const [form, setForm] = useState(null);
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    facilityService.myListing().then((res) => setForm(res.data)).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    const errs = {};
    if (!form.address?.trim()) errs.address = 'Address is required.';
    if (!isValidPincode(form.pincode)) errs.pincode = 'Enter a valid 6-digit pincode.';
    setErrors(errs);
    if (Object.keys(errs).length) return;

    setSaving(true);
    try {
      await facilityService.updateMyListing({
        address: form.address,
        locality: form.locality,
        city: form.city,
        state: form.state,
        pincode: form.pincode,
        latitude: form.latitude,
        longitude: form.longitude,
      });
      toast.success('Location updated.');
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading || !form) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-teal-600)]">
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-[var(--color-ink)]">Location</h1>
      <p className="mb-6 text-sm text-[var(--color-ink-soft)]">Keep your address and map pin accurate.</p>

      <div className="card space-y-5 p-6">
        <div>
          <label className="label">Address</label>
          <input className={`input ${errors.address ? 'input-error' : ''}`} value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} />
          {errors.address && <p className="field-error">{errors.address}</p>}
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="label">Area / Locality</label>
            <input className="input" value={form.locality || ''} onChange={(e) => setForm({ ...form, locality: e.target.value })} />
          </div>
          <div>
            <label className="label">Pincode</label>
            <input className={`input ${errors.pincode ? 'input-error' : ''}`} value={form.pincode} onChange={(e) => setForm({ ...form, pincode: e.target.value.replace(/\D/g, '').slice(0, 6) })} />
            {errors.pincode && <p className="field-error">{errors.pincode}</p>}
          </div>
          <div>
            <label className="label">City</label>
            <input className="input" value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} />
          </div>
          <div>
            <label className="label">State</label>
            <input className="input" value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} />
          </div>
        </div>

        <div>
          <label className="label">Map Location</label>
          <LocationPicker
            latitude={form.latitude}
            longitude={form.longitude}
            address={form.resolvedAddress}
            onChange={(next) => setForm({ ...form, ...next })}
          />
        </div>

        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
