import { useEffect, useState } from 'react';
import { FaWandMagicSparkles } from 'react-icons/fa6';
import { facilityService } from '@/services/facilityService';
import { parseApiError } from '@/services/api';
import { useToast } from '@/context/ToastContext';
import { Spinner } from '@/components/ui/Loading';
import { isValidUrl } from '@/utils/validators';
import { WEBSITE_SERVICE_EMAIL } from '@/utils/constants';

export const WebsitePage = () => {
  const [hasWebsite, setHasWebsite] = useState(false);
  const [websiteUrl, setWebsiteUrl] = useState('');
  const [wantsWebsite, setWantsWebsite] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const toast = useToast();

  useEffect(() => {
    facilityService.myListing().then((res) => {
      setHasWebsite(!!res.data.websiteUrl);
      setWebsiteUrl(res.data.websiteUrl || '');
      setWantsWebsite(!!res.data.wantsWebsite);
    }).finally(() => setLoading(false));
  }, []);

  const save = async () => {
    if (hasWebsite && !isValidUrl(websiteUrl)) {
      setError('Enter a valid website URL (https://…).');
      return;
    }
    setError('');
    setSaving(true);
    try {
      await facilityService.updateMyListing({
        websiteUrl: hasWebsite ? websiteUrl : '',
        wantsWebsite: !hasWebsite && wantsWebsite,
      });
      toast.success('Website info updated.');
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
      <h1 className="mb-1 text-2xl font-semibold text-[var(--color-ink)]">Website</h1>
      <p className="mb-6 text-sm text-[var(--color-ink-soft)]">Manage your website details.</p>

      <div className="card space-y-5 p-6">
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
          <button
            type="button"
            onClick={() => setHasWebsite(true)}
            className={`rounded-xl border p-4 text-left text-sm font-medium ${hasWebsite ? 'border-[var(--color-teal-600)] bg-[var(--color-teal-050)] text-[var(--color-teal-700)]' : 'border-[var(--color-line)] text-[var(--color-ink-soft)]'}`}
          >
            Yes, I have a website
          </button>
          <button
            type="button"
            onClick={() => setHasWebsite(false)}
            className={`rounded-xl border p-4 text-left text-sm font-medium ${!hasWebsite ? 'border-[var(--color-teal-600)] bg-[var(--color-teal-050)] text-[var(--color-teal-700)]' : 'border-[var(--color-line)] text-[var(--color-ink-soft)]'}`}
          >
            No, I don't have one
          </button>
        </div>

        {hasWebsite ? (
          <div>
            <label className="label">Website URL</label>
            <input className={`input ${error ? 'input-error' : ''}`} value={websiteUrl} onChange={(e) => setWebsiteUrl(e.target.value)} placeholder="https://yourfacility.com" />
            {error && <p className="field-error">{error}</p>}
          </div>
        ) : (
          <div className="card border-[var(--color-sand-500)]/40 bg-[var(--color-sand-050)] p-5">
            <div className="flex items-start gap-3">
              <FaWandMagicSparkles className="mt-0.5 shrink-0 text-[var(--color-sand-700)]" size={18} />
              <div>
                <h3 className="text-sm font-semibold text-[var(--color-ink)]">Need a professional website?</h3>
                <p className="mt-1 text-sm text-[var(--color-ink-soft)]">
                  Contact <a href={`mailto:${WEBSITE_SERVICE_EMAIL}`} className="font-medium text-[var(--color-teal-700)]">{WEBSITE_SERVICE_EMAIL}</a> or request one below.
                </p>
                <label className="mt-3 flex items-center gap-2 text-sm font-medium text-[var(--color-ink)]">
                  <input type="checkbox" checked={wantsWebsite} onChange={(e) => setWantsWebsite(e.target.checked)} className="h-4 w-4 accent-[var(--color-sand-600)]" />
                  Request a website for my facility
                </label>
              </div>
            </div>
          </div>
        )}

        <button onClick={save} disabled={saving} className="btn-primary">
          {saving ? 'Saving…' : 'Save Changes'}
        </button>
      </div>
    </div>
  );
};
