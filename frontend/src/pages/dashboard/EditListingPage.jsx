import { useEffect, useState } from 'react';
import { facilityService } from '@/services/facilityService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Spinner } from '@/components/ui/Loading';

export const EditListingPage = () => {
  const toast = useToast();
  const [form, setForm] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    facilityService.myListing().then((res) => setForm(res.data)).finally(() => setLoading(false));
  }, []);

  const save = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      await facilityService.updateMyListing({ name: form.name, ownerName: form.ownerName, description: form.description });
      toast.success('Listing updated successfully.');
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
      <h1 className="mb-1 text-2xl font-semibold text-[var(--color-ink)]">My Listing</h1>
      <p className="mb-6 text-sm text-[var(--color-ink-soft)]">Basic details shown on your public facility page.</p>

      <form onSubmit={save} className="card space-y-5 p-6">
        <div>
          <label className="label">Facility Name</label>
          <input className="input" value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </div>
        <div>
          <label className="label">Owner / Contact Person</label>
          <input className="input" value={form.ownerName} onChange={(e) => setForm({ ...form, ownerName: e.target.value })} />
        </div>
        <div>
          <label className="label">Description</label>
          <textarea
            rows={5}
            maxLength={1000}
            className="input"
            value={form.description || ''}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            placeholder="Tell patients about your facility, specialties, and what makes you different…"
          />
          <p className="mt-1 text-right text-xs text-[var(--color-ink-soft)]">{(form.description || '').length}/1000</p>
        </div>
        <button type="submit" disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </form>
    </div>
  );
};
