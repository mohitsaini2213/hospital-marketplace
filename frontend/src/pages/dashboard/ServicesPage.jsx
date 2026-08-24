import { useEffect, useState } from 'react';
import { FaPlus, FaXmark } from 'react-icons/fa6';
import { facilityService } from '@/services/facilityService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Spinner } from '@/components/ui/Loading';

export const ServicesPage = () => {
  const [services, setServices] = useState([]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    facilityService.myListing().then((res) => setServices(res.data.services || [])).finally(() => setLoading(false));
  }, []);

  const addService = (e) => {
    e.preventDefault();
    const value = input.trim();
    if (!value) return;
    if (services.includes(value)) {
      toast.error('This service is already listed.');
      return;
    }
    setServices((s) => [...s, value]);
    setInput('');
  };

  const removeService = (value) => setServices((s) => s.filter((x) => x !== value));

  const save = async () => {
    setSaving(true);
    try {
      await facilityService.updateMyListing({ services });
      toast.success('Services updated.');
    } catch (err) {
      toast.error(parseApiError(err).message);
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center text-[var(--color-teal-600)]">
        <Spinner size={24} />
      </div>
    );
  }

  return (
    <div className="max-w-2xl">
      <h1 className="mb-1 text-2xl font-semibold text-[var(--color-ink)]">Services</h1>
      <p className="mb-6 text-sm text-[var(--color-ink-soft)]">List the services your facility offers.</p>

      <div className="card p-6">
        <form onSubmit={addService} className="flex gap-2">
          <input value={input} onChange={(e) => setInput(e.target.value)} placeholder="e.g. Emergency Care, X-Ray, Dental Surgery" className="input" />
          <button type="submit" className="btn-secondary shrink-0">
            <FaPlus size={13} /> Add
          </button>
        </form>

        <div className="mt-4 flex flex-wrap gap-2">
          {services.length === 0 && <p className="text-sm text-[var(--color-ink-soft)]">No services added yet.</p>}
          {services.map((s) => (
            <span key={s} className="flex items-center gap-2 rounded-full bg-[var(--color-teal-050)] px-3 py-1.5 text-xs font-medium text-[var(--color-teal-700)]">
              {s}
              <button onClick={() => removeService(s)} aria-label={`Remove ${s}`}>
                <FaXmark size={11} />
              </button>
            </span>
          ))}
        </div>

        <button onClick={save} disabled={saving} className="btn-primary mt-6">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
