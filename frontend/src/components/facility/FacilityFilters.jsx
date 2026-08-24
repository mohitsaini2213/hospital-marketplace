import { FACILITY_TYPES } from '@/utils/constants';

export const FacilityFilters = ({ filters, onChange, resultCount }) => {
  const set = (key, value) => onChange({ ...filters, [key]: value });

  return (
    <div className="card space-y-6 p-5">
      <div>
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Facility Type</h3>
        <div className="space-y-1.5">
          <label className="flex items-center gap-2.5 text-sm text-[var(--color-ink-soft)]">
            <input type="radio" name="type" checked={!filters.type} onChange={() => set('type', '')} className="accent-[var(--color-teal-600)]" />
            All types
          </label>
          {FACILITY_TYPES.map((t) => (
            <label key={t} className="flex items-center gap-2.5 text-sm text-[var(--color-ink-soft)]">
              <input
                type="radio"
                name="type"
                checked={filters.type === t}
                onChange={() => set('type', t)}
                className="accent-[var(--color-teal-600)]"
              />
              {t}
            </label>
          ))}
        </div>
      </div>

      <div className="border-t border-[var(--color-line)] pt-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Sort By</h3>
        <select value={filters.sort || 'relevance'} onChange={(e) => set('sort', e.target.value)} className="input">
          <option value="relevance">Relevance</option>
          <option value="rating">Highest Rated</option>
          <option value="newest">Newest</option>
        </select>
      </div>

      <div className="border-t border-[var(--color-line)] pt-5">
        <h3 className="mb-3 text-sm font-semibold text-[var(--color-ink)]">Locality</h3>
        <input
          value={filters.locality || ''}
          onChange={(e) => set('locality', e.target.value)}
          placeholder="e.g. Company Bagh"
          className="input"
        />
      </div>

      <div className="border-t border-[var(--color-line)] pt-5 text-xs text-[var(--color-ink-soft)]">
        {resultCount != null && <>{resultCount} facilit{resultCount === 1 ? 'y' : 'ies'} found</>}
      </div>
    </div>
  );
};
