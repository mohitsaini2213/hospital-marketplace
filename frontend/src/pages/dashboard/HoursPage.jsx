import { useEffect, useState } from 'react';
import { facilityService } from '@/services/facilityService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Spinner } from '@/components/ui/Loading';
import { DAYS } from '@/utils/constants';

const defaultHours = () => DAYS.map((day) => ({ day, open: '09:00', close: '21:00', closed: day === 'Sun' }));

export const HoursPage = () => {
  const [hours, setHours] = useState(defaultHours());
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    facilityService.myListing().then((res) => {
      const existing = res.data.openingHours;
      if (existing?.length) setHours(DAYS.map((day) => existing.find((h) => h.day === day) || { day, open: '09:00', close: '21:00', closed: true }));
    }).finally(() => setLoading(false));
  }, []);

  const update = (day, patch) => setHours((h) => h.map((entry) => (entry.day === day ? { ...entry, ...patch } : entry)));

  const save = async () => {
    setSaving(true);
    try {
      await facilityService.updateMyListing({ openingHours: hours });
      toast.success('Opening hours updated.');
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
      <h1 className="mb-1 text-2xl font-semibold text-[var(--color-ink)]">Opening Hours</h1>
      <p className="mb-6 text-sm text-[var(--color-ink-soft)]">Let patients know when you're open.</p>

      <div className="card divide-y divide-[var(--color-line)] p-1">
        {hours.map((entry) => (
          <div key={entry.day} className="flex flex-wrap items-center gap-3 px-4 py-3">
            <span className="w-12 shrink-0 text-sm font-medium text-[var(--color-ink)]">{entry.day}</span>
            <label className="flex items-center gap-1.5 text-xs text-[var(--color-ink-soft)]">
              <input type="checkbox" checked={!entry.closed} onChange={(e) => update(entry.day, { closed: !e.target.checked })} className="accent-[var(--color-teal-600)]" />
              Open
            </label>
            {!entry.closed && (
              <>
                <input type="time" value={entry.open} onChange={(e) => update(entry.day, { open: e.target.value })} className="input !w-28 !py-1.5" />
                <span className="text-xs text-[var(--color-ink-soft)]">to</span>
                <input type="time" value={entry.close} onChange={(e) => update(entry.day, { close: e.target.value })} className="input !w-28 !py-1.5" />
              </>
            )}
          </div>
        ))}
      </div>

      <button onClick={save} disabled={saving} className="btn-primary mt-6">
        {saving ? 'Saving…' : 'Save Changes'}
      </button>
    </div>
  );
};
